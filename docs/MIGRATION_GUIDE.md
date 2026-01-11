# Migrating from Leaflet to Standard.site

This guide helps you migrate content from Leaflet to Standard.site or run both platforms side-by-side.

## Should You Migrate?

**Consider Standard.site if you want:**
- More flexible content models (open union for content types)
- Direct theme integration (colors defined in publication)
- Better document organization (tags, paths, cover images)
- Stronger ties to your own domain (site URL is part of publication)
- Bluesky integration (post references for comments)

**Stay with Leaflet if you prefer:**
- The Leaflet ecosystem and community
- The /lish hosted format
- Simpler publication structure

**You can use both!** The integration supports running Leaflet and Standard.site simultaneously.

## Side-by-Side Setup (Recommended)

The easiest approach is to use both platforms together:

### 1. Keep Existing Leaflet Setup
Your existing Leaflet publications continue to work:

```typescript
// src/lib/data/slug-mappings.ts
export const slugMappings: SlugMapping[] = [
  {
    slug: 'blog',
    publicationRkey: '3m3x4bgbsh22k',
    platform: 'leaflet'  // Existing Leaflet blog
  },
  // ... other Leaflet mappings
];
```

### 2. Add Standard.site Publications
Add new Standard.site publications alongside:

```typescript
export const slugMappings: SlugMapping[] = [
  // Existing Leaflet
  {
    slug: 'blog',
    publicationRkey: '3m3x4bgbsh22k',
    platform: 'leaflet'
  },
  // New Standard.site
  {
    slug: 'articles',
    publicationRkey: '3labc123xyz',
    platform: 'standard.site'
  }
];
```

### 3. Content Appears in Unified Feed
Both platforms' content automatically appears in `fetchBlogPosts()`:

```typescript
const { posts } = await fetchBlogPosts();
// Returns posts from both Leaflet and Standard.site
```

## Full Migration Path

If you want to completely switch from Leaflet to Standard.site:

### Step 1: Create Standard.site Publication

Create a `site.standard.publication` record in your AT Protocol repository:

```json
{
  "$type": "site.standard.publication",
  "name": "My Blog",
  "url": "https://myblog.com",
  "description": "My personal blog about technology",
  "icon": { /* blob reference */ },
  "basicTheme": {
    "background": { "r": 255, "g": 255, "b": 255 },
    "foreground": { "r": 0, "g": 0, "b": 0 },
    "accent": { "r": 59, "g": 130, "b": 246 },
    "accentForeground": { "r": 255, "g": 255, "b": 255 }
  },
  "preferences": {
    "showInDiscover": true
  }
}
```

### Step 2: Migrate Documents

For each Leaflet document, create a corresponding Standard.site document:

**Leaflet Document:**
```json
{
  "$type": "pub.leaflet.document",
  "title": "My Post",
  "publication": "at://did:plc:abc/pub.leaflet.publication/xyz",
  "content": { /* markdown or HTML */ },
  "createdAt": "2024-01-01T12:00:00Z"
}
```

**Standard.site Document:**
```json
{
  "$type": "site.standard.document",
  "title": "My Post",
  "site": "at://did:plc:abc/site.standard.publication/xyz",
  "path": "/my-post",
  "description": "A brief description of my post",
  "content": { /* open union - flexible format */ },
  "textContent": "Plain text version...",
  "tags": ["technology", "tutorial"],
  "publishedAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

### Step 3: Update Slug Mapping

Change the platform in your slug mapping:

```typescript
// Before
{
  slug: 'blog',
  publicationRkey: 'leaflet-rkey',
  platform: 'leaflet'
}

// After
{
  slug: 'blog',
  publicationRkey: 'standard-site-rkey',
  platform: 'standard.site'
}
```

### Step 4: Test Migration

1. **Publications**: Verify publications appear via `fetchStandardSitePublications()`
2. **Documents**: Check documents via `fetchStandardSiteDocuments()`
3. **URLs**: Test redirects at `/{slug}` and `/{slug}/{rkey}`
4. **Blog Feed**: Confirm posts appear in `fetchBlogPosts()`

### Step 5: Archive Leaflet Content (Optional)

You can keep Leaflet records for historical purposes or delete them:

- **Keep**: Records remain accessible via AT Protocol
- **Delete**: Use AT Protocol tools to delete records (careful - permanent!)

## Field Mapping Reference

| Leaflet Field | Standard.site Field | Notes |
|---------------|---------------------|-------|
| `title` | `title` | Direct mapping |
| `publication` | `site` | Both use AT URI reference |
| `content` | `content` | Standard.site uses open union |
| - | `textContent` | New: plaintext version |
| - | `description` | New: excerpt/summary |
| - | `path` | New: document URL path |
| - | `coverImage` | New: cover/thumbnail |
| `createdAt` | `publishedAt` | Rename for clarity |
| - | `updatedAt` | New: track edits |
| - | `tags` | New: categorization |
| - | `bskyPostRef` | New: link to Bluesky post |

## Theme Migration

Leaflet doesn't have built-in themes, but Standard.site does:

```typescript
// Define your theme in the publication
const theme = {
  background: { r: 255, g: 255, b: 255 },      // White
  foreground: { r: 17, g: 24, b: 39 },         // Dark gray
  accent: { r: 59, g: 130, b: 246 },           // Blue
  accentForeground: { r: 255, g: 255, b: 255 } // White
};

