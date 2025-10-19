# Ewan's Corner

A modern, AT Protocol-powered personal website built with SvelteKit 2 and Tailwind CSS 4.

## 🌟 Features

- **AT Protocol Integration**: Fetch and display content from your AT Protocol repository
- **Multi-Platform Blog**: Seamlessly aggregate blog posts from WhiteWind and Leaflet
- **Dynamic Profile**: Automatically display your Bluesky profile information
- **Custom Status**: Show real-time status updates using custom AT Protocol lexicons
- **Link Board**: Display a Linkat board with emoji-styled link cards
- **Bluesky Posts**: Showcase your latest non-reply Bluesky posts with rich media support
- **Smart Blog Redirects**: Intelligent redirection system for blog post URLs
- **Responsive Design**: Mobile-first design with dark mode support
- **RSS Feed**: Intelligent RSS feed handling WhiteWind and Leaflet posts
- **Type-Safe**: Full TypeScript support throughout the application

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- An AT Protocol DID (Decentralized Identifier) from Bluesky

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd website-redesign
```

1. Install dependencies:

```bash
npm install
```

1. Configure environment variables:

Copy the example environment file and update it with your information:

```bash
cp .env .env.local
```

Edit `.env.local` with your settings:

```env
# Required: Your AT Protocol DID
PUBLIC_ATPROTO_DID=did:plc:your-did-here

# Optional: Custom Leaflet blog domain
PUBLIC_LEAFLET_BASE_PATH=https://blog.example.com

# Optional: Specific Leaflet publication rkey for blog posts
PUBLIC_LEAFLET_BLOG_PUBLICATION=

# Optional: Fallback URL for missing blog posts
PUBLIC_BLOG_FALLBACK_URL=

# Site metadata
PUBLIC_SITE_TITLE="Your Site Title"
PUBLIC_SITE_DESCRIPTION="Your site description"
PUBLIC_SITE_KEYWORDS="keywords, here"
PUBLIC_SITE_URL="https://example.com"
```

1. Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to see your site.

## 📁 Project Structure

```text
website-redesign/
├── src/
│   ├── lib/
│   │   ├── assets/          # Static assets (images, icons)
│   │   ├── components/      # Reusable Svelte components
│   │   │   ├── layout/      # Header, Footer, Navigation
│   │   │   └── ui/          # UI components (Card, etc.)
│   │   ├── data/            # Static data (navigation items)
│   │   ├── helper/          # Helper functions (meta tags, OG images)
│   │   ├── services/        # External service integrations
│   │   │   └── atproto/     # AT Protocol service layer
│   │   └── utils/           # Utility functions
│   ├── routes/              # SvelteKit routes
│   │   ├── blog/            # Blog redirect handlers
│   │   ├── now/             # Status feed endpoints
│   │   └── site/            # Site metadata pages
│   ├── app.css              # Global styles
│   └── app.html             # HTML template
├── static/                  # Static files (favicon, etc.)
├── other/                   # Reference implementations
│   └── leaflet-main/        # Leaflet reference code
└── package.json
```

## 🔧 AT Protocol Services

The application includes a comprehensive AT Protocol service layer in `src/lib/services/atproto/`:

### Core Services

- **agents.ts**: Agent management with automatic PDS resolution and fallback to Bluesky public API
- **fetch.ts**: Profile, status, site info, and links fetching
- **posts.ts**: Blog posts, Leaflet publications, and Bluesky posts
- **media.ts**: Image and blob URL handling
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

## 📝 Blog System

The blog system supports multiple platforms and provides intelligent URL redirects:

### Supported Platforms

1. **WhiteWind** (`com.whtwnd.blog.entry`)
   - Format: `https://whtwnd.com/{did}/{rkey}`
   - Automatically filters out drafts and non-public posts

1. **Leaflet** (`pub.leaflet.document`)
   - Format: Custom domain or `https://leaflet.pub/lish/{did}/{publication}/{rkey}`
   - Supports multiple publications
   - Respects `base_path` configuration

### Blog Routes

- `/blog/{rkey}` - Smart redirect to the correct platform
- `/blog/rss` - Intelligent RSS feed (WhiteWind posts or redirect to Leaflet RSS)
- `/blog/atom` - Deprecated (returns 410 Gone, use RSS instead)

### How It Works

When a user visits `/blog/{rkey}`:

1. The system checks WhiteWind for the post
2. If not found, checks all Leaflet publications
3. Redirects to the appropriate platform URL
4. Falls back to `PUBLIC_BLOG_FALLBACK_URL` if configured
5. Returns 404 if post not found and no fallback

### Configuration

Control blog behavior with environment variables:

```env
# Use a custom domain for Leaflet posts
PUBLIC_LEAFLET_BASE_PATH=https://blog.example.com

# Only check a specific Leaflet publication
PUBLIC_LEAFLET_BLOG_PUBLICATION=3kzcijpj2z2a

# Fallback for missing posts
PUBLIC_BLOG_FALLBACK_URL=https://archive.example.com/blog
```

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

- **Vercel**: Automatic detection and optimization
- **Netlify**: Automatic detection and optimization
- **Cloudflare Pages**: Automatic detection and optimization
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
- Open source information
- Credits and licenses

### Link Board (`blue.linkat.board`)

Display a collection of links with emoji icons.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type-check the project
- `npm run check:watch` - Type-check in watch mode
- `npm run format` - Format code with Prettier
- `npm run lint` - Check code formatting

### Code Quality

The project uses:

- **TypeScript**: Full type safety
- **Prettier**: Consistent code formatting
- **svelte-check**: Svelte-specific linting
- **ESLint**: (can be added if needed)

## 📚 Reference Implementation

The `other/leaflet-main` directory contains the reference Leaflet implementation, which was used as inspiration for:

- Feed generation
- Publication handling
- Document rendering
- Bluesky integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source. See the site information section for details about the technology stack and licenses.

## 🔗 Links

- [AT Protocol Documentation](https://atproto.com/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Bluesky](https://bsky.app/)
- [WhiteWind](https://whtwnd.com/)
- [Leaflet](https://leaflet.pub/)

## 💡 Tips

### Finding Your DID

1. Visit your Bluesky profile
2. Click on "Settings" → "Advanced"
3. Your DID will be displayed there
4. Or visit `https://bsky.app/profile/{your-handle}` and check the page source

### Cache Management

The AT Protocol services use an in-memory cache with configurable TTL:

```typescript
import { cache } from '$lib/services/atproto';

// Clear all cache
cache.clear();

// Clear specific entry
cache.delete('profile:did:plc:...');
```

### Custom Components

All components are built with Svelte 5 runes for better reactivity and performance. See the components directory for examples.

## 🐛 Troubleshooting

### Blog Posts Not Found

1. Check your `PUBLIC_ATPROTO_DID` is correct
2. Verify posts are not drafts (WhiteWind) or unpublished (Leaflet)
3. Check the publication configuration if using `PUBLIC_LEAFLET_BLOG_PUBLICATION`

### Profile Data Not Loading

1. Ensure your DID is publicly accessible
2. Check browser console for errors
3. Verify AT Protocol services are reachable

### Build Errors

1. Clear `.svelte-kit` directory: `rm -rf .svelte-kit`
2. Remove node_modules: `rm -rf node_modules`
3. Reinstall dependencies: `npm install`
4. Try building again: `npm run build`

## 🙏 Acknowledgments

- Thanks to the AT Protocol team for creating an open protocol
- Thanks to the Bluesky, WhiteWind, and Leaflet teams
- Inspired by the personal web movement and IndieWeb principles

---

Built with ❤️ using SvelteKit and AT Protocol
