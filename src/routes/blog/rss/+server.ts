import type { RequestHandler } from '@sveltejs/kit';
import {
	PUBLIC_ATPROTO_DID,
	PUBLIC_SITE_TITLE,
	PUBLIC_SITE_DESCRIPTION,
	PUBLIC_SITE_URL,
	PUBLIC_LEAFLET_BASE_PATH,
	PUBLIC_LEAFLET_BLOG_PUBLICATION,
	PUBLIC_ENABLE_WHITEWIND
} from '$env/static/public';
import { fetchBlogPosts, fetchLeafletPublications } from '$lib/services/atproto';

/**
 * RSS 2.0 feed for blog posts
 *
 * Strategy:
 * 1. If WhiteWind is disabled or no WhiteWind posts exist, redirect to Leaflet RSS feed
 * 2. If WhiteWind is enabled and WhiteWind posts exist, generate RSS with WhiteWind posts
 * 3. If mixed content and WhiteWind is enabled, prioritize WhiteWind and generate RSS for those
 */
export const GET: RequestHandler = async () => {
	try {
		const { posts } = await fetchBlogPosts();

		// Separate WhiteWind and Leaflet posts
		const whiteWindPosts = posts.filter((p) => p.platform === 'WhiteWind');
		const leafletPosts = posts.filter((p) => p.platform === 'leaflet');

		// If WhiteWind is enabled and we have WhiteWind posts, generate RSS for them
		if (PUBLIC_ENABLE_WHITEWIND === 'true' && whiteWindPosts.length > 0) {
			return generateWhiteWindRSS(whiteWindPosts);
		}

		// If WhiteWind is disabled or only Leaflet posts exist, redirect to Leaflet RSS feed
		if (leafletPosts.length > 0) {
			return await redirectToLeafletRSS();
		}

		// No posts at all
		return new Response('No blog posts found', {
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
function generateWhiteWindRSS(posts: Array<any>): Response {
	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(PUBLIC_SITE_TITLE)} - Blog</title>
    <link>${escapeXml(PUBLIC_SITE_URL)}</link>
    <description>${escapeXml(PUBLIC_SITE_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(PUBLIC_SITE_URL)}/blog/rss" rel="self" type="application/rss+xml" />
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
async function redirectToLeafletRSS(): Promise<Response> {
	try {
		const { publications } = await fetchLeafletPublications();

		// If a specific publication is configured, use that
		if (PUBLIC_LEAFLET_BLOG_PUBLICATION) {
			const publication = publications.find((p) => p.rkey === PUBLIC_LEAFLET_BLOG_PUBLICATION);
			if (publication) {
				const rssUrl = getLeafletRSSUrl(publication);
				return Response.redirect(rssUrl, 307); // Temporary redirect
			}
		}

		// If there's only one publication, redirect to it
		if (publications.length === 1) {
			const rssUrl = getLeafletRSSUrl(publications[0]);
			return Response.redirect(rssUrl, 307); // Temporary redirect
		}

		// Multiple publications but no specific one configured
		return new Response(
			`Multiple Leaflet publications found. Please configure PUBLIC_LEAFLET_BLOG_PUBLICATION in your .env file to specify which publication's RSS feed to use.

Available publications:
${publications.map((p) => `- ${p.name} (rkey: ${p.rkey})`).join('\n')}

Or visit the Leaflet RSS feeds directly:
${publications.map((p) => `- ${getLeafletRSSUrl(p)}`).join('\n')}`,
			{
				status: 300, // Multiple Choices
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
	if (PUBLIC_LEAFLET_BASE_PATH) {
		return `${PUBLIC_LEAFLET_BASE_PATH}/rss`;
	}

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