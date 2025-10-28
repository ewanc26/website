import type { RequestHandler } from '@sveltejs/kit';
import {
	PUBLIC_ATPROTO_DID,
	PUBLIC_SITE_TITLE,
	PUBLIC_SITE_DESCRIPTION,
	PUBLIC_SITE_URL,
	PUBLIC_ENABLE_WHITEWIND
} from '$env/static/public';
import { fetchBlogPosts, fetchLeafletPublications } from '$lib/services/atproto';
import { getPublicationRkeyFromSlug } from '$lib/config/slugs';

/**
 * RSS 2.0 feed for publications (accessed via /{slug}/rss)
 *
 * Strategy:
 * 1. If WhiteWind is disabled or no WhiteWind posts exist, redirect to Leaflet RSS feed
 * 2. If WhiteWind is enabled and WhiteWind posts exist, generate RSS with WhiteWind posts
 * 3. If mixed content and WhiteWind is enabled, prioritize WhiteWind and generate RSS for those
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
		const publicationPosts = posts.filter(
			p => p.publicationRkey === publicationRkey || p.platform === 'WhiteWind'
		);

		// Separate WhiteWind and Leaflet posts
		const whiteWindPosts = publicationPosts.filter((p) => p.platform === 'WhiteWind');
		const leafletPosts = publicationPosts.filter((p) => p.platform === 'leaflet');

		// If WhiteWind is enabled and we have WhiteWind posts, generate RSS for them
		if (PUBLIC_ENABLE_WHITEWIND === 'true' && whiteWindPosts.length > 0) {
			// slug is guaranteed to be defined here
			return generateWhiteWindRSS(whiteWindPosts, slug as string);
		}

		// If WhiteWind is disabled or only Leaflet posts exist, redirect to Leaflet RSS feed
		if (leafletPosts.length > 0) {
			return await redirectToLeafletRSS(publicationRkey);
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
 * Generate RSS feed for WhiteWind posts
 */
function generateWhiteWindRSS(posts: Array<any>, slug: string): Response {
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
		const description = post.description || 'Read this post on WhiteWind';

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

/**
 * Redirect to Leaflet's native RSS feed
 */
async function redirectToLeafletRSS(publicationRkey: string): Promise<Response> {
	try {
		const { publications } = await fetchLeafletPublications();

		// Find the specific publication
		const publication = publications.find((p) => p.rkey === publicationRkey);
		
		if (publication) {
			const rssUrl = getLeafletRSSUrl(publication);
			return Response.redirect(rssUrl, 307); // Temporary redirect
		}

		// Publication not found
		return new Response(
			`Leaflet publication not found for rkey: ${publicationRkey}`,
			{
				status: 404,
				headers: {
					'Content-Type': 'text/plain; charset=utf-8'
				}
			}
		);
	} catch (error) {
		console.error('Error redirecting to Leaflet RSS:', error);
		return new Response('Error finding Leaflet RSS feed', {
			status: 500,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}
}

/**
 * Get the RSS URL for a Leaflet publication
 */
function getLeafletRSSUrl(publication: { basePath?: string; rkey: string }): string {
	if (publication.basePath) {
		// Ensure basePath is a complete URL
		const basePath = publication.basePath.startsWith('http') 
			? publication.basePath 
			: `https://${publication.basePath}`;
		return `${basePath}/rss`;
	}

	// Fallback to Leaflet /lish format
	return `https://leaflet.pub/lish/${PUBLIC_ATPROTO_DID}/${publication.rkey}/rss`;
}

function escapeXml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
