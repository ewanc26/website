# Website

A personal website and blog built with [SvelteKit](https://svelte.dev/docs/kit), with an AT Protocol-native publishing stack built around [Standard.site](https://standard.site/) and [Leaflet](https://leaflet.pub/).

The site owns the presentation layer while AT Protocol records provide the publication and document data. Native Leaflet documents are rendered as structured content blocks, with Markdown retained as a compatibility fallback.

## Features

- **AT Protocol-native blog**: Discover publications and documents from the configured AT Protocol DID rather than storing posts as local Markdown files
- **Standard.site publications**: Blog documents are associated with a Standard.site publication record
- **Leaflet rendering**: Native `pub.leaflet.blocks.*` content is serialised and rendered with dedicated Svelte components
- **Rich text facets**: UTF-8 byte-indexed facets support formatting, links, mentions, IDs, code, highlights, and footnotes
- **Embedded records**: Leaflet references to posts and publications can be hydrated from AT Protocol records and rendered in context
- **Markdown compatibility**: Leaflet content can also be converted to Markdown and rendered for older or non-JavaScript clients
- **Date-based routing**: Blog posts use `/blog/:year/:month/:day/:slug` URLs derived from publication date and title
- **Caching**: Blog listings and individual posts use public cache headers with stale-while-revalidate behaviour
- **AT Protocol integration**: Bluesky profiles, posts, mentions, comments, recommendations, and other AT Protocol data
- **Project showcase**: Display pinned repositories from a GitHub profile
- **Social features**: Comments and share buttons
- **API endpoints**: REST endpoints for blog, recommendations, and subscriptions
- **Webhooks**: GitHub webhook support
- **Open Graph**: Dynamic social sharing metadata and OG image generation
- **Responsive design**: Tailwind CSS with mobile-first styling

## How the blog works

The blog is not a conventional Markdown-file blog. Its authoritative content lives in AT Protocol records.

```
Standard.site / Leaflet records
          ↓
AT Protocol / configured DID
          ↓
@ewanc26/atproto
          ↓
SvelteKit server load functions
          ↓
Vercel/public HTTP cache
          ↓
Leaflet serialisation
          ↓
LeafletBlocks + LeafletFacets
          ↓
Website presentation
```

The blog index fetches documents and publications, identifies the configured blog publication, filters its documents, sorts them newest-first, and exposes the first page of posts.

Individual post routes resolve the URL against the publication's documents. When a document contains native Leaflet content, the server serialises its pages and blocks, hydrates referenced AT Protocol records, and passes the structured result to `LeafletBlocks.svelte`. The page also produces a Markdown representation as a compatibility path.

The main renderer is `src/lib/components/leaflet/LeafletBlocks.svelte`. It handles text, images, embeds, references, post/publication cards, post lists, polls, sign-up blocks, membership delimiters, nested pages, canvas content, footnotes, and unsupported-block fallbacks.

`src/lib/components/leaflet/LeafletFacets.svelte` handles rich-text facets using UTF-8 byte offsets rather than JavaScript character offsets. This is important for correctly interpreting AT Protocol text data containing non-ASCII characters.

### Caching

The blog listing uses:

```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

Individual posts use:

```
Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
```

This keeps the site responsive without requiring every request to re-fetch the publication and document records.

## Tech Stack

- **Framework**: [SvelteKit](https://svelte.dev/docs/kit)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Publishing/data model**: AT Protocol + Standard.site
- **Document model**: Leaflet-compatible structured blocks
- **Markdown**: MDAST-based processing
- **Social**: AT Protocol SDK / Bluesky integration
- **Deployment**: [Vercel](https://vercel.com/)

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── leaflet/        # Native Leaflet block and facet renderers
│   │   └── icons/          # SVG icon components
│   ├── providers/          # Content providers, serialisation, Markdown
│   ├── services/
│   │   └── atproto/        # AT Protocol data fetching and agents
│   ├── styles/             # Global CSS and design tokens
│   └── utils/              # Utility functions
└── routes/
    ├── blog/               # Blog listing and date/slug post pages
    ├── projects/           # Project showcase
    ├── api/                # API endpoints
    └── webhook/            # Webhook handlers
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```sh
pnpm install
```

### Development

```sh
pnpm run dev

# Open in browser
pnpm run dev -- --open
```

The site will be available at `http://localhost:5173`.

### Building

```sh
pnpm run build
pnpm run preview
```

## Environment Variables

The blog requires the AT Protocol DID and the publication record to be configured through public environment variables:

```env
PUBLIC_ATPROTO_DID=did:plc:...
PUBLIC_LEAFLET_BLOG_PUBLICATION=...
```

Other integrations may require additional environment variables. See the source configuration and deployment environment for the current set.

## Configuration

- **Site configuration**: [src/lib/config.ts](src/lib/config.ts)
- **Vite configuration**: [vite.config.ts](vite.config.ts)
- **Svelte configuration**: [svelte.config.js](svelte.config.js)

## Deployment

The project is configured for deployment on [Vercel](https://vercel.com/) (see [vercel.json](vercel.json)).

```sh
pnpm run build
vercel
```

## Contributing

Contributions are welcome. Please submit a Pull Request with a focused change and enough context to review it.

## Support

If you find this project useful, consider supporting its development:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/ewancroft)
[![GitHub Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-30363D?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/ewanc26)

## License

See LICENSE file for details.

## Star History

<a href="https://www.star-history.com/?repos=ewanc26%2Fwebsite&type=date&legend=bottom-right">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=ewanc26/website&type=date&theme=dark&legend=bottom-right" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=ewanc26/website&type=date&legend=bottom-right" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=ewanc26/website&type=date&legend=bottom-right" />
 </picture>
</a>
