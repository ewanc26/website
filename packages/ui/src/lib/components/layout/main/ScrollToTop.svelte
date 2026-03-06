<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronUp } from '@lucide/svelte';

	let scrollY = $state(0);
	let isVisible = $derived(scrollY > 300);

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	onMount(() => {
		const updateScrollY = () => (scrollY = window.scrollY);
		window.addEventListener('scroll', updateScrollY, { passive: true });
		return () => window.removeEventListener('scroll', updateScrollY);
	});
</script>

<svelte:window bind:scrollY />

<div
	class="fixed bottom-8 left-8 z-50 transition-opacity duration-300 motion-reduce:transition-none sm:bottom-6 sm:left-6"
	class:opacity-100={isVisible}
	class:opacity-0={!isVisible}
>
	<button
		onclick={scrollToTop}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToTop(); } }}
		aria-label="Scroll to top"
		title="Scroll to top"
		type="button"
		class="flex h-12 w-12 items-center justify-center rounded-full border border-primary-200 bg-canvas-100 text-ink-900 shadow-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary-500 hover:text-ink-50 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-11 sm:w-11 dark:border-primary-800 dark:bg-canvas-900 dark:text-ink-50 dark:hover:bg-primary-600"
	>
		<ChevronUp width="20" height="20" aria-hidden="true" />
	</button>
</div>
