<script lang="ts">
	import { getStores } from '$app/stores';
	const { page } = getStores();

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/site/meta', label: 'Site Meta' }
	];

	import { siteMeta } from '$lib/helper/siteMeta';
</script>

<header
	class="sticky top-0 z-50 border-b border-canvas-200 bg-canvas-50/90 backdrop-blur-md dark:border-canvas-800 dark:bg-canvas-950/90"
>
	<nav class="container mx-auto flex items-center justify-between px-4 py-4">
		<!-- Logo/Brand -->
		<a href="/" class="group flex items-center gap-2">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sage-500 to-mint-500 font-bold text-ink-50 transition-transform duration-200 group-hover:scale-110"
			>
				E
			</div>
			<span class="text-xl font-bold text-ink-900 dark:text-ink-50">
				{siteMeta.title}
			</span>
		</a>

		<!-- Navigation -->
		<ul class="flex items-center gap-6">
			{#each navItems as item}
				<li>
					<a
						href={item.href}
						class="font-medium transition-colors duration-200
				       {$page.url.pathname === item.href ? 'text-sage-600' : 'text-ink-700 dark:text-ink-400'} 
					   hover:text-sage-500"
					>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
