# AT Protocol Personal Website

A modern, AT Protocol-powered personal website template built with SvelteKit 2 and Tailwind CSS 4.

> **Note**: This repository contains the source code for [Ewan's Corner](https://ewancroft.uk). The current configuration (environment variables, slug mappings, static files) is specific to that website, but the codebase is designed to be easily adapted for your own AT Protocol-powered site. See the [Configuration](#configuration) section below for details on personalising it for your use.

## 🌟 Features

- **AT Protocol Integration**: Fetch and display content from your AT Protocol repository  
- **Multi-Publication Support**: Map friendly URL slugs to Leaflet publications with a simple config  
- **Multi-Platform Blog**: Seamlessly aggregate blog posts from WhiteWind and/or Leaflet (configurable)  
- **Dynamic Profile**: Automatically display your Bluesky profile information  
- **Custom Status**: Show real-time status updates using custom AT Protocol lexicons  
- **Link Board**: Display a Linkat board with emoji-styled link cards  
- **Bluesky Posts**: Showcase your latest non-reply Bluesky posts with rich media support  
- **Smart Redirects**: Intelligent redirection system for publication URLs with platform prioritisation  
- **Responsive Design**: Mobile-first layout with dark-mode support  
- **RSS Feed**: Intelligent RSS-feed handling for WhiteWind and/or Leaflet posts  
- **Type-Safe**: Full TypeScript support throughout the application  

## Configuration

Before using this template, you'll need to update several configuration files with your own information:

### Environment Variables (`.env`)

Update these with your own values:

```ini
PUBLIC_ATPROTO_DID=did:plc:your-did-here  # Your AT Protocol DID
PUBLIC_SITE_TITLE="Your Site Title"       # Your site name
PUBLIC_SITE_DESCRIPTION="..."             # Your description
PUBLIC_SITE_URL="https://example.com"     # Your domain
````

### Publication Slug Mappings (`src/lib/data/slug-mappings.ts`)

Replace the example mappings with your own Leaflet publication rkeys:

```typescript
export const slugMappings: SlugMapping[] = [
  { slug: 'blog', publicationRkey: 'your-rkey-here' }
];
```

### Static Files

Update or remove these files that are specific to the example site:

- `static/robots.txt` - Update the sitemap URL
- `static/sitemap.xml` - Update with your domain and pages
- `static/.well-known/*` - These files are specific to ewancroft.uk and should be replaced with your own

### Favicon and Assets

Replace the favicons in `static/favicon/` with your own branding.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- An AT Protocol DID (Decentralised Identifier) from Bluesky

### Installation

1. Clone the repository:

```bash
git clone git@github.com:ewanc26/website.git
cd website-redesign
```

1. Install dependencies:

```bash
npm install
```

1. Configure environment variables:

Copy the example environment file and update it with your own information:

```bash
cp .env .env.local
```

Edit `.env.local` with your settings:

```ini
# Required: Your AT Protocol DID
PUBLIC_ATPROTO_DID=did:plc:your-did-here

# Optional: Enable WhiteWind blog support (default: false)
PUBLIC_ENABLE_WHITEWIND=false

# Optional: Fallback URL for missing blog posts
PUBLIC_BLOG_FALLBACK_URL=

# Site metadata
PUBLIC_SITE_TITLE="Your Site Title"
PUBLIC_SITE_DESCRIPTION="Your site description"
PUBLIC_SITE_KEYWORDS="keywords, here"
PUBLIC_SITE_URL="https://example.com"
```

1. Configure your publication slugs in `src/lib/config/slugs.ts`:

```typescript
export const slugMappings: SlugMapping[] = [
  {
    slug: 'blog',
    publicationRkey: '3m3x4bgbsh22k' // Your publication rkey
  }
  // Add more mappings as needed:
  // { slug: 'notes', publicationRkey: 'xyz123abc' },
  // { slug: 'essays', publicationRkey: 'def456ghi' },
];
```

1. Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to view your site.

## 📁 Project Structure

```text
website-redesign/
├── src/
│   ├── lib/
│   │   ├── assets/          # Static assets (images, icons)
│   │   ├── components/      # Reusable Svelte components
│   │   │   ├── layout/      # Header, Footer, Navigation
│   │   │   └── ui/          # UI components (Card, etc.)
│   │   ├── config/          # Configuration files
│   │   │   └── slugs.ts     # Slug to publication mapping
│   │   ├── data/            # Static data (navigation items)
│   │   ├── helper/          # Helper functions (meta tags, OG images)
│   │   ├── services/        # External service integrations
│   │   │   └── atproto/     # AT Protocol service layer
│   │   └── utils/           # Utility functions
│   ├── routes/              # SvelteKit routes
│   │   ├── [slug]/          # Dynamic slug-based publication routes
│   │   ├── now/             # Status-feed endpoints
│   │   └── site/            # Site-metadata pages
│   ├── app.css              # Global styles
│   └── app.html             # HTML template
├── static/                  # Static files (favicon, etc.)
└── package.json
```

## 🔧 AT Protocol Services

The application includes a comprehensive AT Protocol service layer in `src/lib/services/atproto/`:

### Core Services

- **agents.ts**: Agent management with automatic PDS resolution and fallback to the Bluesky public API
- **fetch.ts**: Profile, status, site info, and links fetching
- **posts.ts**: Blog posts, Leaflet publications, and Bluesky posts
- **media.ts**: Image and blob-URL handling
- **cache.ts**: In-memory caching with TTL support
- **types.ts**: TypeScript definitions for all data structures

### Usage Example

```typescript
import { fetchProfile, fetchBlogPosts, fetchLatestBlueskyPost } from '$lib/services/atproto';

// Fetch profile data
const profile = await fetchProfile();

// Fetch blog posts from WhiteWind and Leaflet
const { posts } = await fetchBlogPosts();

// Fetch latest Bluesky post
const post = await fetchLatestBlueskyPost();
```

## 📝 Publication System

The publication system uses friendly URL slugs that map to Leaflet publications, with support for multiple platforms and intelligent URL redirects.

### Slug Configuration

Publications are mapped to URL slugs in `src/lib/config/slugs.ts`:

```typescript
export const slugMappings: SlugMapping[] = [
  {
    slug: 'blog',              // Access via /blog
    publicationRkey: '3m3x4bgbsh22k'  // Leaflet publication rkey
  },
  {
    slug: 'notes',             // Access via /notes
    publicationRkey: 'xyz123abc'
  }
];
```

### Supported Platforms

1. **Leaflet*- (`pub.leaflet.document`) – **Prioritised by default**

   - Format: Custom domain or `https://leaflet.pub/lish/{did}/{publication}/{rkey}`
   - Supports multiple publications via slug mapping
   - Respects `base_path` configuration
   - Always checked first

2. **WhiteWind*- (`com.whtwnd.blog.entry`) – **Optional, disabled by default**

   - Format: `https://whtwnd.com/{did}/{rkey}`
   - Automatically filters out drafts and non-public posts
   - Only checked if `PUBLIC_ENABLE_WHITEWIND=true`

### Publication Routes

- `/{slug}` – Redirects to your publication homepage (configured in slugs.ts)
- `/{slug}/{rkey}` – Smart redirect to the correct platform (checks Leaflet first, then WhiteWind if enabled)
- `/{slug}/rss` – Intelligent RSS feed (redirects to Leaflet RSS by default, or generates WhiteWind RSS if enabled)
- `/{slug}/atom` – Deprecated (returns *410 Gone*, use RSS instead)

### How It Works

**Priority Order:**

1. **Leaflet*- is always checked first for publications and documents
2. The slug mapping determines which publication to check
3. **WhiteWind*- is only checked if `PUBLIC_ENABLE_WHITEWIND=true`
4. If neither platform has the document, it falls back to `PUBLIC_BLOG_FALLBACK_URL` if configured
5. Returns *404- if the document isn't found and no fallback is set

**When a user visits `/{slug}/{rkey}`:**

1. The system looks up the publication rkey from the slug configuration
2. It checks Leaflet for the document in that specific publication
3. If not found and WhiteWind is enabled, it checks WhiteWind
4. Redirects to the appropriate platform URL
5. Falls back to `PUBLIC_BLOG_FALLBACK_URL` if configured
6. Returns 404 if no document is found and no fallback exists

**RSS Feed Behaviour:**

- **WhiteWind disabled*- (default): Redirects to Leaflet's native RSS feed (includes full content)
- **WhiteWind enabled with posts**: Generates an RSS feed with WhiteWind post links
- **No posts found**: Returns 404

### Platform Configuration (Leaflet / WhiteWind)

Control publication behaviour with environment variables:

```ini
# Use a custom domain for Leaflet posts (recommended)
PUBLIC_LEAFLET_BASE_PATH=https://blog.example.com

# Enable WhiteWind support (set to "true" to enable, default: "false")
PUBLIC_ENABLE_WHITEWIND=false

# Fallback for missing posts
PUBLIC_BLOG_FALLBACK_URL=https://archive.example.com/blog
```

And configure your slug mappings in `src/lib/config/slugs.ts`:

```typescript
export const slugMappings: SlugMapping[] = [
  { slug: 'blog', publicationRkey: '3m3x4bgbsh22k' },
  { slug: 'essays', publicationRkey: 'abc123xyz' },
  { slug: 'notes', publicationRkey: 'def456uvw' }
];
```

### Why Leaflet is Prioritised

- **Better Performance**: Leaflet's RSS feeds include full post content
- **Custom Domains**: Each publication can have its own `base_path` configured in Leaflet
- **Rich Features**: Better media handling and publication management
- **Multiple Publications**: Easy management of multiple publications with slug mapping
- **Active Development**: Leaflet is actively maintained and improved

### Enabling WhiteWind

If you still use WhiteWind or want to support both platforms:

```ini
PUBLIC_ENABLE_WHITEWIND=true
```

With WhiteWind enabled:

- Documents are checked on both platforms (Leaflet first, then WhiteWind)
- RSS feed includes WhiteWind posts if they exist
- `/{slug}` redirects to WhiteWind if no Leaflet configuration is set

### Finding Your Publication Rkey

1. Visit your Leaflet publication page
2. The URL will be in the format: `https://leaflet.pub/lish/{did}/{rkey}`
3. Copy the `{rkey}` part (e.g., `3m3x4bgbsh22k`)
4. Add it to your slug mapping in `src/lib/config/slugs.ts`

## 🎨 Styling

The project uses:

- **Tailwind CSS 4**: Latest Tailwind with new features
- **@tailwindcss/typography**: Beautiful prose styling
- **@tailwindcss/vite**: Vite plugin for Tailwind
- **Custom Components**: Pre-built UI components with consistent styling

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `.svelte-kit` directory, ready for deployment.

## 📦 Deployment

This project uses `@sveltejs/adapter-auto`, which automatically selects the best adapter for your deployment platform:

- **Vercel**: Automatic detection and optimisation
- **Netlify**: Automatic detection and optimisation
- **Cloudflare Pages**: Automatic detection and optimisation
- **Node.js**: Fallback option

For other platforms, see the [SvelteKit adapters documentation](https://kit.svelte.dev/docs/adapters).

## 🔍 Custom Lexicons

The site supports several custom AT Protocol lexicons:

### Status Updates (`uk.ewancroft.now`)

Display real-time status messages on your site.

### Site Information (`uk.ewancroft.site.info`)

Store detailed site metadata including:

- Technology stack
- Privacy statement
- Open-source information
- Credits and licences

### Link Board (`blue.linkat.board`)

Display a collection of links with emoji icons.

## 🛠️ Development

### Available Scripts

- `npm run dev` – Start the development server
- `npm run build` – Build for production
- `npm run preview` – Preview the production build
- `npm run check` – Type-check the project
- `npm run check:watch` – Type-check in watch mode
- `npm run format` – Format code with Prettier
- `npm run lint` – Check code formatting

### Code Quality

The project uses:

- **TypeScript*- – Full type safety
- **Prettier*- – Consistent code formatting
- **svelte-check*- – Svelte-specific linting
- **ESLint*- – (can be added if needed)

## 📚 Reference Implementation

The `other/leaflet-main` directory contains the reference Leaflet implementation, which was used as inspiration for:

- Feed generation
- Publication handling
- Document rendering
- Bluesky integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request.

## 📄 Licence

This project is open-source. See the [licence](./LICENCE) file for more details on the website source code specifically and the [third party licences](./THIRD-PARTY-LICENSES.txt) file for the rest.

## 🔗 Links

- [AT Protocol Documentation](https://atproto.com/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Bluesky](https://bsky.app/)
- [WhiteWind](https://whtwnd.com/)
- [Leaflet](https://leaflet.pub/)

## 💡 Tips

### Finding Your DID

1. visit [PDSls](https://pdsls.dev/)
1. enter your handle (i.e. `ewancroft.uk`)
1. you will see a `did:plc` (or `did:web`) in the Repository field, that is your DID

> if not, select the arrow to the right of the text, it might show your handle instead.

### Cache Management

The AT Protocol services use an in-memory cache with configurable TTL:

```typescript
import { cache } from '$lib/services/atproto';

// Clear all cache
cache.clear();

// Clear a specific entry
cache.delete('profile:did:plc:...');
```

### Custom Components

All components are built with Svelte 5 runes for better reactivity and performance. See the components directory for examples.

## 🐛 Troubleshooting

### Documents Not Found

1. Check your `PUBLIC_ATPROTO_DID` is correct
2. Verify the slug mapping in `src/lib/config/slugs.ts` is correct
3. Ensure the publication rkey matches your Leaflet publication
4. Verify documents are not drafts (WhiteWind) or unpublished (Leaflet)
5. If using WhiteWind, ensure `PUBLIC_ENABLE_WHITEWIND=true` is set
6. Check the browser console for AT Protocol service errors

### Slug Not Found

1. Add your slug mapping to `src/lib/config/slugs.ts`
2. Ensure the format is: `{ slug: 'your-slug', publicationRkey: 'your-rkey' }`
3. Restart the development server after changes

### Profile Data Not Loading

1. Ensure your DID is publicly accessible
2. Check the browser console for errors
3. Verify AT Protocol services are reachable

### Build Errors

1. Clear the `.svelte-kit` directory: `rm -rf .svelte-kit`
2. Remove `node_modules`: `rm -rf node_modules`
3. Reinstall dependencies: `npm install`
4. Try building again: `npm run build`

## 🙏 Acknowledgements

- Thanks to the AT Protocol team for creating an open protocol
- Thanks to the Bluesky, WhiteWind, and Leaflet teams
- Inspired by the personal-web movement and IndieWeb principles

---

Built with ❤️ using SvelteKit and AT Protocol
