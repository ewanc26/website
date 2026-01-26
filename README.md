# AT Protocol Personal Website

A modern, feature-rich personal website powered by AT Protocol, built with SvelteKit 2 and Tailwind CSS 4.

> **Note**: This repository contains the source code for [Ewan's Corner](https://ewancroft.uk). The current configuration (environment variables, slug mappings, static files) is specific to that website, but the codebase is designed to be easily adapted for your own AT Protocol-powered site. See [Configuration Guide](./docs/configuration.md) for detailed setup instructions.

## 🌟 Features

### Core AT Protocol Integration

- **Dynamic Profile Display**: Automatically fetch and display your Bluesky profile information with avatar, banner, follower counts, pronouns, and bio
- **Site Metadata**: Store and display comprehensive site information using the `uk.ewancroft.site.info` lexicon (credits, tech stack, privacy statement, licenses)
- **Smart Caching**: Intelligent in-memory cache with configurable TTL support for all AT Protocol data
- **PDS Resolution**: Automatic PDS discovery with fallback to Bluesky public API for maximum reliability
- **Standard.site Integration**: Full support for Standard.site document storage and display

### Content & Publishing

- **Standard.site Publishing System**:
  - Store and retrieve documents using the Standard.site protocol
  - Multi-publication support via slug mapping
  - Intelligent RSS feed generation
  - Archive page displaying all your documents
  - Full integration with the AT Protocol ecosystem
  - Automatic document fetching and caching

- **Flexible Publication Management**:
  - Map friendly URL slugs to Standard.site publications
  - Support for unlimited publications with individual configurations
  - Smart redirects to publication URLs
  - Publication-filtered RSS feeds

- **Bluesky Post Display**:
  - Showcase latest non-reply posts with rich media support
  - Full thread context with recursive parent fetching
  - Quoted post embedding with media preservation
  - Image galleries with alt text support
  - External link cards with preview generation
  - Video embed support with HLS.js streaming

- **Engagement Tracking**:
  - Real-time like and repost counts via Constellation API
  - Paginated engagement data fetching
  - Cached engagement metrics for performance

### Music Integration (via teal.fm)

- **Now Playing Display**: Show currently playing or recently played tracks via `fm.teal.alpha.actor.status`
- **Play History**: Display listening history via `fm.teal.alpha.feed.play`
- **Album Artwork System**:
  - **Server-side Proxy**: CORS-free artwork fetching through `/api/artwork` endpoint
  - **Cascading Fallback**: MusicBrainz → iTunes → Deezer → Last.fm
  - **MusicBrainz Integration**: Cover Art Archive with automatic release search
  - **Smart Caching**: Caches artwork URLs and search results
  - **AT Protocol Blob Fallback**: Uses blob storage when external artwork unavailable
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

- **12 Color Themes**: Choose from a curated selection of beautiful color themes:
  - **Neutral**: Sage, Monochrome, Slate
  - **Warm**: Ruby, Coral, Sunset, Amber
  - **Cool**: Forest, Teal, Ocean
  - **Vibrant**: Lavender, Rose
  - All themes use OKLCH color space for perceptually uniform colors
  - System preference detection with manual override
  - Persistent theme selection across sessions

- **Link Board**: Display curated link collections from Linkat (`blue.linkat.board`) with emoji icons

- **Dark Mode**: Seamless light/dark theme switching with system preference detection

- **Wolf Mode**: Fun "wolf speak" text transformation toggle that converts text to wolf sounds while preserving:
  - Numbers and abbreviations (1K, 2M, 30s, etc.)
  - Capitalization patterns (UPPERCASE → AWOO, Capitalized → Awoo)
  - Punctuation and formatting
  - Navigation and interactive elements

- **Decimal Clock**: Unique decimal time display (optional feature)

- **Happy Mac Easter Egg**: Hidden surprise for visitors to discover

- **Scroll to Top**: Smooth scroll-to-top button for long pages

- **Responsive Design**: Mobile-first layout that adapts to all screen sizes

- **SEO Optimization**: Comprehensive meta tags, Open Graph, and Twitter Card support

- **RSS/Atom Feeds**: Multiple feed endpoints for blog posts and status updates

- **Archive Page**: Browse all your Standard.site documents in one place

### Technical Features

- **Type-Safe Development**: Full TypeScript support with comprehensive type definitions
- **Smart Error Handling**: Graceful degradation with informative error states
- **Loading States**: Skeleton loaders for all async content
- **Image Optimization**: Lazy loading and responsive image handling
- **Blob URL Construction**: Proper PDS blob URL generation for media assets
- **Media Extraction**: Automatic CID extraction from various image object formats
- **Facet Processing**: Rich text with link detection and mention highlighting
- **Video Streaming**: HLS.js integration for adaptive video playback
- **Configurable Cache TTL**: Fine-tune cache durations for different data types
- **CORS Support**: Flexible cross-origin configuration for API endpoints

## 📋 Configuration

For detailed configuration instructions, see the [Configuration Guide](./docs/configuration.md).

Quick start:

1. Copy `.env` to `.env.local` and update with your AT Protocol DID
2. Configure publication slugs in `src/lib/config/slugs.ts`
3. Update static files (robots.txt, sitemap.xml, favicons)
4. Customize themes in `src/lib/config/themes.config.ts` (optional)
5. Run `npm install && npm run dev`

### Environment Variables

```ini
# Required: Your AT Protocol DID
PUBLIC_ATPROTO_DID=did:plc:your-did-here

# Optional: Blog fallback URL
PUBLIC_BLOG_FALLBACK_URL=https://example.com/blog

# Optional: Slingshot integration
PUBLIC_LOCAL_SLINGSHOT_URL=http://localhost:3000
PUBLIC_SLINGSHOT_URL=https://slingshot.microcosm.blue

# Site Metadata (for SEO and social sharing)
PUBLIC_SITE_TITLE=Your Site Title
PUBLIC_SITE_DESCRIPTION=Your site description
PUBLIC_SITE_KEYWORDS=your, keywords, here
PUBLIC_SITE_URL=https://yoursite.com

# CORS Configuration (comma-separated origins)
PUBLIC_CORS_ALLOWED_ORIGINS=https://yoursite.com,https://www.yoursite.com

# Optional: Customizable Cache TTL (in seconds)
CACHE_TTL_PROFILE=60
CACHE_TTL_SITE_INFO=120
CACHE_TTL_LINKS=60
CACHE_TTL_MUSIC_STATUS=10
CACHE_TTL_KIBUN_STATUS=15
CACHE_TTL_TANGLED_REPOS=60
CACHE_TTL_BLOG_POSTS=30
CACHE_TTL_PUBLICATIONS=60
CACHE_TTL_INDIVIDUAL_POST=60
CACHE_TTL_IDENTITY=1440
```

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

   Edit `.env.local` with your settings (see [Configuration Guide](./docs/configuration.md) for details)

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
│   │   │   ├── HappyMacEasterEgg.svelte
│   │   │   ├── layout/          # Header, Footer, Navigation
│   │   │   │   ├── ColorThemeToggle.svelte
│   │   │   │   ├── DecimalClock.svelte
│   │   │   │   ├── DecimalClockInfoBox.svelte
│   │   │   │   ├── ThemeToggle.svelte
│   │   │   │   ├── WolfToggle.svelte
│   │   │   │   └── main/
│   │   │   │       ├── card/    # Status cards
│   │   │   │       │   ├── BlueskyPostCard.svelte
│   │   │   │       │   ├── KibunStatusCard.svelte
│   │   │   │       │   ├── LinkCard.svelte
│   │   │   │       │   ├── MusicStatusCard.svelte
│   │   │   │       │   ├── PostCard.svelte
│   │   │   │       │   ├── ProfileCard.svelte
│   │   │   │       │   └── TangledRepoCard.svelte
│   │   │   │       ├── DynamicLinks.svelte
│   │   │   │       └── ScrollToTop.svelte
│   │   │   ├── seo/             # MetaTags component
│   │   │   └── ui/              # Reusable UI components
│   │   │       ├── BlogPostCard.svelte
│   │   │       ├── Card.svelte
│   │   │       ├── DocumentCard.svelte
│   │   │       ├── Dropdown.svelte
│   │   │       ├── Pagination.svelte
│   │   │       ├── PostsGroupedView.svelte
│   │   │       ├── SearchBar.svelte
│   │   │       └── Tabs.svelte
│   │   ├── config/              # Configuration files
│   │   │   ├── cache.config.ts  # Cache TTL settings
│   │   │   ├── slugs.ts         # Slug to publication mapping
│   │   │   └── themes.config.ts # Theme definitions
│   │   ├── data/                # Static data (navigation items)
│   │   ├── helper/              # Helper functions (meta tags, OG images)
│   │   ├── services/            # External service integrations
│   │   │   └── atproto/         # AT Protocol service layer
│   │   │       ├── agents.ts    # Agent management & PDS resolution
│   │   │       ├── cache.ts     # In-memory caching
│   │   │       ├── documents.ts # Standard.site documents
│   │   │       ├── engagement.ts # Post engagement (likes/reposts)
│   │   │       ├── fetch.ts     # Profile, status, site info, music
│   │   │       ├── media.ts     # Blob URL & image handling
│   │   │       ├── musicbrainz.ts # MusicBrainz API integration
│   │   │       ├── pagination/  # Pagination utilities
│   │   │       ├── posts.ts     # Blog posts, Bluesky posts
│   │   │       ├── standard.ts  # Standard.site integration
│   │   │       └── types.ts     # TypeScript type definitions
│   │   ├── stores/              # Svelte stores
│   │   │   ├── colorTheme.ts    # Color theme management
│   │   │   ├── dropdownState.ts # Dropdown state
│   │   │   ├── happyMac.ts      # Happy Mac easter egg
│   │   │   └── wolfMode.ts      # Wolf mode text transformation
│   │   ├── styles/              # Theme CSS files
│   │   │   └── themes/          # Individual theme stylesheets
│   │   └── utils/               # Utility functions
│   ├── routes/                  # SvelteKit routes
│   │   ├── [slug=slug]/         # Dynamic slug-based routes
│   │   │   ├── [rkey]/          # Individual document redirects
│   │   │   ├── atom/            # Deprecated Atom feeds (410 Gone)
│   │   │   └── rss/             # RSS feed endpoints
│   │   ├── api/                 # API endpoints
│   │   │   └── artwork/         # Album artwork proxy
│   │   ├── archive/             # Standard.site documents archive
│   │   ├── favicon.ico/         # Favicon endpoint
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
- **posts.ts**: Standard.site documents and Bluesky posts
- **documents.ts**: Standard.site document fetching and management
- **standard.ts**: Standard.site integration utilities
- **engagement.ts**: Post engagement data (likes/reposts) via Constellation API
- **media.ts**: Image and blob URL handling with CID extraction
- **musicbrainz.ts**: MusicBrainz API integration for album artwork with cascading fallbacks
- **cache.ts**: In-memory caching with configurable TTL support
- **pagination/**: Utilities for paginated AT Protocol queries
- **types.ts**: Comprehensive TypeScript definitions for all data structures

### Usage Examples

```typescript
import {
	fetchProfile,
	fetchBlogPosts,
	fetchLatestBlueskyPost,
	fetchMusicStatus,
	fetchKibunStatus,
	fetchTangledRepos,
	fetchDocuments
} from '$lib/services/atproto';

// Fetch profile data
const profile = await fetchProfile(fetch);

// Fetch blog posts from Standard.site
const { posts } = await fetchBlogPosts(fetch);

// Fetch latest Bluesky post
const post = await fetchLatestBlueskyPost(fetch);

// Fetch current or last played music
const musicStatus = await fetchMusicStatus(fetch);

// Fetch current mood status
const kibunStatus = await fetchKibunStatus(fetch);

// Fetch code repositories
const repos = await fetchTangledRepos(fetch);

// Fetch Standard.site documents
const documents = await fetchDocuments(fetch);
```

## 📝 Publication System

The publication system uses friendly URL slugs that map to Standard.site publications with intelligent URL redirects.

### Slug Configuration

Publications are mapped to URL slugs in `src/lib/config/slugs.ts`:

```typescript
export const slugMappings: SlugMapping[] = [
	{
		slug: 'blog', // Access via /blog
		publicationRkey: '3m3x4bgbsh22k' // Standard.site publication rkey
	},
	{
		slug: 'notes', // Access via /notes
		publicationRkey: 'xyz123abc'
	}
];
```

### Publication Routes

- `/{slug}` – Redirects to your Standard.site publication homepage
- `/{slug}/{rkey}` – Redirects to the specific document on Standard.site
- `/{slug}/rss` – RSS feed for all documents in the publication
- `/{slug}/atom` – Deprecated (returns 410 Gone, use RSS instead)
- `/archive` – Browse all Standard.site documents across all publications

### RSS Feed Behavior

Generates an RSS 2.0 feed containing all documents from the specified publication:
- Includes title, link, publication date, and description
- Filtered by publication rkey
- Cached for 1 hour for performance
- Returns 404 if publication has no documents

### Finding Your Publication Rkey

1. Visit your Standard.site publication
2. The publication rkey is part of the publication's AT Protocol URI
3. You can find it in your Standard.site publication settings
4. Add it to your slug mapping in `src/lib/config/slugs.ts`

## 🎵 Music Integration

The site displays your music listening activity via teal.fm integration:

### Supported Record Types

- **`fm.teal.alpha.actor.status`**: Current "Now Playing" status with expiry
- **`fm.teal.alpha.feed.play`**: Historical play records

### Album Artwork System

The music card uses a sophisticated server-side artwork retrieval system with cascading fallbacks:

1. **Server-side API Proxy** (`/api/artwork`)
   - Solves CORS issues by proxying requests through your server
   - Caches artwork URLs to reduce external API calls
   - Handles all external API interactions

2. **Cascading Artwork Sources**:
   - **MusicBrainz Cover Art Archive** (Primary)
     - Uses `releaseMbId` from music records when available
     - Automatic search by album name + artist if ID missing
     - Free, no API key required
   - **iTunes Search API** (Fallback 1)
     - Searches by album + artist or track + artist
     - Returns high-resolution artwork (600x600)
   - **Deezer API** (Fallback 2)
     - Album artwork search
     - Multiple quality options (XL, big, medium)
   - **Last.fm API** (Fallback 3)
     - Album info with artwork
     - Requires album name
   - **AT Protocol Blob Storage** (Final Fallback)
     - Uses `artwork` field from records
     - Proper PDS blob URL construction

3. **Smart Caching**:
   - Caches MusicBrainz search results to avoid repeated lookups
   - Caches final artwork URLs
   - Configurable TTL for music status

### Features

- Displays track name, artists, album, and duration
- Shows relative timestamps ("2 minutes ago")
- Links to origin URLs (Last.fm, Spotify, etc.)
- Responsive artwork display with fallback icons
- Smart caching with configurable TTL (default: 2 minutes)
- Automatic status expiry handling
- Prioritizes album art over track art for better accuracy

### Configuration

Set your DID in `.env.local` to fetch your music status:

```ini
PUBLIC_ATPROTO_DID=did:plc:your-did-here

# Optional: Adjust music status cache duration (in seconds)
CACHE_TTL_MUSIC_STATUS=120
```

The card will automatically display your current or last played track with album artwork.

## 🎨 Theme System

The site features 12 beautiful color themes organized into four categories:

### Available Themes

**Neutral Themes**
- **Sage**: Calm green-blue
- **Monochrome**: Pure greyscale
- **Slate**: Blue-grey (default)

**Warm Themes**
- **Ruby**: Bold red
- **Coral**: Orange-pink
- **Sunset**: Warm orange
- **Amber**: Bright yellow

**Cool Themes**
- **Forest**: Natural green
- **Teal**: Blue-green
- **Ocean**: Deep blue

**Vibrant Themes**
- **Lavender**: Soft purple
- **Rose**: Pink-red

### Theme Features

- **OKLCH Color Space**: Perceptually uniform colors for consistent brightness
- **System Detection**: Automatically detects light/dark mode preference
- **Persistent Selection**: Theme choice saved across sessions
- **Smooth Transitions**: Animated color changes
- **Accessible**: All themes meet WCAG contrast requirements

### Customizing Themes

Edit `src/lib/config/themes.config.ts` to add or modify themes:

```typescript
export const THEMES: readonly ThemeDefinition[] = [
	{
		value: 'mytheme',
		label: 'My Theme',
		description: 'Custom colors',
		color: 'oklch(80% 0.2 180)',
		category: 'cool'
	},
	// ... more themes
];
```

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

- `/api/artwork` - Album artwork fetching service with cascading fallbacks

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

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `.svelte-kit` directory, ready for deployment.

## 📦 Deployment

This project uses `@sveltejs/adapter-vercel` optimized for Vercel deployment:

### Vercel (Recommended)

1. Push your repository to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Add environment variables from `.env.local`
4. Deploy

### Other Platforms

To use a different platform, change the adapter in `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-auto'; // or adapter-node, adapter-static, etc.
```

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

### Standard.site Documents

Store and display documents using the Standard.site protocol.

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
- **Prettier** – Consistent code formatting with plugins for Svelte and Tailwind
- **svelte-check** – Svelte-specific linting
- **Svelte 5 Runes** – Modern reactivity with better performance

### Tech Stack

- **Framework**: SvelteKit 2.50+ with Svelte 5
- **Styling**: Tailwind CSS 4 with typography plugin
- **AT Protocol**: @atproto/api v0.18.1
- **Video**: HLS.js for adaptive streaming
- **Icons**: @lucide/svelte
- **Build Tool**: Vite 7
- **TypeScript**: v5.9+

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

- [Standard.site](https://standard.site/)
- [teal.fm](https://teal.fm/)
- [kibun.social](https://kibun.social/)
- [MusicBrainz](https://musicbrainz.org/)
- [Tangled](https://tangled.org/)
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

### Customizing Cache TTL

Edit cache durations in `.env.local`:

```ini
# Profile data (default: 60 seconds)
CACHE_TTL_PROFILE=300

# Music status (default: 120 seconds)
CACHE_TTL_MUSIC_STATUS=60

# Kibun status (default: 120 seconds)
CACHE_TTL_KIBUN_STATUS=90
```

### Music Status Not Showing Artwork

If your music status doesn't show album artwork:

1. Ensure your scrobbler includes `releaseMbId` in records (best option)
2. The system will automatically search MusicBrainz if IDs are missing
3. Album name + artist name provides better results than track name
4. Check browser console for artwork search results
5. Fallback to AT Protocol blob storage if external sources fail
6. Icon placeholder displays if no artwork is found

The cascading fallback system tries multiple sources:
- MusicBrainz (with automatic search)
- iTunes
- Deezer
- Last.fm
- AT Protocol blob storage

### Documents Not Found

1. Verify `PUBLIC_ATPROTO_DID` is correct
2. Check slug mapping in `src/lib/config/slugs.ts`
3. Ensure publication rkey matches your Leaflet publication
4. Check browser console for AT Protocol service errors
5. Verify your Standard.site publications are properly configured
6. For Standard.site documents, check the `/archive` page

### Wolf Mode Not Working

1. Ensure JavaScript is enabled
2. Check browser console for errors
3. Wolf mode preserves navigation and interactive elements
4. Numbers and abbreviations are preserved intentionally
5. Toggle is located in the header navigation

### Theme Not Persisting

1. Check browser localStorage is enabled
2. Clear site data and try again
3. Verify the theme value is valid in `themes.config.ts`
4. Check console for theme-related errors

### Build Errors

1. Clear `.svelte-kit` directory: `rm -rf .svelte-kit`
2. Remove `node_modules`: `rm -rf node_modules`
3. Clear package lock: `rm package-lock.json`
4. Reinstall: `npm install`
5. Try building: `npm run build`

### CORS Issues with Artwork

The artwork system uses a server-side proxy to avoid CORS issues:

1. Ensure the `/api/artwork` endpoint is accessible
2. Check `PUBLIC_CORS_ALLOWED_ORIGINS` includes your domain
3. Verify external APIs (MusicBrainz, iTunes, etc.) are accessible
4. Check server logs for API errors

### SvelteKit Fetch Error

If you see "Cannot use relative URL with global fetch":

1. Ensure all data fetching functions receive the `fetch` parameter
2. Pass `fetch` from `load` functions to service functions
3. Use `event.fetch` in server-side code
4. This was fixed in the latest version

## 🙏 Acknowledgements

- Thanks to the AT Protocol team for creating an open, decentralized protocol
- Thanks to the Bluesky, Standard.site, teal.fm, kibun.social, Tangled, and Linkat teams
- Thanks to MusicBrainz, iTunes, Deezer, and Last.fm for providing free artwork APIs
- Thanks to the Cover Art Archive for hosting album artwork
- Inspired by the personal-web movement and IndieWeb principles
- Built with love using modern web technologies

---

Built with ❤️ using SvelteKit, AT Protocol, and open-source tools

**Version**: 10.6.0
