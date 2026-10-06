export class GiftCounter {
    constructor(state) {
        this.state = state;
        this.state.storage.sql.exec(
            "CREATE TABLE IF NOT EXISTS gift_opens (id INTEGER PRIMARY KEY CHECK (id = 1), count INTEGER NOT NULL)"
        );
        this.state.storage.sql.exec(
            "INSERT OR IGNORE INTO gift_opens (id, count) VALUES (1, 0)"
        );
    }

    async fetch(request) {
        const url = new URL(request.url);

        if (request.method === "GET" && url.pathname === "/count") {
            const row = this.state.storage.sql
                .exec("SELECT count FROM gift_opens WHERE id = 1")
                .toArray()[0];

            return Response.json(
                { count: row.count },
                { headers: { "Cache-Control": "no-store" } }
            );
        }

        if (request.method === "POST" && url.pathname === "/open") {
            const row = this.state.storage.sql
                .exec(
                    "UPDATE gift_opens SET count = count + 1 WHERE id = 1 RETURNING count"
                )
                .toArray()[0];

            return Response.json(
                { count: row.count },
                { headers: { "Cache-Control": "no-store" } }
            );
        }

        return new Response("Not found", { status: 404 });
    }
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin");
        const allowedOrigins = (env.ALLOWED_ORIGINS || "")
            .split(",")
            .map(value => value.trim())
            .filter(Boolean);

        if (!origin || !allowedOrigins.includes(origin)) {
            return new Response("Origin not allowed", { status: 403 });
        }

        const corsHeaders = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "no-store",
            "Vary": "Origin"
        };

        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        const url = new URL(request.url);
        if (
            (request.method !== "GET" || url.pathname !== "/count") &&
            (request.method !== "POST" || url.pathname !== "/open")
        ) {
            return new Response("Not found", {
                status: 404,
                headers: corsHeaders
            });
        }

        const id = env.COUNTER.idFromName("global-gift-opens");
        const counter = env.COUNTER.get(id);

        const response = await counter.fetch(
            new Request("https://gift-counter.internal"+url.pathname, {
                method: request.method
            })
        );

        const responseHeaders = new Headers(response.headers);
        for (const [name, value] of Object.entries(corsHeaders)) {
            responseHeaders.set(name, value);
        }

        return new Response(response.body, {
            status: response.status,
            headers: responseHeaders
        });
    }
};
