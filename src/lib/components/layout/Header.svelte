<script lang="ts">
	import { createSiteMeta, type SiteMetadata } from '$lib/helper/siteMeta';
	import { defaultSiteMeta } from '$lib/helper/siteMeta';
	import NavLinks from './NavLinks.svelte';
	import { navItems } from '$lib/data/navItems';

	const siteMeta: SiteMetadata = createSiteMeta(defaultSiteMeta);
</script>

<header class="sticky top-0 z-50 border-b border-canvas-200 bg-canvas-50/90 backdrop-blur-md dark:border-canvas-800 dark:bg-canvas-950/90">
	<nav class="container mx-auto flex items-center justify-between px-4 py-4">
		<a href="/" class="group flex items-center gap-2">
			<span class="max-w-[200px] truncate text-xl font-bold text-ink-900 dark:text-ink-50">
				{siteMeta.title}
			</span>
		</a>

		<NavLinks {navItems} />
	</nav>
</header>