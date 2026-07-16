# AGENTS.md

Guidance for agents working on the personal SvelteKit website and blog.

## Architecture

- `src/routes/` owns pages, blog routes, APIs, webhooks, dynamic Open Graph output, subscriptions, and recommendations.
- `src/lib/` contains Markdown/Leaflet rendering, AT Protocol integration, reusable components, and content utilities.
- `static/` contains fonts and public assets; preserve licensing and loading performance.
- `DESIGN.md` and `.impeccable.md` are the visual authorities.

## Rules

- Preserve stable blog URLs, dates, metadata, feeds, and content rendering.
- Keep webhook secrets, AT Protocol credentials, and subscription data server-side; verify webhook signatures before acting.
- Sanitize untrusted Markdown/Leaflet/Bluesky content and proxy/fetch external resources with bounds.
- Reuse design tokens/components, maintain responsive accessibility, and avoid shipping unnecessary client JavaScript.
- Use the existing lockfile/package-manager convention and avoid unrelated font/asset churn.

## Validation

Run `npm run check` and `npm run build`, then preview production output. Test home/blog/direct routes, Markdown components, external embeds, comments, APIs, webhook rejection, OG images, 404s, fonts, mobile widths, keyboard navigation, dark mode, and reduced motion. Never commit `.env`, subscriber data, or build output.
