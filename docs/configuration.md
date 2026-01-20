# Configuration Guide

This guide will walk you through configuring your AT Protocol-powered personal website. Follow these steps in order to set up your site correctly.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Publication Slug Mapping](#publication-slug-mapping)
4. [Static File Customization](#static-file-customization)
5. [Optional Features](#optional-features)
6. [Advanced Configuration](#advanced-configuration)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin configuration, ensure you have:

- **Node.js 18+** installed
- **npm** package manager
- An **AT Protocol DID** (Decentralized Identifier) from Bluesky
- Basic knowledge of environment variables and JSON configuration

### Finding Your DID

Your DID is your unique identifier in the AT Protocol network.

#### Using PDSls (Recommended)

1. Visit [PDSls](https://pdsls.dev/)
2. Enter your Bluesky handle (e.g., `username.bsky.social`)
3. Look for the `Repository` field - your DID will be in the format `did:plc:...` or `did:web:...`
4. Click the arrow to the right if the full DID is not visible

**Example DID**: `did:plc:abcdef123456xyz`

---

## Environment Configuration

### Step 1: Create Your Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

**Important**: Use `.env.local` for your personal configuration. This file is ignored by git and keeps your settings private.

### Step 2: Configure Required Variables

Edit `.env.local` and set these **required** values:

```ini
# Your AT Protocol DID (Required)
PUBLIC_ATPROTO_DID=did:plc:your-actual-did-here

# Site Metadata (Required)
PUBLIC_SITE_TITLE="Your Site Name"
PUBLIC_SITE_DESCRIPTION="A brief description of your website"
PUBLIC_SITE_KEYWORDS="keywords, about, your, site"
PUBLIC_SITE_URL="https://yourdomain.com"
```

**Critical**: Replace `your-actual-did-here` with your actual DID from the Prerequisites section.

### Step 3: Configure Optional Variables

Add these optional settings based on your needs:

```ini
# WhiteWind Support (Optional, default: false)
# Set to "true" only if you use WhiteWind for blogging
PUBLIC_ENABLE_WHITEWIND=false

# Blog Fallback URL (Optional)
# Where to redirect if a blog post isn't found
# Leave empty to show a 404 error instead
PUBLIC_BLOG_FALLBACK_URL=""

# Slingshot Configuration (Optional)
# For development with local Slingshot instance
PUBLIC_LOCAL_SLINGSHOT_URL="http://localhost:3000"
PUBLIC_SLINGSHOT_URL="https://slingshot.microcosm.blue"

# CORS Configuration (Optional, but recommended)
# Comma-separated list of domains allowed to access your API
# Use "*" for development only (not secure for production)
PUBLIC_CORS_ALLOWED_ORIGINS="https://yourdomain.com"
```

### Environment Variable Reference

| Variable                      | Required | Default    | Purpose                        |
| ----------------------------- | -------- | ---------- | ------------------------------ |
| `PUBLIC_ATPROTO_DID`          | ✅ Yes   | -          | Your AT Protocol identifier    |
| `PUBLIC_SITE_TITLE`           | ✅ Yes   | -          | Website title for SEO          |
| `PUBLIC_SITE_DESCRIPTION`     | ✅ Yes   | -          | Website description for SEO    |
| `PUBLIC_SITE_KEYWORDS`        | ✅ Yes   | -          | SEO keywords                   |
| `PUBLIC_SITE_URL`             | ✅ Yes   | -          | Your website's URL             |
| `PUBLIC_ENABLE_WHITEWIND`     | ❌ No    | `false`    | Enable WhiteWind blog support  |
| `PUBLIC_BLOG_FALLBACK_URL`    | ❌ No    | `""`       | Fallback URL for missing posts |
| `PUBLIC_LOCAL_SLINGSHOT_URL`  | ❌ No    | `""`       | Local Slingshot instance URL   |
| `PUBLIC_SLINGSHOT_URL`        | ❌ No    | Public URL | Public Slingshot instance      |
| `PUBLIC_CORS_ALLOWED_ORIGINS` | ❌ No    | `"*"`      | CORS allowed origins           |

---

## Publication Slug Mapping

The slug mapping system allows you to access your Leaflet publications via friendly URLs.

### Understanding Slugs

- **Slug**: A friendly URL segment (e.g., `blog`, `essays`, `notes`)
- **Publication Rkey**: The unique identifier of your Leaflet publication
- **URL Format**: Your publications will be accessible at `https://yoursite.com/{slug}`

### Step 1: Find Your Publication Rkeys

1. Visit your Leaflet publication on [leaflet.pub](https://leaflet.pub/)
2. Look at the URL format: `https://leaflet.pub/lish/{did}/{publication-rkey}`
3. Copy the `{publication-rkey}` portion (e.g., `3m3x4bgbsh22k`)

**Example URL**: `https://leaflet.pub/lish/did:plc:abc123/3m3x4bgbsh22k`

- **Publication Rkey**: `3m3x4bgbsh22k`

### Step 2: Configure Slugs

Edit `src/lib/config/slugs.ts`:

```typescript
import type { SlugMapping } from '$lib/services/atproto';

/**
 * Maps friendly URL slugs to Leaflet publication rkeys
 *
 * Example usage:
 * - { slug: 'blog', publicationRkey: '3m3x4bgbsh22k' }
 *   Accessible at: /blog
 * - { slug: 'essays', publicationRkey: 'xyz789abc' }
 *   Accessible at: /essays
 */
export const slugMappings: SlugMapping[] = [
	{
		slug: 'blog',
		publicationRkey: '3m3x4bgbsh22k' // Replace with your actual rkey
	}
	// Add more mappings as needed:
	// {
	//  slug: 'essays',
	//  publicationRkey: 'your-essays-rkey'
	// },
	// {
	//  slug: 'notes',
	//  publicationRkey: 'your-notes-rkey'
	// }
];
```

### Step 3: Understand URL Structure

Once configured, your publications are accessible via:

- **Publication Homepage**: `/{slug}` → Redirects to Leaflet publication
- **Individual Posts**: `/{slug}/{post-rkey}` → Redirects to specific post
- **RSS Feed**: `/{slug}/rss` → RSS feed for the publication

**Example**:

- Configuration: `{ slug: 'blog', publicationRkey: '3m3x4bgbsh22k' }`
- Homepage: `https://yoursite.com/blog`
- Post: `https://yoursite.com/blog/3abc789xyz`
- RSS: `https://yoursite.com/blog/rss`

### Multiple Publications Example

```typescript
export const slugMappings: SlugMapping[] = [
	{
		slug: 'blog', // Main blog
		publicationRkey: '3m3x4bgbsh22k'
	},
	{
		slug: 'tech', // Tech articles
		publicationRkey: 'xyz789tech'
	},
	{
		slug: 'personal', // Personal writing
		publicationRkey: 'abc456personal'
	}
];
```

---

## Static File Customization

Several static files need to be customized for your site.

### Files to Update

| File                   | Purpose                | Action Required            |
| ---------------------- | ---------------------- | -------------------------- |
| `static/robots.txt`    | SEO crawling rules     | Update sitemap URL         |
| `static/sitemap.xml`   | Site structure for SEO | Update with your pages     |
| `static/.well-known/*` | Domain verification    | Replace or remove          |
| `static/favicon/*`     | Site icons             | Replace with your branding |

### Step 1: Update robots.txt

Edit `static/robots.txt`:

```text
User-agent: *
Allow: /

# Update this line with your actual domain
Sitemap: https://yourdomain.com/sitemap.xml
```

### Step 2: Update sitemap.xml

Edit `static/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://yourdomain.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Add your publication slugs -->
  <url>
    <loc>https://yourdomain.com/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Add other important pages -->
  <url>
    <loc>https://yourdomain.com/site/meta</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

### Step 3: Update Favicon

Replace files in `static/favicon/`:

1. Generate favicons using [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Replace all files in `static/favicon/` with your generated icons
3. Ensure these files are present:
   - `favicon.ico`
   - `apple-touch-icon.png`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `site.webmanifest`

### Step 4: Update or Remove .well-known Files

The `static/.well-known/` directory contains domain verification files.

#### Option A: Replace with your own

```bash
rm -rf static/.well-known/*
# Add your own verification files here
```

#### Option B: Remove entirely (if you don't need verification)

```bash
rm -rf static/.well-known/
```

Common `.well-known` files:

- `atproto-did` - AT Protocol domain verification
- `security.txt` - Security contact information
- Domain verification files for various services

---

## Optional Features

### WhiteWind Blog Support

**When to enable**: If you publish blog posts on WhiteWind (`com.whtwnd.blog.entry` records).

**Configuration**:

```ini
# In .env.local
PUBLIC_ENABLE_WHITEWIND=true
```

**Behavior**:

- With WhiteWind **disabled** (default):
  - Only Leaflet posts are fetched and displayed
  - RSS feeds redirect to Leaflet's native feeds
  - Post redirects only check Leaflet

- With WhiteWind **enabled**:
  - Both Leaflet and WhiteWind posts are displayed
  - RSS feeds include links to WhiteWind posts
  - Post redirects check Leaflet first, then WhiteWind
  - Draft and non-public WhiteWind posts are filtered out

**Note**: Most users should keep WhiteWind disabled unless they specifically use it.

### Custom Blog Fallback

Redirect users to an archive or external blog when posts aren't found.

```ini
# In .env.local
PUBLIC_BLOG_FALLBACK_URL="https://archive.yourdomain.com"
```

**Behavior**:

- If a post isn't found on Leaflet (or WhiteWind)
- AND `PUBLIC_BLOG_FALLBACK_URL` is set
- Then redirect to: `{FALLBACK_URL}/{slug}/{rkey}`

**Example**:

- Missing post: `/blog/3abc789`
- Redirects to: `https://archive.yourdomain.com/blog/3abc789`

### CORS Configuration

Control which domains can access your API endpoints.

**Development** (allow all):

```ini
PUBLIC_CORS_ALLOWED_ORIGINS="*"
```

**Production** (specific domains):

```ini
# Single domain
PUBLIC_CORS_ALLOWED_ORIGINS="https://yourdomain.com"

# Multiple domains
PUBLIC_CORS_ALLOWED_ORIGINS="https://yourdomain.com,https://app.yourdomain.com,https://www.yourdomain.com"
```

**Security Note**: Always use specific domain lists in production, never use `*`.

---

## Advanced Configuration

### Custom Lexicon Support

The site automatically displays data from these AT Protocol lexicons:

#### Site Information (`uk.ewancroft.site.info`)

- Technology stack
- Privacy statements
- Credits and licenses
- No configuration needed - automatically fetched

#### Music Status (`fm.teal.alpha.*`)

- Current playing status via teal.fm
- Automatic album artwork from MusicBrainz
- Scrobbles from Last.fm, Spotify, etc.
- No configuration needed

#### Mood Status (`social.kibun.status`)

- Current mood/feeling via kibun.social
- Emoji and text display
- No configuration needed

#### Link Board (`blue.linkat.board`)

- Curated link collections from Linkat
- Emoji icons for each link
- No configuration needed

#### Tangled Repositories (`sh.tangled.repo`)

- Code repository display
- Descriptions, labels, creation dates
- No configuration needed

**All lexicons are automatically fetched using your `PUBLIC_ATPROTO_DID`**

### Slingshot Configuration

Slingshot is an AT Protocol data aggregator for faster queries.

```ini
# Local development instance (optional)
PUBLIC_LOCAL_SLINGSHOT_URL="http://localhost:3000"

# Public instance (default fallback)
PUBLIC_SLINGSHOT_URL="https://slingshot.microcosm.blue"
```

**Default Behavior**:

1. Try local Slingshot (if URL is set and reachable)
2. Fallback to public Slingshot
3. Fallback to user's PDS
4. Fallback to Bluesky public API

**Note**: Most users can leave these at their defaults.

### Theme Customization

The site uses Tailwind CSS with custom semantic colors. To customize:

1. Edit `src/app.css` for global color scheme:

```css
@theme {
	--color-canvas: /* Background color */;
	--color-ink: /* Text color */;
	--color-primary: /* Accent color */;
}
```

1. Dark mode colors are automatically adjusted via Tailwind's `dark:` variants

1. Wolf mode and theme toggle work automatically with any color scheme

---

## Verification

After configuration, verify everything works:

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### Step 3: Check Core Features

Verify these elements appear correctly:

- [ ] **Profile Card**: Shows your Bluesky profile information
  - Avatar and banner image
  - Display name and handle
  - Bio text
  - Follower/following counts

- [ ] **Site Metadata**: Check `http://localhost:5173/site/meta`
  - Site information loads correctly
  - Credits, tech stack, privacy info display

- [ ] **Blog Access**: Test your slug configuration
  - Visit `http://localhost:5173/{your-slug}`
  - Should redirect to your Leaflet publication
  - RSS feed works at `http://localhost:5173/{your-slug}/rss`

- [ ] **Optional Features** (if enabled):
  - Music status card (if you use teal.fm)
  - Mood status card (if you use kibun.social)
  - Link board (if you use Linkat)
  - Repositories (if you use Tangled)
  - Latest Bluesky post

### Step 4: Check Browser Console

Open browser DevTools (F12) and check for:

- ✅ No error messages in Console tab
- ✅ Successful API responses in Network tab
- ✅ No 404 errors for static files

### Step 5: Test Responsive Design

Check the site at different screen sizes:

- Mobile (375px width)
- Tablet (768px width)
- Desktop (1280px+ width)

### Step 6: Verify SEO Metadata

View page source and check for:

- `<title>` tag with your site title
- `<meta name="description">` with your description
- Open Graph tags (`og:title`, `og:description`, etc.)
- Twitter Card tags (`twitter:card`, `twitter:title`, etc.)

---

## Troubleshooting

### Profile Data Not Loading

**Symptom**: Profile card shows "Profile not found" or loading state persists

**Solutions**:

1. Verify `PUBLIC_ATPROTO_DID` is correct in `.env.local`
2. Check your DID format: should be `did:plc:...` or `did:web:...`
3. Ensure your Bluesky account is active and public
4. Check browser console for specific error messages
5. Clear cache and hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Publications Not Found

**Symptom**: Blog pages show 404 or "Not Found" errors

**Solutions**:

1. Verify publication rkey in `src/lib/config/slugs.ts` matches your Leaflet publication
2. Visit your Leaflet publication URL and confirm the rkey is correct
3. Ensure the publication is public (not draft/private)
4. Check if documents exist in the publication
5. If using WhiteWind, verify `PUBLIC_ENABLE_WHITEWIND=true` if needed

### Music Status Not Showing

**Symptom**: Music card doesn't appear or shows no data

**Solutions**:

1. Verify you have teal.fm configured with your Bluesky account
2. Check if you have any scrobbles in your teal.fm history
3. Ensure your scrobbler (e.g., piper) is running and connected
4. Album artwork requires MusicBrainz IDs or blob storage
5. Check browser console for MusicBrainz API errors

### RSS Feeds Not Working

**Symptom**: RSS feed shows errors or no posts

**Solutions**:

1. Check slug configuration in `src/lib/config/slugs.ts`
2. Verify publication has published documents (not drafts)
3. If using WhiteWind:
   - Ensure `PUBLIC_ENABLE_WHITEWIND=true`
   - Verify you have published WhiteWind posts
4. Test feed URL directly: `http://localhost:5173/{slug}/rss`
5. Check Content-Type header is `application/rss+xml`

### Environment Variables Not Applied

**Symptom**: Changes to `.env.local` don't take effect

**Solutions**:

1. Restart the development server (`npm run dev`)
2. Verify variable names start with `PUBLIC_` for client-side access
3. Check for typos in variable names
4. Ensure `.env.local` is in the project root directory
5. Clear `.svelte-kit` cache: `rm -rf .svelte-kit && npm run dev`

### Build Errors

**Symptom**: `npm run build` fails with errors

**Solutions**:

```bash
# Clean build artifacts
rm -rf .svelte-kit node_modules package-lock.json

# Reinstall dependencies
npm install

# Try building again
npm run build
```

### CORS Errors in Production

**Symptom**: API requests fail with CORS errors

**Solutions**:

1. Add your production domain to `PUBLIC_CORS_ALLOWED_ORIGINS`
2. Ensure the domain includes the protocol (`https://`)
3. For multiple domains, separate with commas (no spaces)
4. Avoid using `*` in production for security
5. Check that the origin header matches exactly (including www or non-www)

### TypeScript Errors

**Symptom**: Type errors in development

**Solutions**:

```bash
# Run type checking
npm run check

# Watch mode for continuous checking
npm run check:watch

# Clear and rebuild
rm -rf .svelte-kit && npm run dev
```

### Dark Mode Not Working

**Symptom**: Dark mode toggle doesn't change theme

**Solutions**:

1. Check if browser supports `prefers-color-scheme`
2. Clear browser localStorage: `localStorage.clear()` in console
3. Verify Tailwind's dark mode is configured in `tailwind.config.js`
4. Check that dark mode classes are present in HTML (inspect element)

### Wolf Mode Issues

**Symptom**: Wolf mode toggle doesn't transform text

**Solutions**:

1. Ensure JavaScript is enabled in browser
2. Check browser console for errors
3. Verify the wolf mode store is imported correctly
4. Test on different text elements to confirm it's working
5. Remember: numbers and navigation are intentionally preserved

---

## Getting Help

If you encounter issues not covered here:

1. **Check Browser Console**: Press F12 and look for error messages
2. **Review README**: See [README.md](../README.md) for detailed feature documentation
3. **GitHub Issues**: Search existing issues or create a new one
4. **AT Protocol Docs**: Visit [atproto.com](https://atproto.com/) for protocol details
5. **SvelteKit Docs**: Check [kit.svelte.dev](https://kit.svelte.dev/) for framework help

### Useful Debugging Commands

```bash
# Check environment variables are loaded
npm run dev -- --debug

# View detailed build output
npm run build -- --verbose

# Type-check without building
npm run check

# Format code (may fix some issues)
npm run format
```

### Log Collection for Bug Reports

When reporting issues, include:

1. Browser console errors (F12 → Console tab)
2. Network tab showing failed requests (F12 → Network tab)
3. Your `.env.local` configuration (remove sensitive data like DIDs)
4. Node.js and npm versions: `node --version && npm --version`
5. Operating system and browser version

---

## Next Steps

After completing configuration:

1. **Customize Content**:
   - Update your Bluesky profile bio and banner
   - Publish posts to your Leaflet publications
   - Add site information via AT Protocol records

2. **Deploy Your Site**:
   - See [README.md](../README.md#-deployment) for deployment options
   - Choose a platform (Vercel, Netlify, Cloudflare Pages, etc.)
   - Configure production environment variables
   - Set up custom domain

3. **Enhance Your Site**:
   - Add custom styling in `src/app.css`
   - Create new components in `src/lib/components/`
   - Extend functionality with new AT Protocol lexicons
   - Customize layouts and pages

4. **Monitor and Maintain**:
   - Check RSS feeds regularly
   - Update dependencies: `npm update`
   - Monitor browser console for errors
   - Keep AT Protocol records up to date

---

## Configuration Checklist

Use this checklist to track your configuration progress:

### Required Configuration

- [ ] Set `PUBLIC_ATPROTO_DID` in `.env.local`
- [ ] Set `PUBLIC_SITE_TITLE` in `.env.local`
- [ ] Set `PUBLIC_SITE_DESCRIPTION` in `.env.local`
- [ ] Set `PUBLIC_SITE_KEYWORDS` in `.env.local`
- [ ] Set `PUBLIC_SITE_URL` in `.env.local`
- [ ] Configure slug mappings in `src/lib/config/slugs.ts`
- [ ] Update `static/robots.txt` with your domain
- [ ] Update `static/sitemap.xml` with your pages

### Optional Configuration

- [ ] Enable WhiteWind support (if needed)
- [ ] Configure blog fallback URL (if desired)
- [ ] Set CORS allowed origins for production
- [ ] Replace favicon files with your branding
- [ ] Update or remove `.well-known` files
- [ ] Configure Slingshot URLs (if using local instance)

### Verification (Checklist)

- [ ] Development server starts without errors
- [ ] Profile card loads correctly
- [ ] Blog slug redirects work
- [ ] RSS feeds generate successfully
- [ ] Optional features display (if enabled)
- [ ] SEO metadata is correct in page source
- [ ] Site works on mobile, tablet, and desktop
- [ ] Dark mode and wolf mode toggles work

### Deployment Preparation

- [ ] Test production build: `npm run build`
- [ ] Preview production build: `npm run preview`
- [ ] Configure production environment variables
- [ ] Choose and configure deployment platform
- [ ] Set up custom domain (if applicable)
- [ ] Configure SSL certificate (handled by most platforms)

---

**Configuration complete!** Your AT Protocol-powered personal website is ready to use. For detailed feature documentation, see [README.md](../README.md).
