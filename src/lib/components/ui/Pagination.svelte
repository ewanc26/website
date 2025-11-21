<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	interface Props {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
		onPageChange: (page: number) => void;
	}

	let { currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: Props = $props();

	/**
	 * Generate page numbers for pagination
	 */
	function getPageNumbers(current: number, total: number): (number | string)[] {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		const pages: (number | string)[] = [1];

		if (current > 3) {
			pages.push('...');
		}

		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (current < total - 2) {
			pages.push('...');
		}

		if (total > 1) {
			pages.push(total);
		}

		return pages;
	}

	const pageNumbers = $derived(getPageNumbers(currentPage, totalPages));
	const startItem = $derived((currentPage - 1) * itemsPerPage + 1);
	const endItem = $derived(Math.min(currentPage * itemsPerPage, totalItems));
</script>

{#if totalPages > 1}
	<div class="mt-12">
		<div class="flex items-center justify-center gap-2">
			<!-- Previous Button -->
			<button
				onclick={() => currentPage > 1 && onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				class="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-canvas-300 bg-canvas-100 text-ink-700 transition-colors hover:bg-canvas-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-canvas-100 dark:border-canvas-700 dark:bg-canvas-900 dark:text-ink-200 dark:hover:bg-canvas-800 dark:disabled:hover:bg-canvas-900"
				aria-label="Previous page"
			>
				<ChevronLeft class="h-5 w-5" />
			</button>

			<!-- Page Numbers -->
			{#each pageNumbers as page}
				{#if page === '...'}
					<span class="px-2 text-ink-500 dark:text-ink-400">...</span>
				{:else}
					<button
						onclick={() => onPageChange(page as number)}
						class="flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border-2 px-3 font-medium transition-colors {currentPage ===
						page
							? 'border-primary-500 bg-primary-500 text-white dark:border-primary-400 dark:bg-primary-400'
							: 'border-canvas-300 bg-canvas-100 text-ink-700 hover:bg-canvas-200 dark:border-canvas-700 dark:bg-canvas-900 dark:text-ink-200 dark:hover:bg-canvas-800'}"
						aria-label="Page {page}"
						aria-current={currentPage === page ? 'page' : undefined}
					>
						{page}
					</button>
				{/if}
			{/each}

			<!-- Next Button -->
			<button
				onclick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				class="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-canvas-300 bg-canvas-100 text-ink-700 transition-colors hover:bg-canvas-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-canvas-100 dark:border-canvas-700 dark:bg-canvas-900 dark:text-ink-200 dark:hover:bg-canvas-800 dark:disabled:hover:bg-canvas-900"
				aria-label="Next page"
			>
				<ChevronRight class="h-5 w-5" />
			</button>
		</div>

		<!-- Page Info -->
		<p class="mt-4 text-center text-sm text-ink-600 dark:text-ink-300">
			Page {currentPage} of {totalPages} &middot; Showing {startItem}–{endItem} of {totalItems}
			{totalItems === 1 ? 'item' : 'items'}
		</p>
	</div>
{/if}
