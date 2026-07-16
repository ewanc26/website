# AGENTS.md

Guidance for ewancroft.uk, a SvelteKit 2/Svelte 5 site deployed to Vercel's Node 24 runtime. Content is primarily read live from Ewan's AT Protocol repository; the site also receives supporter webhooks that write records using a private app password.

## Runtime map

- `src/routes/` owns the home/about/blog/project/meta/support pages, public JSON APIs, `.well-known` identity/publication responses, Ko-fi and GitHub Sponsors webhooks, and dynamic Satori/resvg-wasm Open Graph images.
- `src/lib/services/atproto/` wraps `@ewanc26/atproto` and adds DID resolution, subscriptions, recommendations, comments, and Constellation backlinks. `PUBLIC_ATPROTO_DID` is the repository authority; `PUBLIC_LEAFLET_BLOG_PUBLICATION` filters the blog.
- `src/lib/providers/` converts Markdown/MDAST and Leaflet block/facet unions in both directions. `components/leaflet/` renders rich remote blocks; blog date routes serialize blocks and also build fallback Markdown HTML.
- `src/lib/server/bridgeAtprotoEnv.ts` copies SvelteKit private credentials into `process.env` for `@ewanc26/supporters`; only webhook request paths may invoke it. `src/lib/services/github.ts` uses a private GraphQL token when present and falls back to parsing the public profile.
- `src/hooks.server.js` injects Sabbat-derived CSS before hydration. `DESIGN.md`, design tokens/styles, seasonal components, and licensed fonts/assets define the visual system; there is no `.impeccable.md` in this repository.

## Content and protocol invariants

- Preserve stable canonical blog URLs (`/blog/YYYY/MM/DD/slug`), publication/rkey identity, timestamps/timezone behavior, metadata, `.well-known` values, sitemap/robots, and redirects. Do not derive a new slug/date scheme without a migration and redirects.
- DIDs identify repositories and handles are mutable. Validate DID document IDs and `#atproto_pds` services rather than selecting `service[0]`; constrain HTTPS endpoints, redirects, DNS/private targets, response sizes, cursors, record schemas, AT URIs, CIDs, and blob URLs.
- Remote Markdown, Leaflet blocks/facets, profiles, comments, themes, embeds, links, and images are untrusted. `renderMarkdown` currently returns unsanitized HTML during SSR and that HTML is inserted with `{@html}`; hydration-time DOMPurify is not an XSS boundary. Any renderer change must sanitize identically before server output and in the browser, with safe URL schemes and embed policies.
- Preserve UTF-8 byte facet offsets and round-trip loss reporting. Converting unsupported Leaflet blocks to Markdown is intentionally lossy; do not silently claim or store a faithful conversion.
- Subscription/recommendation/backlink aggregation fans out to remote DIDs/PDSes and Constellation. Bound pagination, concurrency, payloads, timeouts, cache keys/TTL, and per-record failures. Never cache one DID's mutable identity/PDS mapping as another's.

## Webhooks, APIs, and secrets

- Ko-fi and GitHub webhook signatures must be verified from the raw request before any write. Respect private supporters, make delivery/message IDs replay-safe, and return success only when the intended durable AT Protocol event exists or an intentional privacy/pending skip occurred.
- Current webhook logs include public donor/sponsor names, tiers, delivery IDs, timestamps, and shop codes. Treat these as personal data; do not add payloads, messages, secrets, signatures, app passwords, JWTs, or private supporter details to logs.
- `ATPROTO_APP_PASSWORD`, `KOFI_VERIFICATION_TOKEN`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_TOKEN`, and any future server credential are private. `PUBLIC_*` values are bundled. Keep `.env.example` and README accurate without inserting real values; note that the current examples omit several webhook/write variables.
- Public endpoints must validate/query-cap inputs, avoid leaking upstream error bodies or credentials, and set caching that matches data mutability. OG text is bounded, but font/WASM initialization, CPU/memory cost, cache cardinality, and error responses still need abuse testing.

## UI and working conventions

- Reuse the OKLCH tokens and existing components. Keep the “traditional meets technical” register, Sabbat/seasonal behavior, responsive layout, semantic headings/links/buttons, visible focus, reduced motion, contrast, and minimal client JavaScript.
- The supported workflow is pnpm (`vercel.json` and README), with `pnpm-lock.yaml`. A `package-lock.json` is also tracked; do not regenerate or reconcile either lockfile incidentally, and only update the lockfile for the intentionally used manager.
- Dependencies are broadly pinned to `latest`; any install can create major-version churn. Review manifest and lock diff carefully and do not perform opportunistic upgrades.

## Validation

- Run `pnpm check` and `pnpm build`, then `pnpm preview`. There is no lint script or automated test suite; add focused tests for protocol parsing, content sanitization, or webhook replay/signature behavior when changing them.
- Exercise SSR with scripts enabled and disabled, all blog content unions and malformed HTML/URLs, date/direct/404 routes, comments/backlinks, partial PDS failures, pagination, APIs, `.well-known`, both GitHub project paths, webhook invalid/valid/replayed/private events using synthetic payloads, and OG limits/concurrency.
- Visually test fonts, seasonal themes, dark/light and wolf modes, mobile widths, keyboard/screen-reader paths, contrast, reduced motion, and slow networks. Do not invoke a real webhook or PDS write as routine validation.
- Never commit `.env*`, tokens, webhook payloads, supporter/subscriber data, fetched records, `.svelte-kit/`, Vercel output, generated images, or unrelated font/assets/build files.
