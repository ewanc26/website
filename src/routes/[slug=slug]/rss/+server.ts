import type { RequestHandler } from '@sveltejs/kit';
import {
	PUBLIC_ATPROTO_DID,
	PUBLIC_SITE_TITLE,
	PUBLIC_SITE_DESCRIPTION,
	PUBLIC_SITE_URL
} from '$env/static/public';
import { fetchBlogPosts } from '$lib/services/atproto';
import { getPublicationRkeyFromSlug } from '$lib/config/slugs';

/**
 * RSS 2.0 feed for Standard.site publications (accessed via /{slug}/rss)
 *
 * Generates an RSS feed for all documents in the specified publication.
 */
export const GET: RequestHandler = async ({ params }) => {
	const slug = params.slug;

	// Validate slug
	if (!slug) {
		return new Response('Invalid slug', {
			status: 400,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}

	// Get the publication rkey from the slug
	const publicationRkey = getPublicationRkeyFromSlug(slug);

	if (!publicationRkey) {
		return new Response(
			`Slug not configured: ${slug}\n\nPlease add this slug to src/lib/config/slugs.ts`,
			{
				status: 404,
				headers: {
					'Content-Type': 'text/plain; charset=utf-8'
				}
			}
		);
	}

	try {
		const { posts } = await fetchBlogPosts();

		// Filter posts for this specific publication
		const publicationPosts = posts.filter((p) => p.publicationRkey === publicationRkey);

		// Generate RSS for Standard.site posts
		if (publicationPosts.length > 0) {
			return generateRSS(publicationPosts, slug);
		}

		// No posts at all
		return new Response(`No posts found for publication: ${slug}`, {
			status: 404,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	} catch (error) {
		console.error('Error generating RSS feed:', error);
		return new Response('Error generating RSS feed', {
			status: 500,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}
};

/**
 * Generate RSS feed for Standard.site posts
 */
function generateRSS(posts: Array<any>, slug: string): Response {
	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(PUBLIC_SITE_TITLE)} - ${slug}</title>
    <link>${escapeXml(PUBLIC_SITE_URL)}</link>
    <description>${escapeXml(PUBLIC_SITE_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(PUBLIC_SITE_URL)}/${slug}/rss" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>SvelteKit with AT Protocol</generator>
${posts
	.map((post) => {
		const description = post.description || 'Read this post on Standard.site';

		return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(post.url)}</link>
      <guid isPermaLink="true">${escapeXml(post.url)}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
      <author>${escapeXml(PUBLIC_SITE_TITLE)}</author>
    </item>`;
	})
	.join('\n')}
  </channel>
</rss>`;

	return new Response(rss, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}

function escapeXml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
