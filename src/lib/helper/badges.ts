import type { BlogPost } from '$lib/services/atproto';

export interface PostBadge {
	text: string;
	color: 'mint' | 'sage' | 'jade' | 'ink';
	variant: 'soft' | 'solid';
}

/**
 * Get badge configuration for a post based on platform and publication
 * Standard.site posts get jade color styling
 */
export function getPostBadges(post: BlogPost): PostBadge[] {
	const badges: PostBadge[] = [];

	// Platform badge - Standard.site
	badges.push({ text: 'Standard.site', color: 'jade', variant: 'solid' });

	// Publication name badge
	if (post.publicationName) {
		badges.push({ text: post.publicationName, color: 'jade', variant: 'soft' });
	}

	return badges;
}

/**
 * Get badge CSS classes
 */
export function getBadgeClasses(badge: PostBadge): string {
	const baseStyle =
		badge.variant === 'soft'
			? 'px-2 py-0.5 text-xs font-medium rounded'
			: 'px-2 py-0.5 text-xs font-semibold uppercase rounded';

	const colorClasses = {
		mint:
			badge.variant === 'soft'
				? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200'
				: 'bg-secondary-500 text-white dark:bg-secondary-600',
		sage:
			badge.variant === 'soft'
				? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
				: 'bg-primary-500 text-white dark:bg-primary-600',
		jade:
			badge.variant === 'soft'
				? 'bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200'
				: 'bg-accent-500 text-white dark:bg-accent-600',
		ink:
			badge.variant === 'soft'
				? 'bg-ink-100 text-ink-800 dark:bg-ink-800 dark:text-ink-100'
				: 'bg-ink-700 text-white dark:bg-ink-300 dark:text-ink-900'
	};

	return `${baseStyle} ${colorClasses[badge.color]}`;
}
