import type { RequestHandler } from '@sveltejs/kit';
import {
	PUBLIC_ATPROTO_DID,
	PUBLIC_SITE_TITLE,
	PUBLIC_SITE_DESCRIPTION,
	PUBLIC_SITE_URL
} from '$env/static/public';
import { fetchBlogPosts } from '$lib/services/atproto';
import { getPublicationRkeyFromSlug } from '$lib/config/slugs';
import { generateRSSFeed, createRSSResponse, type RSSItem } from '$lib/utils/rss';

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
					title: `${PUBLIC_SITE_TITLE} - ${slug}`,
					link: PUBLIC_SITE_URL,
					description: PUBLIC_SITE_DESCRIPTION,
					language: 'en',
					selfLink: `${PUBLIC_SITE_URL}/${slug}/rss`,
					generator: 'SvelteKit with AT Protocol'
				},
				items
			);

			return createRSSResponse(feed);
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
