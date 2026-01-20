# Standard.site Lexicons Integration

This document describes the integration of [Standard.site](https://standard.site/) lexicons into the website, enabling support for AT Protocol-based long-form content alongside Leaflet and WhiteWind.

## Overview

Standard.site provides shared lexicon schemas for long-form publishing on the AT Protocol. The integration allows your website to:

- Fetch and display Standard.site publications
- Fetch and display Standard.site documents
- Use slug-based routing for Standard.site content
- Mix Standard.site content with Leaflet and WhiteWind in blog feeds

## Lexicon Collections

The integration supports the following Standard.site lexicon collections:

### `site.standard.publication`

Publications represent websites, blogs, or content platforms. Each publication defines:

- `name`: Publication name
- `url`: Base URL for the publication
- `description`: Brief description
- `icon`: Square publication icon (at least 256x256)
- `basicTheme`: Simplified theme with background, foreground, accent colors
- `preferences`: Platform preferences (e.g., `showInDiscover`)

### `site.standard.document`

Documents represent individual articles, posts, or content. Each document includes:

- `title`: Document title
- `site`: Publication reference (AT URI) or standalone URL
- `path`: Document path (combined with site for canonical URL)
- `description`: Brief description or excerpt
- `coverImage`: Thumbnail or cover image
- `content`: Open union for various content formats
- `textContent`: Plaintext representation
- `bskyPostRef`: Reference to Bluesky post for comments
- `tags`: Array of tags (without hashtags)
- `publishedAt`: Publish timestamp (required)
- `updatedAt`: Last edit timestamp

## File Structure

### New Files

- `/src/lib/services/atproto/standard.ts` - Standard.site-specific fetch functions
- `/docs/standard-site-integration.md` - This documentation

### Modified Files

- `/src/lib/services/atproto/types.ts` - Added Standard.site types
- `/src/lib/services/atproto/index.ts` - Exported Standard.site functions
- `/src/lib/services/atproto/posts.ts` - Integrated Standard.site into blog feed
- `/src/lib/data/slug-mappings.ts` - Added platform support
- `/src/lib/config/slugs.ts` - Added platform-aware functions
- `/src/routes/[slug=slug]/+server.ts` - Added Standard.site redirect support
- `/src/routes/[slug=slug]/[rkey]/+server.ts` - Added Standard.site document routing

## Usage

### 1. Configure Slug Mappings

Add Standard.site publications to your slug mappings in `/src/lib/data/slug-mappings.ts`:

```typescript
export const slugMappings: SlugMapping[] = [
	{
		slug: 'blog',
		publicationRkey: 'abc123xyz',
		platform: 'standard.site'
	},
	{
		slug: 'notes',
		publicationRkey: 'def456uvw',
		platform: 'leaflet'
	}
];
```

### 2. Fetch Standard.site Data

Use the provided fetch functions in your components or routes:

```typescript
import { fetchStandardSitePublications, fetchStandardSiteDocuments } from '$lib/services/atproto';

// Fetch all publications
const { publications } = await fetchStandardSitePublications();

// Fetch all documents
const { documents } = await fetchStandardSiteDocuments();

// Documents are automatically sorted by publishedAt (newest first)
```

### 3. Access via Slug Routes

Standard.site content is accessible via slug routes:

- `/{slug}` - Redirects to the publication URL
- `/{slug}/{rkey}` - Redirects to the specific document URL

Example:

- `/blog` → Redirects to the Standard.site publication URL
- `/blog/3labc123xyz` → Redirects to the document at publication URL + document path

## Type Definitions

### StandardSitePublication

```typescript
interface StandardSitePublication {
	name: string;
	rkey: string;
	uri: string;
	url: string;
	description?: string;
	icon?: string;
	basicTheme?: StandardSiteBasicTheme;
	preferences?: {
		showInDiscover?: boolean;
	};
}
```

### StandardSiteDocument

```typescript
interface StandardSiteDocument {
	title: string;
	rkey: string;
	uri: string;
	url: string;
	site: string;
	path?: string;
	description?: string;
	coverImage?: string;
	content?: any;
	textContent?: string;
	bskyPostRef?: {
		uri: string;
		cid: string;
	};
	tags?: string[];
	publishedAt: string;
	updatedAt?: string;
	publicationName?: string;
	publicationRkey?: string;
}
```

### StandardSiteBasicTheme

```typescript
interface StandardSiteBasicTheme {
	background: StandardSiteThemeColor;
	foreground: StandardSiteThemeColor;
	accent: StandardSiteThemeColor;
	accentForeground: StandardSiteThemeColor;
}

interface StandardSiteThemeColor {
	r: number; // 0-255
	g: number; // 0-255
	b: number; // 0-255
	a?: number; // 0-100 (only for rgba)
}
```

## Integration with Blog Feed

Standard.site documents are automatically included in the unified blog feed alongside Leaflet and WhiteWind posts:

```typescript
const { posts } = await fetchBlogPosts();

// Posts include platform property: 'WhiteWind' | 'leaflet' | 'standard.site'
posts.forEach((post) => {
	console.log(`${post.title} from ${post.platform}`);
});
```

## URL Resolution

Standard.site documents support two URL patterns:

### 1. Publication-Based

When `site` points to a publication record (`at://...`):

```
{publication.url}{document.path}
```

Example:

- Publication URL: `https://myblog.com`
- Document path: `/my-first-post`
- Result: `https://myblog.com/my-first-post`

### 2. Loose Documents

When `site` is a direct URL:

```
{site}{document.path}
```

Example:

- Site: `https://myblog.com`
- Document path: `/standalone-post`
- Result: `https://myblog.com/standalone-post`

## Caching

All Standard.site data is cached using the same cache system as other AT Protocol services:

- Publications: Cached with key `standard-site:publications:{DID}`
- Documents: Cached with key `standard-site:documents:{DID}`

Cache entries follow the standard TTL and can be invalidated via the cache service.

## Example: Creating a Standard.site Document Component

```svelte
<script lang="ts">
	import type { StandardSiteDocument } from '$lib/services/atproto';

	export let document: StandardSiteDocument;
</script>

<article>
	<h1>{document.title}</h1>

	{#if document.description}
		<p class="description">{document.description}</p>
	{/if}

	{#if document.coverImage}
		<img src={document.coverImage} alt={document.title} />
	{/if}

	<div class="meta">
		<time datetime={document.publishedAt}>
			{new Date(document.publishedAt).toLocaleDateString()}
		</time>

		{#if document.tags && document.tags.length > 0}
			<div class="tags">
				{#each document.tags as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
		{/if}
	</div>

	{#if document.textContent}
		<div class="content">
			{document.textContent}
		</div>
	{/if}

	<a href={document.url}>Read full article →</a>
</article>
```

## Resources

- [Standard.site](https://standard.site/) - Full specification and documentation
- [Standard.site Lexicons Repository](https://github.com/standard-site/lexicons)
- [AT Protocol](https://atproto.com/) - The underlying protocol
- [Lexicon Documentation](https://atproto.com/specs/lexicon) - AT Protocol lexicon spec

## Migration Notes

If you're migrating content from Leaflet to Standard.site:

1. Both platforms can coexist - no need to choose one
2. Update slug mappings to specify `platform: 'standard.site'` for new publications
3. Standard.site uses `publishedAt` instead of Leaflet's timestamp field
4. Standard.site documents have a more flexible content model via the open union

## Troubleshooting

### Documents not appearing in feed

- Verify the document has a valid `publishedAt` timestamp
- Check that the document's `site` field correctly references your publication
- Ensure the publication is correctly configured in slug mappings

### Redirect not working

- Confirm the publication URL is properly formatted (should start with `http://` or `https://`)
- Check that the document's `path` field is set (defaults to `/{rkey}` if omitted)
- Verify the slug mapping has the correct `publicationRkey` and `platform: 'standard.site'`

### Images not loading

- Ensure blob URLs are correctly resolved through the PDS
- Check that the `icon` and `coverImage` blobs are properly uploaded
- Verify blob CIDs are correctly referenced in the lexicon records
