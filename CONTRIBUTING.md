# Contributing to website

This is ewancroft.uk: a personal website and blog built with SvelteKit, with an AT Protocol-native publishing stack around [Standard.site](https://standard.site/) and [Leaflet](https://leaflet.pub/). Thanks for wanting to help!

The site owns the presentation layer; AT Protocol records own the publication and document data. There are no posts-as-local-Markdown to edit: content work means changing how records are rendered, not editing copy in this repo.

## Getting started

```sh
pnpm install
pnpm dev
```

Node 24.x and pnpm match the rest of ewan's monorepo ([pkgs](https://github.com/ewanc26/pkgs)). CI runs on every push; Vercel deploys `main`.

## Notes for this project

- Leaflet documents render as structured content blocks with dedicated Svelte components, with Markdown retained as a compatibility fallback. Changes should respect both paths.
- Facets are UTF-8 byte-indexed: formatting, links, mentions, highlights and footnotes all depend on byte offsets, so test with multibyte text before assuming a facet change works.
- Blog URLs are date-based (`/blog/:year/:month/:day/:slug`) and derived from publication data; don't introduce routing that diverges from the records.
- The site is privacy-minimal by design: no first-party cookies, no analytics services. Keep it that way, including in dependencies you add.
- Conventional commits (`feat:`, `fix:`, `docs:`, …); focused PRs; say how you verified.
- AI-assisted PRs welcome; stand behind every line and run the build yourself.

## Licence

AGPL-3.0 (see [LICENSE](LICENSE)). Contributions accepted under the same terms.