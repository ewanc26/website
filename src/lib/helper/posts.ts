import type { BlogPost } from '$lib/services/atproto';
import { getUserLocale } from '$lib/utils/locale';

export interface MonthData {
	monthName: string;
	posts: BlogPost[];
}

export type GroupedPosts = Map<number, Map<number, MonthData>>;

/**
 * Filter posts based on search query
 */
export function filterPosts(posts: BlogPost[], query: string): BlogPost[] {
	if (!query.trim()) return posts;

	const lowerQuery = query.toLowerCase();
	return posts.filter((post) => {
		const titleMatch = post.title.toLowerCase().includes(lowerQuery);
		const descMatch = post.description?.toLowerCase().includes(lowerQuery);
		const platformMatch = post.platform.toLowerCase().includes(lowerQuery);
		const pubMatch = post.publicationName?.toLowerCase().includes(lowerQuery);
		const tagsMatch = post.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));
		return titleMatch || descMatch || platformMatch || pubMatch || tagsMatch;
	});
}

/**
 * Groups blog posts by year and month
 */
export function groupPostsByDate(posts: BlogPost[], locale?: string): GroupedPosts {
	const userLocale = locale || getUserLocale();
	const grouped: GroupedPosts = new Map();

	posts.forEach((post) => {
		const date = new Date(post.createdAt);
		const year = date.getFullYear();
		const month = date.getMonth();
		const monthName = date.toLocaleString(userLocale, { month: 'long' });

		if (!grouped.has(year)) {
			grouped.set(year, new Map());
		}

		const yearGroup = grouped.get(year)!;
		if (!yearGroup.has(month)) {
			yearGroup.set(month, { monthName, posts: [] });
		}

		yearGroup.get(month)!.posts.push(post);
	});

	// Sort posts within each month by date (newest first)
	grouped.forEach((yearGroup) => {
		yearGroup.forEach((monthData) => {
			monthData.posts.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
		});
	});

	return grouped;
}

/**
 * Get sorted months for a year group
 */
export function getSortedMonths(yearGroup: Map<number, MonthData>): [number, MonthData][] {
	return Array.from(yearGroup.entries()).sort((a, b) => b[0] - a[0]);
}

/**
 * Get sorted years from grouped posts
 */
export function getSortedYears(groupedPosts: GroupedPosts): number[] {
	return Array.from(groupedPosts.keys()).sort((a, b) => b - a);
}

/**
 * Extract all unique tags from posts
 */
export function getAllTags(posts: BlogPost[]): string[] {
	const tagsSet = new Set<string>();
	posts.forEach((post) => {
		post.tags?.forEach((tag) => tagsSet.add(tag));
	});
	return Array.from(tagsSet).sort();
}