// Use in your site
const bgColor = `rgb(${theme.background.r}, ${theme.background.g}, ${theme.background.b})`;
```

## URL Structure Comparison

### Leaflet URLs

**Publication:**
- With base_path: `https://myblog.com`
- Without: `https://leaflet.pub/lish/{DID}/{publicationRkey}`

**Document:**
- With base_path: `https://myblog.com/{rkey}`
- Without: `https://leaflet.pub/lish/{DID}/{publicationRkey}/{rkey}`

### Standard.site URLs

**Publication:**
- `{publication.url}` (e.g., `https://myblog.com`)

**Document:**
- `{publication.url}{document.path}` (e.g., `https://myblog.com/my-post`)

## Migration Tools

### Automated Migration Script (Example)

```typescript
// migrate-to-standard-site.ts
import { fetchLeafletPublications, fetchStandardSitePublications } from '$lib/services/atproto';

async function migratePublication(leafletRkey: string) {
  // 1. Fetch Leaflet publication
  const { publications: leafletPubs } = await fetchLeafletPublications();
  const leafletPub = leafletPubs.find(p => p.rkey === leafletRkey);
  
  if (!leafletPub) {
    throw new Error('Leaflet publication not found');
  }
  
  // 2. Create Standard.site publication
  const standardPub = {
    $type: 'site.standard.publication',
    name: leafletPub.name,
    url: leafletPub.basePath || 'https://example.com',
    description: leafletPub.description,
    // ... map other fields
  };
  
  // 3. Create record via AT Protocol
  // (use @atproto/api to create the record)
  
  console.log('Migration complete!');
}
```

### Manual Migration Checklist

- [ ] Create Standard.site publication record
- [ ] Migrate document records one by one
- [ ] Update slug mappings
- [ ] Test all URLs
- [ ] Verify blog feed
- [ ] Update external links (if any)
- [ ] Archive or delete Leaflet records

## Rollback Plan

If you need to rollback:

1. **Revert slug mappings** to use `platform: 'leaflet'`
2. **Keep Standard.site records** - they won't interfere
3. **Test Leaflet URLs** to ensure they work again

## FAQ

**Q: Can I migrate gradually?**  
A: Yes! Use both platforms side-by-side and migrate publications one at a time.

**Q: Will my old Leaflet URLs break?**  
A: Only if you change the slug mapping. Keep the old mapping to preserve URLs.

**Q: Can I use the same slug for both platforms?**  
A: No, each slug can only map to one publication. Use different slugs (e.g., `blog-old` and `blog-new`).

**Q: What happens to Bluesky post references?**  
A: Standard.site has native support for `bskyPostRef` - you can link documents to Bluesky posts for comments.

**Q: Do I need to migrate images?**  
A: No, blobs in AT Protocol work the same way. Both platforms use the same blob storage.

**Q: Can I keep using Leaflet's editor?**  
A: The Leaflet editor creates Leaflet records. You'll need to use Standard.site-compatible tools or the AT Protocol API directly.

## Support Resources

- [Standard.site Documentation](https://standard.site/)
- [Standard.site Integration Guide](/docs/standard-site-integration.md)
- [Quick Reference](/docs/STANDARD_SITE_QUICK_REF.md)
- [AT Protocol API Docs](https://atproto.com/)

## Example Migration Timeline

**Week 1: Preparation**
- Read documentation
- Test Standard.site locally
- Create test publication

**Week 2: Pilot Migration**
- Migrate one small publication
- Test thoroughly
- Gather feedback

**Week 3-4: Full Migration**
- Migrate remaining publications
- Update all slug mappings
- Monitor for issues

**Week 5: Cleanup**
- Archive Leaflet records
- Update documentation
- Celebrate! 🎉
