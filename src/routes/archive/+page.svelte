<script lang="ts">
	import { Card, SearchBar, Pagination, Tabs, Dropdown } from '$lib/components/ui';
	import { DocumentCard } from '$lib/components/ui';
	import type { StandardSiteDocument } from '$lib/services/atproto';
	import { getUserLocale } from '$lib/utils/locale';
	import { getAllTags } from '$lib/helper/posts';

	interface Props {
		data: {
			documents: StandardSiteDocument[];
		};
	}

	let { data }: Props = $props();

	// Get user locale once
	const userLocale = getUserLocale();

	// Filter state
	let searchQuery = $state('');
	let selectedYear = $state('all');
	let selectedPublication = $state('');
	let selectedTag = $state('');
	let currentPage = $state(1);
	const documentsPerPage = 50;

	// Get available years from all documents
	const availableYears = $derived.by(() => {
		const years = new Set<number>();
		data.documents.forEach((doc) => {
			const year = new Date(doc.publishedAt).getFullYear();
			years.add(year);
		});
		return Array.from(years).sort((a, b) => b - a); // Newest first
	});

	// Create year tabs (All + individual years)
	const yearTabs = $derived([
		{ id: 'all', label: 'All Years' },
		...availableYears.map((year) => ({ id: year.toString(), label: year.toString() }))
	]);

	// Get unique publications
	const publications = $derived.by(() => {
		const pubs = new Map<string, string>();
		data.documents.forEach((doc) => {
			if (doc.publicationName && doc.publicationRkey) {
				const key = `${doc.publicationName}-${doc.publicationRkey}`;
				pubs.set(key, doc.publicationName);
			}
		});
		return Array.from(pubs.entries()).map(([key, name]) => ({
			value: key,
			label: name
		}));
	});

	// Get unique tags
	const allTags = $derived(getAllTags(data.documents));
	const tagOptions = $derived(
		allTags.map((tag) => ({
			value: tag,
			label: `#${tag}`
		}))
	);

	// Filter documents by search query
	const filteredBySearch = $derived.by(() => {
		if (!searchQuery) return data.documents;
		const query = searchQuery.toLowerCase();
		return data.documents.filter((doc) => {
			return (
				doc.title.toLowerCase().includes(query) ||
				doc.description?.toLowerCase().includes(query) ||
				doc.publicationName?.toLowerCase().includes(query) ||
				doc.tags?.some((tag) => tag.toLowerCase().includes(query))
			);
		});
	});

	// Filter by year
	const filteredByYear = $derived.by(() => {
		if (selectedYear === 'all') return filteredBySearch;
		return filteredBySearch.filter((doc) => {
			const docYear = new Date(doc.publishedAt).getFullYear();
			return docYear === parseInt(selectedYear);
		});
	});

	// Filter by publication
	const filteredByPublication = $derived.by(() => {
		if (!selectedPublication) return filteredByYear;
		return filteredByYear.filter((doc) => {
			if (!doc.publicationName || !doc.publicationRkey) return false;
			const key = `${doc.publicationName}-${doc.publicationRkey}`;
			return key === selectedPublication;
		});
	});

	// Filter by tag
	const filteredDocuments = $derived.by(() => {
		if (!selectedTag) return filteredByPublication;
		return filteredByPublication.filter((doc) => {
			return doc.tags?.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase());
		});
	});

	// Pagination calculations
	const totalPages = $derived(Math.ceil(filteredDocuments.length / documentsPerPage));
	const paginatedDocuments = $derived(
		filteredDocuments.slice((currentPage - 1) * documentsPerPage, currentPage * documentsPerPage)
	);

	// Group documents by month
	const groupedDocuments = $derived.by(() => {
		const groups = new Map<string, StandardSiteDocument[]>();

		paginatedDocuments.forEach((doc) => {
			const date = new Date(doc.publishedAt);
			const monthKey = date.toLocaleDateString(userLocale, { year: 'numeric', month: 'long' });

			if (!groups.has(monthKey)) {
				groups.set(monthKey, []);
			}
			groups.get(monthKey)!.push(doc);
		});

		return groups;
	});

	// Reset to page 1 when filters change
	$effect(() => {
		searchQuery;
		selectedYear;
		selectedPublication;
		selectedTag;
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
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold text-ink-900 md:text-5xl dark:text-ink-50">Archive</h1>
		<p class="text-lg text-ink-700 dark:text-ink-200">
			Browse all {data.documents.length} documents from Standard.site
		</p>
	</div>

	<!-- Search Bar -->
	<div class="mb-6">
		<SearchBar
			bind:value={searchQuery}
			placeholder="Search documents by title, description, publication, or tags..."
			resultCount={searchQuery ? filteredDocuments.length : undefined}
		/>
	</div>

	<!-- Filters Row -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
		<!-- Publication Dropdown -->
		{#if publications.length > 0}
			<div class="flex-1 sm:max-w-xs">
				<Dropdown
					bind:value={selectedPublication}
					options={publications}
					label="Filter by Publication"
					placeholder="All Publications"
				/>
			</div>
		{/if}

		<!-- Tag Dropdown -->
		{#if tagOptions.length > 0}
			<div class="flex-1 sm:max-w-xs">
				<Dropdown
					bind:value={selectedTag}
					options={tagOptions}
					label="Filter by Tag"
					placeholder="All Tags"
				/>
			</div>
		{/if}
	</div>

	<!-- Year Tabs (Pills) -->
	<Tabs tabs={yearTabs} activeTab={selectedYear} onTabChange={handleYearChange} />

	<!-- Archive Content -->
	{#if filteredDocuments.length === 0}
		<Card variant="flat" padding="lg">
			{#snippet children()}
				<div class="text-center">
					{#if searchQuery || selectedPublication || selectedTag}
						<p class="text-ink-700 dark:text-ink-300">
							No documents found matching your filters. Try adjusting your search or filters.
						</p>
					{:else}
						<p class="text-ink-700 dark:text-ink-300">
							No documents found. Start writing on
							<a
								href="https://standard.site/"
								class="text-primary-600 hover:underline dark:text-primary-400"
								target="_blank"
								rel="noopener noreferrer">Standard.site</a
							>!
						</p>
					{/if}
				</div>
			{/snippet}
		</Card>
	{:else}
		<!-- Grouped Documents View -->
		{#each Array.from(groupedDocuments.entries()) as [monthKey, docs]}
			<div class="mb-8">
				<h3 class="mb-4 text-lg font-semibold text-ink-900 dark:text-ink-50">{monthKey}</h3>
				<div class="space-y-3">
					{#each docs as document}
						<DocumentCard {document} locale={userLocale} />
					{/each}
				</div>
			</div>
		{/each}

		<!-- Pagination -->
		<Pagination
			{currentPage}
			{totalPages}
			totalItems={filteredDocuments.length}
			itemsPerPage={documentsPerPage}
			onPageChange={handlePageChange}
		/>
	{/if}
</div>
