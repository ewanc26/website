# Website

A personal website and blog built with [SvelteKit](https://kit.svelte.dev/), featuring AT Protocol (Bluesky) integration, markdown-based blog posts, and dynamic content rendering.

## Features

- **Blog System**: Markdown-based blog posts with automatic date-based routing
- **AT Protocol Integration**: Fetch and display Bluesky posts and profiles
- **Content Rendering**: Custom Leaflet components for flexible content blocks (code, embeds, images, math)
- **Project Showcase**: Display and manage project listings
- **Social Features**: Comment sections, share buttons, and recommendation system
- **API Endpoints**: REST API for blog posts, recommendations, and subscriptions
- **Webhooks**: GitHub webhook support for CI/CD integration
- **Open Graph**: Dynamic OG image generation for social media sharing
- **Responsive Design**: Tailwind CSS for mobile-first styling

## Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Markdown**: MDAST-based markdown processing
- **Social**: AT Protocol SDK for Bluesky integration

## Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   │   ├── leaflet/        # Content block components
│   │   └── icons/          # SVG icon components
│   ├── providers/          # Data processing (facets, markdown, etc.)
│   ├── services/
│   │   └── atproto/        # Bluesky/AT Protocol API integration
│   ├── styles/             # Global CSS and design tokens
│   └── utils/              # Utility functions
└── routes/
    ├── blog/               # Blog listing and post pages
    ├── projects/           # Project showcase
    ├── api/                # API endpoints
    └── webhook/            # Webhook handlers
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm

### Installation

```sh
# Install dependencies
pnpm install
```

### Development

```sh
# Start development server
pnpm run dev

# Open in browser
pnpm run dev -- --open
```

The site will be available at `http://localhost:5173`.

### Building

```sh
# Create production build
pnpm run build

# Preview production build
pnpm run preview
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# AT Protocol/Bluesky configuration (if applicable)
ATPROTO_USERNAME=your_username
ATPROTO_PASSWORD=your_password

# Other configuration
PUBLIC_SITE_URL=https://your-domain.com
```

## Configuration

- **Site Config**: [src/lib/config.ts](src/lib/config.ts)
- **Vite Config**: [vite.config.ts](vite.config.ts)
- **Svelte Config**: [svelte.config.js](svelte.config.js)

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com/) (see [vercel.json](vercel.json)).

To deploy:

```sh
# Build for production
pnpm run build

# Deploy using Vercel CLI
vercel
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See LICENSE file for details.
