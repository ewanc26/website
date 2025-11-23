# AT Protocol Personal Website

A modern, feature-rich personal website powered by AT Protocol, built with SvelteKit 2 and Tailwind CSS 4.

> **Note**: This repository contains the source code for [Ewan's Corner](https://ewancroft.uk). The current configuration (environment variables, slug mappings, static files) is specific to that website, but the codebase is designed to be easily adapted for your own AT Protocol-powered site. See [CONFIGURATION.md](./CONFIGURATION.md) for detailed setup instructions.

## 🌟 Features

### Core AT Protocol Integration

- **Dynamic Profile Display**: Automatically fetch and display your Bluesky profile information with avatar, banner, follower counts, and bio
- **Site Metadata**: Store and display comprehensive site information using the `uk.ewancroft.site.info` lexicon (credits, tech stack, privacy statement, licenses)
- **Smart Caching**: Intelligent 5-minute in-memory cache with TTL support for all AT Protocol data
- **PDS Resolution**: Automatic PDS discovery with fallback to Bluesky public API for maximum reliability

### Content & Publishing

- **Multi-Platform Blog System**:
  - **Leaflet** (`pub.leaflet.document`) - Primary platform with custom domain support
  - **WhiteWind** (`com.whtwnd.blog.entry`) - Optional secondary platform (disabled by default)
  - Intelligent RSS feed generation with full content support
  - Automatic draft filtering and non-public post handling
  - Multi-publication support via slug mapping

- **Flexible Publication Management**:
  - Map friendly URL slugs to AT Protocol publications
  - Support for unlimited publications with individual configurations
  - Custom base paths for each publication
  - Smart redirects with platform prioritization
  - Intelligent fallback handling for missing content

- **Bluesky Post Display**:
  - Showcase latest non-reply posts with rich media support
  - Full thread context with recursive parent fetching
  - Quoted post embedding with media preservation
  - Image galleries with alt text support
  - External link cards with preview generation
  - Video embed support

- **Engagement Tracking**:
  - Real-time like and repost counts via Constellation API
  - Paginated engagement data fetching
  - Cached engagement metrics for performance

### Music Integration (via teal.fm)

- **Now Playing Display**: Show currently playing or recently played tracks via `fm.teal.alpha.actor.status`
- **Play History**: Display listening history via `fm.teal.alpha.feed.play`
- **Album Artwork**:
  - **Primary**: MusicBrainz Cover Art Archive integration (no API key required!)
  - **Automatic Search**: Searches MusicBrainz when release IDs are missing
  - **Smart Caching**: Caches MusicBrainz lookups to avoid repeated searches
  - **Fallback**: AT Protocol blob storage for custom artwork
- **Rich Metadata**: Artist names, album info, duration, and relative timestamps
- **Multi-Service Support**: Works with Last.fm, Spotify, and other scrobbling services
- **Intelligent Expiry**: Automatically handles expired "now playing" status

### Mood Status (via kibun.social)

- **Current Mood Display**: Show your current mood/feeling via `social.kibun.status`
- **Emoji Support**: Display expressive emoji alongside mood text
- **Relative Timestamps**: Show when the mood was last updated
- **Real-time Updates**: Automatically refreshes to show your latest status
- **Clean Design**: Simple, elegant card that fits seamlessly with other status cards

### Developer Tools

- **Tangled Repository Display**: Showcase your code repositories using the `sh.tangled.repo` lexicon
- **Repository Cards**: Display with descriptions, creation dates, labels, and source links
- **Automatic Sorting**: Repos sorted by creation date (newest first)

### User Experience

- **Link Board**: Display curated link collections from Linkat (`blue.linkat.board`) with emoji icons
- **Dark Mode**: Seamless light/dark theme switching with system preference detection
- **Wolf Mode**: Fun "wolf speak" text transformation toggle that converts text to wolf sounds while preserving:
  - Numbers and abbreviations (1K, 2M, 30s, etc.)
  - Capitalization patterns (UPPERCASE → AWOO, Capitalized → Awoo)
  - Punctuation and formatting
  - Navigation and interactive elements
- **Scroll to Top**: Smooth scroll-to-top button for long pages
- **Responsive Design**: Mobile-first layout that adapts to all screen sizes
- **SEO Optimization**: Comprehensive meta tags, Open Graph, and Twitter Card support
- **RSS/Atom Feeds**: Multiple feed endpoints for blog posts and status updates

### Technical Features

- **Type-Safe Development**: Full TypeScript support with comprehensive type definitions
- **Smart Error Handling**: Graceful degradation with informative error states
- **Loading States**: Skeleton loaders for all async content
- **Image Optimization**: Lazy loading and responsive image handling
- **Blob URL Construction**: Proper PDS blob URL generation for media assets
- **Media Extraction**: Automatic CID extraction from various image object formats
- **Facet Processing**: Rich text with link detection and mention highlighting

## 📋 Configuration

For detailed configuration instructions, see [CONFIGURATION.md](./CONFIGURATION.md).

Quick start:

1. Copy `.env.example` to `.env.local` and add your AT Protocol DID
2. Configure publication slugs in `src/lib/config/slugs.ts`
3. Update static files (robots.txt, sitemap.xml, favicons)
4. Run `npm install && npm run dev`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- An AT Protocol DID (Decentralized Identifier) from Bluesky

### Installation

1. **Clone the repository**:

   ```bash
   git clone git@github.com:ewanc26/website.git
   cd website
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   ```bash
   cp .env .env.local
   ```

   Edit `.env.local` with your settings (see [CONFIGURATION.md](./CONFIGURATION.md) for details)

4. **Configure publication slugs** in `src/lib/config/slugs.ts`

5. **Start the development server**:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:5173` to view your site

## 📁 Project Structure

```text
website/
├── src/
│   ├── lib/
│   │   ├── assets/               # Static assets (images, icons)
│   │   ├── components/           # Reusable Svelte components
│   │   │   ├── layout/          # Header, Footer, Navigation, ThemeToggle, WolfToggle
│   │   │   │   └── main/
│   │   │   │       ├── card/    # ProfileCard, MusicStatusCard, etc.
│   │   │   │       ├── DynamicLinks.svelte
│   │   │   │       ├── ScrollToTop.svelte
│   │   │   │       └── TangledRepos.svelte
│   │   │   ├── seo/             # MetaTags component
│   │   │   └── ui/              # Reusable UI components (Card, etc.)
│   │   ├── config/              # Configuration files
│   │   │   └── slugs.ts         # Slug to publication mapping
│   │   ├── data/                # Static data (navigation items)
│   │   ├── helper/              # Helper functions (meta tags, OG images)
│   │   ├── services/            # External service integrations
│   │   │   └── atproto/         # AT Protocol service layer
│   │   │       ├── agents.ts    # Agent management & PDS resolution
│   │   │       ├── cache.ts     # In-memory caching
│   │   │       ├── engagement.ts # Post engagement (likes/reposts)
│   │   │       ├── fetch.ts     # Profile, status, site info, music status
│   │   │       ├── media.ts     # Blob URL & image handling
│   │   │       ├── musicbrainz.ts # MusicBrainz API integration
│   │   │       ├── posts.ts     # Blog posts, Bluesky posts, publications
│   │   │       ├── tangled.ts   # Tangled repository fetching
│   │   │       └── types.ts     # TypeScript type definitions
│   │   ├── stores/              # Svelte stores
│   │   │   └── wolfMode.ts      # Wolf mode text transformation
│   │   └── utils/               # Utility functions (date formatting, etc.)
│   ├── routes/                  # SvelteKit routes
│   │   ├── [slug=slug]/         # Dynamic slug-based publication routes
│   │   │   ├── [rkey]/          # Individual document redirects
│   │   │   ├── atom/            # Deprecated Atom feeds (410 Gone)
│   │   │   └── rss/             # RSS feed endpoints
│   │   ├── favicon.ico/         # Favicon endpoint
│   │   ├── now/                 # Status feed endpoints
│   │   │   ├── atom/            # Deprecated Atom feeds
│   │   │   └── rss/             # RSS feeds
│   │   └── site/
│   │       └── meta/            # Site metadata page
│   ├── app.css                  # Global styles
│   └── app.html                 # HTML template
├── static/                      # Static files (favicon, robots.txt, etc.)
└── package.json
```

## 🔧 AT Protocol Services

The application includes a comprehensive AT Protocol service layer in `src/lib/services/atproto/`:

### Core Services

- **agents.ts**: Agent management with automatic PDS resolution and fallback to the Bluesky public API
- **fetch.ts**: Profile, status, site info, links, and music status fetching
- **posts.ts**: Blog posts (WhiteWind & Leaflet), Bluesky posts, and publications
- **tangled.ts**: Repository information from Tangled lexicon
- **engagement.ts**: Post engagement data (likes/reposts) via Constellation API
- **media.ts**: Image and blob URL handling with CID extraction
- **musicbrainz.ts**: MusicBrainz API integration for album artwork
- **cache.ts**: In-memory caching with configurable TTL support
- **types.ts**: Comprehensive TypeScript definitions for all data structures

### Usage Examples

```typescript
import {
  fetchProfile,
  fetchBlogPosts,
  fetchLatestBlueskyPost,
  fetchMusicStatus,
  fetchTangledRepos
} from '$lib/services/atproto';

// Fetch profile data
const profile = await fetchProfile();

// Fetch blog posts from WhiteWind and/or Leaflet
const { posts } = await fetchBlogPosts();

// Fetch latest Bluesky post
const post = await fetchLatestBlueskyPost();

// Fetch current or last played music
const musicStatus = await fetchMusicStatus();

// Fetch code repositories
const repos = await fetchTangledRepos();
```

## 📝 Publication System

The publication system uses friendly URL slugs that map to Leaflet publications, with support for multiple platforms and intelligent URL redirects.

### Slug Configuration

Publications are mapped to URL slugs in `src/lib/config/slugs.ts`:

```typescript
export const slugMappings: SlugMapping[] = [
  {
    slug: 'blog', // Access via /blog
    publicationRkey: '3m3x4bgbsh22k' // Leaflet publication rkey
  },
  {
    slug: 'notes', // Access via /notes
    publicationRkey: 'xyz123abc'
  }
];
```

### Supported Platforms

1. **Leaflet** (`pub.leaflet.document`) – **Prioritized by default**
   - Format: Custom domain or `https://leaflet.pub/lish/{did}/{publication}/{rkey}`
   - Supports multiple publications via slug mapping
   - Respects `base_path` configuration
   - Always checked first

2. **WhiteWind** (`com.whtwnd.blog.entry`) – **Optional, disabled by default**
   - Format: `https://whtwnd.com/{did}/{rkey}`
   - Automatically filters out drafts and non-public posts
   - Only checked if `PUBLIC_ENABLE_WHITEWIND=true`

### Publication Routes

- `/{slug}` – Redirects to your publication homepage (configured in slugs.ts)
- `/{slug}/{rkey}` – Smart redirect to the correct platform (checks Leaflet first, then WhiteWind if enabled)
- `/{slug}/rss` – Intelligent RSS feed (redirects to Leaflet RSS by default, or generates WhiteWind RSS if enabled)
- `/{slug}/atom` – Deprecated (returns 410 Gone, use RSS instead)

### Priority Order

1. **Leaflet** is always checked first for publications and documents
2. The slug mapping determines which publication to check
3. **WhiteWind** is only checked if `PUBLIC_ENABLE_WHITEWIND=true`
4. If neither platform has the document, it falls back to `PUBLIC_BLOG_FALLBACK_URL` if configured
5. Returns 404 if the document isn't found and no fallback is set

### RSS Feed Behavior

- **WhiteWind disabled** (default): Redirects to Leaflet's native RSS feed (includes full content)
- **WhiteWind enabled with posts**: Generates an RSS feed with WhiteWind post links
- **No posts found**: Returns 404

### Finding Your Publication Rkey

1. Visit your Leaflet publication page
2. The URL will be in the format: `https://leaflet.pub/lish/{did}/{rkey}`
3. Copy the `{rkey}` part (e.g., `3m3x4bgbsh22k`)
4. Add it to your slug mapping in `src/lib/config/slugs.ts`

## 🎵 Music Integration

The site displays your music listening activity via teal.fm integration:

### Supported Record Types

- **`fm.teal.alpha.actor.status`**: Current "Now Playing" status with expiry
- **`fm.teal.alpha.feed.play`**: Historical play records

### Album Artwork System

The music card uses a sophisticated artwork retrieval system:

1. **MusicBrainz Cover Art Archive** (Primary)
   - Uses `releaseMbId` from music records
   - Free, no API key required
   - Automatic search fallback when IDs are missing
   - Caches search results to avoid repeated lookups

2. **AT Protocol Blob Storage** (Fallback)
   - Uses `artwork` field from records
   - Proper PDS blob URL construction

### Features

- Displays track name, artists, album, and duration
- Shows relative timestamps ("2 minutes ago")
- Links to origin URLs (Last.fm, Spotify, etc.)
- Responsive artwork display with fallback icons
- Smart caching with 5-minute TTL
- Automatic status expiry handling

### Configuration

Set your DID in `.env.local` to fetch your music status:

```ini
PUBLIC_ATPROTO_DID=did:plc:your-did-here
```

The card will automatically display your current or last played track.

## 🔐 CORS Configuration

The API endpoints support Cross-Origin Resource Sharing (CORS) via dynamic configuration:

### Environment Variable

```ini
# Single origin
PUBLIC_CORS_ALLOWED_ORIGINS="https://example.com"

# Multiple origins (comma-separated)
PUBLIC_CORS_ALLOWED_ORIGINS="https://example.com,https://app.example.com,https://www.example.com"

# Allow all origins (not recommended for production)
PUBLIC_CORS_ALLOWED_ORIGINS="*"
```

### How It Works

1. **Dynamic Origin Matching**: The server checks the `Origin` header against the allowed list
2. **Preflight Requests**: OPTIONS requests are handled automatically with proper CORS headers
3. **Security**: Only specified origins receive CORS headers (unless using `*`)
4. **Headers Set**:
   - `Access-Control-Allow-Origin`: The requesting origin (if allowed)
   - `Access-Control-Allow-Methods`: GET, POST, PUT, DELETE, OPTIONS
   - `Access-Control-Allow-Headers`: Content-Type, Authorization
   - `Access-Control-Max-Age`: 86400 (24 hours)

### API Endpoints

CORS is automatically applied to all routes under `/api/`:

- `/api/artwork` - Album artwork fetching service

### Testing CORS

```bash
# Test from command line
curl -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  http://localhost:5173/api/artwork

# Check response headers for:
# Access-Control-Allow-Origin: https://example.com
```

### Security Recommendations

1. **Production**: Specify exact allowed origins instead of using `*`
2. **Development**: Use `*` or localhost origins for testing
3. **Multiple Domains**: List all your domains that need API access
4. **HTTPS Only**: Always use HTTPS origins in production

## 🎨 Styling

The project uses:

- **Tailwind CSS 4**: Latest Tailwind with new features and improved performance
- **@tailwindcss/typography**: Beautiful prose styling for blog content
- **@tailwindcss/vite**: Vite plugin for optimal Tailwind integration
- **Custom Color Palette**: Semantic color tokens (canvas, ink, primary) for consistent theming
- **Dark Mode**: System preference detection with manual override
- **Responsive Design**: Mobile-first approach with breakpoint utilities

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

### Site Information (`uk.ewancroft.site.info`)

Store comprehensive site metadata:

- Technology stack
- Privacy statement
- Open-source information
- Credits and licenses
- Related services

### Link Board (`blue.linkat.board`)

Display a collection of links with emoji icons.

### Music Status (`fm.teal.alpha.actor.status` & `fm.teal.alpha.feed.play`)

Show music listening activity via teal.fm integration.

### Mood Status (`social.kibun.status`)

Display your current mood or feeling via kibun.social integration.

### Tangled Repositories (`sh.tangled.repo`)

Display code repositories with descriptions, labels, and metadata.

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

- **TypeScript** – Full type safety throughout
- **Prettier** – Consistent code formatting
- **svelte-check** – Svelte-specific linting
- **Svelte 5 Runes** – Modern reactivity with better performance

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open-source. See the [LICENSE](./LICENSE) file for more details on the website source code specifically and the [THIRD-PARTY-LICENSES.txt](./THIRD-PARTY-LICENSES.txt) file for third-party dependencies.

## 🔗 Links

- [AT Protocol Documentation](https://atproto.com/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Bluesky](https://bsky.app/)
- [WhiteWind](https://whtwnd.com/)
- [Leaflet](https://leaflet.pub/)
- [teal.fm](https://teal.fm/)
- [kibun.social](https://kibun.social/)
- [MusicBrainz](https://musicbrainz.org/)
- [Tangled](https://tangled.sh/)
- [Linkat](https://linkat.blue/)

## 💡 Tips & Troubleshooting

### Finding Your DID

1. Visit [PDSls](https://pdsls.dev/)
2. Enter your handle (e.g., `ewancroft.uk`)
3. Look for the `did:plc` (or `did:web`) in the Repository field
4. If not visible, click the arrow to the right of the text

### Cache Management

The AT Protocol services use an in-memory cache with configurable TTL:

```typescript
import { cache } from '$lib/services/atproto';

// Clear all cache
cache.clear();

// Clear a specific entry
cache.delete('profile:did:plc:...');

// Get cache statistics
const profile = cache.get<ProfileData>('profile:did:plc:...');
```

### Music Status Not Showing Artwork

If your music status doesn't show album artwork:

1. Ensure your scrobbler (e.g., piper) is including `releaseMbId` in records
2. The system will automatically search MusicBrainz if IDs are missing
3. Check browser console for MusicBrainz search results
4. Fallback to blob storage if available
5. Icon placeholder displays if no artwork is found

### Documents Not Found

1. Verify `PUBLIC_ATPROTO_DID` is correct
2. Check slug mapping in `src/lib/config/slugs.ts`
3. Ensure publication rkey matches your Leaflet publication
4. Verify documents are published (not drafts)
5. If using WhiteWind, ensure `PUBLIC_ENABLE_WHITEWIND=true`
6. Check browser console for AT Protocol service errors

### Wolf Mode Not Working

1. Ensure JavaScript is enabled
2. Check browser console for errors
3. Wolf mode preserves navigation and interactive elements
4. Numbers and abbreviations are preserved intentionally

### Build Errors

1. Clear `.svelte-kit` directory: `rm -rf .svelte-kit`
2. Remove `node_modules`: `rm -rf node_modules`
3. Clear package lock: `rm package-lock.json`
4. Reinstall: `npm install`
5. Try building: `npm run build`

## 🙏 Acknowledgements

- Thanks to the AT Protocol team for creating an open, decentralized protocol
- Thanks to the Bluesky, WhiteWind, Leaflet, teal.fm, kibun.social, Tangled, and Linkat teams
- Thanks to MusicBrainz for providing free album artwork via the Cover Art Archive
- Inspired by the personal-web movement and IndieWeb principles
- Built with love using modern web technologies

---

Built with ❤️ using SvelteKit, AT Protocol, and open-source tools
