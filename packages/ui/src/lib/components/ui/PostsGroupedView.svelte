<script lang="ts">
	import type { BlogPost } from '@ewanc26/atproto';
	import BlogPostCard from './BlogPostCard.svelte';
	import { getUserLocale } from '../../utils/locale.js';
	import { groupPostsByDate, getSortedMonths, getSortedYears } from '../../helper/posts.js';

	interface Props { posts: BlogPost[]; locale?: string; filterYear?: string | null; }
	let { posts, locale, filterYear }: Props = $props();
	let userLocale = $derived(locale || getUserLocale());
	const groupedPosts = $derived(groupPostsByDate(posts, userLocale));
	const sortedYears = $derived(
		filterYear && filterYear !== 'all'
			? [parseInt(filterYear)].filter((year) => groupedPosts.has(year))
			: getSortedYears(groupedPosts)
	);
</script>

<div class="space-y-12">
	{#each sortedYears as year}
		{@const yearGroup = groupedPosts.get(year)}
		{#if yearGroup}
			{@const sortedMonths = getSortedMonths(yearGroup)}
			<section>
				<h2 class="mb-6 text-3xl font-bold text-ink-900 dark:text-ink-50">{year}</h2>
				<div class="space-y-8">
					{#each sortedMonths as [_, monthData]}
						<div>
							<h3 class="mb-4 text-xl font-semibold text-ink-800 dark:text-ink-100">{monthData.monthName}</h3>
							<div class="space-y-3">
								{#each monthData.posts as post}
									<BlogPostCard {post} locale={userLocale} />
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	{/each}
</div>
