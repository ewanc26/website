# Standard.site Quick Reference

## Import Functions

```typescript
import {
	fetchStandardSitePublications,
	fetchStandardSiteDocuments,
	type StandardSitePublication,
	type StandardSiteDocument
} from '$lib/services/atproto';
```

## Fetch Publications

```typescript
const { publications } = await fetchStandardSitePublications();

publications.forEach((pub) => {
	console.log(pub.name); // Publication name
	console.log(pub.url); // Base URL
	console.log(pub.icon); // Icon blob URL
	console.log(pub.basicTheme); // Theme colors
});
```

## Fetch Documents

```typescript
const { documents } = await fetchStandardSiteDocuments();

documents.forEach((doc) => {
	console.log(doc.title); // Document title
	console.log(doc.url); // Full canonical URL
	console.log(doc.publishedAt); // ISO timestamp
	console.log(doc.coverImage); // Cover image blob URL
	console.log(doc.tags); // Array of tags
	console.log(doc.publicationName); // Parent publication name
});
```

## Configure Slug Mapping

**File**: `/src/lib/data/slug-mappings.ts`

```typescript
export const slugMappings: SlugMapping[] = [
	{
		slug: 'my-blog',
		publicationRkey: '3labc123xyz',
		platform: 'standard.site' // ← Required for Standard.site
	}
];
```

## Get Publication from Slug

```typescript
import { getPublicationFromSlug } from '$lib/config/slugs';

const info = getPublicationFromSlug('my-blog');
// Returns: { rkey: '3labc123xyz', platform: 'standard.site' }
```

## Access via URLs

Once configured, content is accessible at:

- **Publication**: `https://yoursite.com/my-blog`
  - Redirects to publication URL
- **Document**: `https://yoursite.com/my-blog/3labc123xyz`
  - Redirects to `{publication.url}{document.path}`

## Theme Colors

```typescript
const theme = publication.basicTheme;

// Convert to CSS
const bgColor = `rgb(${theme.background.r}, ${theme.background.g}, ${theme.background.b})`;
const fgColor = `rgb(${theme.foreground.r}, ${theme.foreground.g}, ${theme.foreground.b})`;
const acColor = `rgb(${theme.accent.r}, ${theme.accent.g}, ${theme.accent.b})`;
```

## Blog Feed Integration

```typescript
import { fetchBlogPosts } from '$lib/services/atproto';

const { posts } = await fetchBlogPosts();

// Filter by platform
const standardPosts = posts.filter((p) => p.platform === 'standard.site');
const leafletPosts = posts.filter((p) => p.platform === 'leaflet');
const whiteWindPosts = posts.filter((p) => p.platform === 'WhiteWind');
```

## Document URL Patterns

### Publication-Based Document

```typescript
{
  site: 'at://did:plc:abc/site.standard.publication/xyz',
  path: '/my-post'
}
// URL: {publication.url}/my-post
```

### Loose Document

```typescript
{
  site: 'https://myblog.com',
  path: '/standalone-post'
}
// URL: https://myblog.com/standalone-post
```

## Collections

| Collection                  | Description               |
| --------------------------- | ------------------------- |
| `site.standard.publication` | Publication/blog metadata |
| `site.standard.document`    | Individual posts/articles |

## Cache Keys

| Data         | Cache Key                          |
| ------------ | ---------------------------------- |
| Publications | `standard-site:publications:{DID}` |
| Documents    | `standard-site:documents:{DID}`    |

## Common Patterns

### Display Publication Icon

```svelte
{#if publication.icon}
	<img src={publication.icon} alt={publication.name} />
{/if}
```

### Display Document Cover

```svelte
{#if document.coverImage}
	<img src={document.coverImage} alt={document.title} />
{/if}
```

### Display Tags

```svelte
{#if document.tags}
	<div class="tags">
		{#each document.tags as tag}
			<span class="tag">{tag}</span>
		{/each}
	</div>
{/if}
```

### Format Date

```svelte
<time datetime={document.publishedAt}>
	{new Date(document.publishedAt).toLocaleDateString()}
</time>
```

## Platform Detection

```typescript
// In route handlers
import type { PublicationPlatform } from '$lib/data/slug-mappings';

if (platform === 'standard.site') {
	// Handle Standard.site
} else if (platform === 'leaflet') {
	// Handle Leaflet
}
```

## Troubleshooting

| Issue                 | Solution                                                           |
| --------------------- | ------------------------------------------------------------------ |
| Documents not showing | Check `publishedAt` is set                                         |
| Redirects not working | Verify publication `url` starts with `http://` or `https://`       |
| Images not loading    | Check blob CIDs and PDS resolution                                 |
| Slug not found        | Add mapping to `slug-mappings.ts` with `platform: 'standard.site'` |

## Resources

- [Standard.site Docs](https://standard.site/)
- [Full Integration Guide](/docs/standard-site-integration.md)
- [AT Protocol Lexicons](https://atproto.com/specs/lexicon)
