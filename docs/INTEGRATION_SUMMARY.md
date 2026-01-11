# Standard.site Lexicons Integration Summary

## What Was Done

Successfully integrated [Standard.site](https://standard.site/) lexicons into the website alongside existing Leaflet and WhiteWind support. The integration uses the lexicons as a reference (from `/Volumes/Storage/Developer/clones/standard-site-lexicons`) to fetch and display Standard.site publications and documents.

## Changes Made

### 1. Type Definitions (`/src/lib/services/atproto/types.ts`)
Added comprehensive TypeScript types for Standard.site:
- `StandardSiteThemeColor` - RGB/RGBA color values
- `StandardSiteBasicTheme` - Theme with background, foreground, accent colors
- `StandardSitePublication` - Publication metadata
- `StandardSitePublicationsData` - Collection of publications
- `StandardSiteDocument` - Document metadata and content
- `StandardSiteDocumentsData` - Collection of documents
- Updated `BlogPost` platform type to include `'standard.site'`

### 2. Fetch Service (`/src/lib/services/atproto/standard.ts`)
Created new service module with two main functions:

**`fetchStandardSitePublications()`**
- Fetches all `site.standard.publication` records
- Resolves publication icons from AT Protocol blobs
- Extracts theme colors and preferences
- Caches results with key `standard-site:publications:{DID}`

**`fetchStandardSiteDocuments()`**
- Fetches all `site.standard.document` records
- Maps documents to their publications
- Resolves cover images from blobs
- Builds canonical URLs based on publication URL + document path
- Handles both publication-based and loose documents
- Sorts by `publishedAt` (newest first)
- Caches results with key `standard-site:documents:{DID}`

### 3. Blog Feed Integration (`/src/lib/services/atproto/posts.ts`)
Updated `fetchBlogPosts()` to include Standard.site documents:
- Fetches documents from Standard.site alongside WhiteWind and Leaflet
- Adds documents to unified feed with platform `'standard.site'`
- Preserves existing sorting and top 5 limitation

### 4. Exports (`/src/lib/services/atproto/index.ts`)
Exported new types and functions:
- All Standard.site types
- `fetchStandardSitePublications`
- `fetchStandardSiteDocuments`

### 5. Slug Mappings (`/src/lib/data/slug-mappings.ts`)
Enhanced slug mapping configuration:
- Added `PublicationPlatform` type: `'leaflet' | 'standard.site'`
- Extended `SlugMapping` interface with optional `platform` field
- Updated all existing mappings to explicitly use `platform: 'leaflet'`
- Added examples for Standard.site mappings in comments
- Defaults to `'leaflet'` for backwards compatibility

### 6. Slug Configuration (`/src/lib/config/slugs.ts`)
Added platform-aware slug resolution:
- New `getPublicationFromSlug()` returns `{ rkey, platform }`
- Maintained `getPublicationRkeyFromSlug()` for backwards compatibility
- Imports `PublicationPlatform` type

### 7. Slug Route Handler (`/src/routes/[slug=slug]/+server.ts`)
Updated to support both platforms:
- Uses `getPublicationFromSlug()` instead of `getPublicationRkeyFromSlug()`
- Branches logic based on platform
- For Standard.site: Uses publication URL directly
- For Leaflet: Uses base_path or /lish format
- Updated error messages to reference correct config file

### 8. Document Route Handler (`/src/routes/[slug=slug]/[rkey]/+server.ts`)
Enhanced document detection and routing:
- Updated `detectPostPlatform()` to accept and prioritize `platform` parameter
- Added Standard.site document detection via `site.standard.document` collection
- Verifies document belongs to requested publication
- Builds URLs using publication URL + document path
- Falls back to Leaflet and WhiteWind as needed
- Updated error messages with platform-specific information

### 9. Documentation (`/docs/standard-site-integration.md`)
Created comprehensive documentation covering:
- Overview of Standard.site lexicons
- Supported lexicon collections and their fields
- File structure and changes
- Usage examples and code snippets
- Type definitions
- URL resolution patterns
- Caching strategy
- Integration with blog feed
- Component examples
- Troubleshooting guide

## Lexicon Collections Supported

### `site.standard.publication`
- Fetched from AT Protocol records
- Provides publication metadata, theme, and URL
- Used for slug-based routing

### `site.standard.document`
- Fetched from AT Protocol records
- Contains full document metadata
- Supports both publication-based and standalone documents
- Integrated into unified blog feed

## URL Patterns

### Publication Redirects
- `/{slug}` → `{publication.url}`

### Document Redirects
- `/{slug}/{rkey}` → `{publication.url}{document.path}`

## Backwards Compatibility

All changes maintain full backwards compatibility:
- Existing Leaflet slugs work without modification
- `getPublicationRkeyFromSlug()` still works
- Default platform is `'leaflet'` if not specified
- WhiteWind integration unchanged

## Testing Recommendations

1. **Slug Mappings**: Add a Standard.site publication to `slug-mappings.ts`
2. **Publications**: Test fetching via `fetchStandardSitePublications()`
3. **Documents**: Test fetching via `fetchStandardSiteDocuments()`
4. **Blog Feed**: Verify Standard.site docs appear in `fetchBlogPosts()`
5. **Routing**: Test `/{slug}` and `/{slug}/{rkey}` redirects
6. **Themes**: Verify theme colors are correctly extracted
7. **Images**: Check icon and cover image blob resolution

## Next Steps

To use this integration:

1. Create `site.standard.publication` records in your AT Protocol repository
2. Create `site.standard.document` records linked to your publications
3. Add slug mappings with `platform: 'standard.site'`
4. Access content via slug routes (e.g., `/myblog`, `/myblog/3labc123`)

## Reference

The lexicons were integrated based on the schema definitions in:
- `/Volumes/Storage/Developer/clones/standard-site-lexicons/src/lexicons/`

Key lexicon files referenced:
- `site.standard.publication.ts`
- `site.standard.document.ts`
- `site.standard.theme.basic.ts`
- `site.standard.theme.color.ts`
- `site.standard.graph.subscription.ts` (not yet integrated)

## Architecture

The integration follows the same patterns as Leaflet:
- Fetch functions in dedicated service module
- Type definitions in shared types file
- Caching via existing cache infrastructure
- Slug-based routing via slug configuration
- Platform detection in route handlers
- Unified blog feed integration

This ensures consistency with the existing codebase and makes it easy to maintain both platforms side-by-side.
