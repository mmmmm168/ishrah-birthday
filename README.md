# YAHYA-BIRTHDAY

## Shared mystery-gift opened counter

The mystery-gift total is shared between browsers using a Cloudflare Worker and
a Durable Object. Deploy the counter once before publishing the page:

1. Install Node.js, then run `npx wrangler login` from this repository.
2. Deploy the counter with
   `npx wrangler deploy --config gift-counter/wrangler.toml`.
3. Copy the `workers.dev` URL printed by Wrangler and replace
   `YOUR_ACCOUNT_SUBDOMAIN` in `gift-counter-config.js` with your Cloudflare
   account's Workers subdomain.
4. The default allowed website origin is `https://mmmmm168.github.io`. If the
   page is served from a different domain, update `ALLOWED_ORIGINS` in
   `gift-counter/wrangler.toml` to that site's origin and deploy the Worker
   again.

Each page session can still open only one gift. Successful opens from all
browsers increment the same persistent total; the displayed count refreshes
while the page is open.