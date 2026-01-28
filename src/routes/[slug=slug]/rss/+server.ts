import type { RequestHandler } from '@sveltejs/kit';
import {
	PUBLIC_ATPROTO_DID,
	PUBLIC_SITE_TITLE,
	PUBLIC_SITE_DESCRIPTION,
	PUBLIC_SITE_URL
} from '$env/static/public';
import { fetchBlogPosts } from '$lib/services/atproto';
import { getPublicationRkeyFromSlug, isTidFormat } from '$lib/config/slugs';
import { generateRSSFeed, createRSSResponse, type RSSItem } from '$lib/utils/rss';

/**
 * RSS 2.0 feed for Standard.site publications
 * 
 * Accessible via:
 * - /{slug}/rss - publication identified by slug
 * - /{publication-rkey}/rss - publication identified by rkey
 *
 * Generates an RSS feed for all documents in the specified publication.
 */
export const GET: RequestHandler = async ({ params }) => {
	const slugOrRkey = params.slug;

	// Validate input
	if (!slugOrRkey) {
		return new Response('Invalid slug or publication rkey', {
			status: 400,
			headers: {
				'Content-Type': 'text/plain; charset=utf-8'
			}
		});
	}

	let publicationRkey: string;

	// Check if input is a TID (rkey) or a slug
	if (isTidFormat(slugOrRkey)) {
		// Input is a publication rkey - use it directly
		publicationRkey = slugOrRkey;
	} else {
		// Input is a slug - look up the publication rkey
		const rkey = getPublicationRkeyFromSlug(slugOrRkey);

		if (!rkey) {
			return new Response(
				`Slug not configured: ${slugOrRkey}\n\nPlease add this slug to src/lib/config/slugs.ts`,
				{
					status: 404,
					headers: {
						'Content-Type': 'text/plain; charset=utf-8'
					}
				}
			);
		}

		publicationRkey = rkey;
	}

	try {
		const { posts } = await fetchBlogPosts();

		// Filter posts for this specific publication
		const publicationPosts = posts.filter((p) => p.publicationRkey === publicationRkey);

		// Generate RSS for Standard.site posts
		if (publicationPosts.length > 0) {
			// Convert posts to RSS items
			const items: RSSItem[] = publicationPosts.map((post) => ({
				title: post.title,
				link: post.url,
				guid: post.url,
				pubDate: post.createdAt,
				description: post.description || 'Read this post on Standard.site',
				content: post.textContent || '',
				author: PUBLIC_SITE_TITLE,
				categories: post.tags
			}));

			// Generate RSS feed
			const feed = generateRSSFeed(
				{
					title: `${PUBLIC_SITE_TITLE} - ${slugOrRkey}`,
					link: PUBLIC_SITE_URL,
					description: PUBLIC_SITE_DESCRIPTION,
					language: 'en',
					selfLink: `${PUBLIC_SITE_URL}/${slugOrRkey}/rss`,
					generator: 'SvelteKit with AT Protocol'
				},
				items
			);

			return createRSSResponse(feed);
		}

		// No posts at all
		return new Response(`No posts found for publication: ${slugOrRkey}`, {
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
