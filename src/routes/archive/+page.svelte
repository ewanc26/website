<script lang="ts">
	import {
		Card,
		SearchBar,
		Pagination,
		Tabs,
		PostsGroupedView,
		Dropdown
	} from '$lib/components/ui';
	import type { BlogPost } from '$lib/services/atproto';
	import { getUserLocale } from '$lib/utils/locale';
	import { filterPosts, getSortedYears, groupPostsByDate } from '$lib/helper/posts';

	interface Props {
		data: {
			allPosts: BlogPost[];
		};
	}

	let { data }: Props = $props();

	// Get user locale once
	const userLocale = getUserLocale();

	// Filter state
	let searchQuery = $state('');
	let selectedYear = $state('all');
	let selectedPublication = $state('');
	let currentPage = $state(1);
	const postsPerPage = 50;

	// Get available years from all posts
	const allGrouped = $derived(groupPostsByDate(data.allPosts, userLocale));
	const availableYears = $derived(getSortedYears(allGrouped));

	// Create year tabs (All + individual years)
	const yearTabs = $derived([
		{ id: 'all', label: 'All Years' },
		...availableYears.map((year) => ({ id: year.toString(), label: year.toString() }))
	]);

	// Get unique publications
	const publications = $derived.by(() => {
		const pubs = new Map<string, string>();
		data.allPosts.forEach((post) => {
			if (post.platform === 'leaflet' && post.publicationName) {
				const key = `${post.publicationName}-${post.publicationRkey || 'default'}`;
				pubs.set(key, post.publicationName);
			}
		});
		return Array.from(pubs.entries()).map(([key, name]) => ({
			value: key,
			label: name
		}));
	});

	// Filter posts by search, year, and publication
	const filteredBySearch = $derived(filterPosts(data.allPosts, searchQuery));

	const filteredByYear = $derived.by(() => {
		if (selectedYear === 'all') return filteredBySearch;
		return filteredBySearch.filter((post) => {
			const postYear = new Date(post.createdAt).getFullYear();
			return postYear === parseInt(selectedYear);
		});
	});

	const filteredPosts = $derived.by(() => {
		if (!selectedPublication) return filteredByYear;
		return filteredByYear.filter((post: BlogPost) => {
			if (post.platform === 'WhiteWind' && selectedPublication === 'whitewind') return true;
			if (post.platform === 'leaflet') {
				const key = `${post.publicationName}-${post.publicationRkey || 'default'}`;
				return key === selectedPublication;
			}
			return false;
		});
	});

	// Add WhiteWind to publication options if there are WhiteWind posts
	const hasWhiteWind = $derived(data.allPosts.some((p) => p.platform === 'WhiteWind'));
	const publicationOptions = $derived.by(() => [
		...(hasWhiteWind ? [{ value: 'whitewind', label: 'WhiteWind' }] : []),
		...publications
	]);

	// Pagination calculations
	const totalPages = $derived(Math.ceil(filteredPosts.length / postsPerPage));
	const paginatedPosts = $derived(
		filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
	);

	// Reset to page 1 when filters change
	$effect(() => {
		searchQuery;
		selectedYear;
		selectedPublication;
		currentPage = 1;
	});

	// Handle page changes
	function handlePageChange(page: number) {
		currentPage = page;
	}

	// Handle year tab changes
	function handleYearChange(yearId: string) {
		selectedYear = yearId;
	}
</script>

<div class="mx-auto max-w-4xl">
	<!-- Page Header -->
	<div class="mb-8">
		<h1 class="mb-4 text-4xl font-bold text-ink-900 md:text-5xl dark:text-ink-50">Archive</h1>
		<p class="text-lg text-ink-700 dark:text-ink-200">
			Browse all {data.allPosts.length} blog posts from WhiteWind and Leaflet, organised by date.
		</p>
	</div>

	<!-- Search Bar -->
	<div class="mb-6">
		<SearchBar
			bind:value={searchQuery}
			placeholder="Search posts by title, description, platform, or publication..."
			resultCount={searchQuery ? filteredPosts.length : undefined}
		/>
	</div>

	<!-- Filters Row -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
		<!-- Publication Dropdown -->
		{#if publicationOptions.length > 0}
			<div class="flex-1 sm:max-w-xs">
				<Dropdown
					bind:value={selectedPublication}
					options={publicationOptions}
					label="Filter by Publication"
					placeholder="All Publications"
				/>
			</div>
		{/if}
	</div>

	<!-- Year Tabs (Pills) -->
	<Tabs tabs={yearTabs} activeTab={selectedYear} onTabChange={handleYearChange} />

	<!-- Archive Content -->
	{#if filteredPosts.length === 0}
		<Card variant="flat" padding="lg">
			{#snippet children()}
				<div class="text-center">
					{#if searchQuery || selectedPublication}
						<p class="text-ink-700 dark:text-ink-300">
							No posts found matching your filters. Try adjusting your search or filters.
						</p>
					{:else}
						<p class="text-ink-700 dark:text-ink-300">
							No blog posts found. Start writing on
							<a
								href="https://whtwnd.com/"
								class="text-primary-600 hover:underline dark:text-primary-400"
								target="_blank"
								rel="noopener noreferrer">WhiteWind</a
							>
							or
							<a
								href="https://leaflet.pub/"
								class="text-primary-600 hover:underline dark:text-primary-400"
								target="_blank"
								rel="noopener noreferrer">Leaflet</a
							>!
						</p>
					{/if}
				</div>
			{/snippet}
		</Card>
	{:else}
		<!-- Posts Grouped View -->
		<PostsGroupedView posts={paginatedPosts} locale={userLocale} />

		<!-- Pagination -->
		<Pagination
			{currentPage}
			{totalPages}
			totalItems={filteredPosts.length}
			itemsPerPage={postsPerPage}
			onPageChange={handlePageChange}
		/>
	{/if}
</div>
