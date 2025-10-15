<script lang="ts">
	import { getStores } from '$app/stores';
	const { page } = getStores();

	const navItems = [
		{
			href: '/',
			label: 'Home',
			icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
		},
		{
			href: '/blog',
			label: 'Blog',
			icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
		},
		{
			href: '/site/meta',
			label: 'Site Meta',
			icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		}
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
						class="group flex items-center gap-2 font-medium transition-colors duration-200
				       {$page.url.pathname === item.href ? 'text-sage-600' : 'text-ink-700 dark:text-ink-400'} 
					   hover:text-sage-500"
						title={item.label}
					>
						<svg
							class="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
						</svg>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>
