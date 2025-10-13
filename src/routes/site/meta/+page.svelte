<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchSiteInfo, type SiteInfoData } from '$lib/services/atproto';

	let siteInfo = $state<SiteInfoData | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			siteInfo = await fetchSiteInfo();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load site information';
		} finally {
			loading = false;
		}
	});

	function groupBy<T extends { section?: string }>(items: T[] | undefined): Map<string, T[]> {
		if (!items) return new Map();

		const grouped = new Map<string, T[]>();

		for (const item of items) {
			const section = item.section || 'General';
			if (!grouped.has(section)) {
				grouped.set(section, []);
			}
			grouped.get(section)!.push(item);
		}

		return grouped;
	}
</script>

<svelte:head>
	<title>Site Meta - Ewan's Corner</title>
	<meta
		name="description"
		content="Information about this website, its technology stack, and credits."
	/>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-8">
	<div class="mb-8">
		<h1 class="mb-4 text-4xl font-bold text-ink-900 md:text-5xl dark:text-ink-50">Site Meta</h1>
		<p class="text-lg text-ink-700 dark:text-ink-300">
			Information about this website, its technology, and the people who made it possible.
		</p>
	</div>

	{#if loading}
		<div class="space-y-6">
			{#each Array(3) as _}
				<div class="animate-pulse rounded-xl bg-canvas-200 p-6 shadow-md dark:bg-canvas-800">
					<div class="mb-4 h-6 w-1/4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					<div class="space-y-2">
						<div class="h-4 rounded bg-canvas-300 dark:bg-canvas-700"></div>
						<div class="h-4 w-5/6 rounded bg-canvas-300 dark:bg-canvas-700"></div>
					</div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="rounded-xl bg-red-50 p-6 text-center shadow-md dark:bg-red-900/20">
			<p class="text-red-600 dark:text-red-400">{error}</p>
		</div>
	{:else if siteInfo}
		<div class="space-y-8">
			{#each [{ title: 'Purpose', content: siteInfo.additionalInfo?.purpose }, { title: 'History', content: siteInfo.additionalInfo?.websiteBirthYear ? `This website was first launched in ${siteInfo.additionalInfo.websiteBirthYear}.` : null }, { title: 'Privacy', content: siteInfo.privacyStatement }] as section}
				{#if section.content}
					<section
						class="rounded-xl bg-canvas-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900"
					>
						<h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">{section.title}</h2>
						<p class="whitespace-pre-wrap text-ink-700 dark:text-ink-300">{section.content}</p>
					</section>
				{/if}
			{/each}

			{#if siteInfo.technologyStack && siteInfo.technologyStack.length > 0}
				<section
					class="rounded-xl bg-canvas-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900"
				>
					<h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Technology Stack</h2>
					<div class="grid gap-4 md:grid-cols-2">
						{#each siteInfo.technologyStack as tech}
							<div
								class="rounded-lg bg-canvas-200 p-4 transition-colors hover:bg-canvas-300 dark:bg-canvas-800 dark:hover:bg-canvas-700"
							>
								{#if tech.url}
									<a
										href={tech.url}
										target="_blank"
										rel="noopener noreferrer"
										class="font-semibold text-sage-500 hover:underline dark:text-sage-400"
									>
										{tech.name}
									</a>
								{:else}
									<h3 class="font-semibold text-ink-900 dark:text-ink-50">{tech.name}</h3>
								{/if}
								{#if tech.description}
									<p class="mt-1 text-sm text-ink-700 dark:text-ink-300">{tech.description}</p>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if siteInfo.openSourceInfo}
				<section
					class="rounded-xl bg-canvas-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900"
				>
					<h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Open Source</h2>
					{#if siteInfo.openSourceInfo.description}
						<p class="mb-4 whitespace-pre-wrap text-ink-700 dark:text-ink-300">
							{siteInfo.openSourceInfo.description}
						</p>
					{/if}

					{#if siteInfo.openSourceInfo.repositories && siteInfo.openSourceInfo.repositories.length > 0}
						<div class="space-y-2">
							{#each siteInfo.openSourceInfo.repositories as repo}
								<a
									href={repo.url}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 rounded-lg bg-canvas-200 p-3 transition-colors hover:bg-canvas-300 dark:bg-canvas-800 dark:hover:bg-canvas-700"
								>
									<div class="flex-1">
										<div class="flex items-center gap-2">
											{#if repo.platform}
												<span class="text-xs font-medium text-ink-600 uppercase dark:text-ink-400"
													>{repo.platform}</span
												>
											{/if}
											{#if repo.type}
												<span
													class="rounded bg-mint-100 px-2 py-0.5 text-xs text-mint-700 dark:bg-mint-900 dark:text-mint-300"
													>{repo.type}</span
												>
											{/if}
										</div>
										{#if repo.description}
											<p class="text-sm text-ink-700 dark:text-ink-300">{repo.description}</p>
										{/if}
									</div>
									<svg
										class="h-4 w-4 text-ink-600 dark:text-ink-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										/>
									</svg>
								</a>
							{/each}
						</div>
					{/if}
				</section>
			{/if}

			{#if siteInfo.credits && siteInfo.credits.length > 0}
				<section
					class="rounded-xl bg-canvas-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900"
				>
					<h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Credits</h2>
					<div class="grid gap-4 md:grid-cols-2">
						{#each siteInfo.credits as credit}
							<div class="rounded-lg bg-canvas-200 p-4 dark:bg-canvas-800">
								<h4 class="font-medium text-ink-900 dark:text-ink-50">{credit.name}</h4>
								{#if credit.author}
									<p class="text-sm text-ink-600 dark:text-ink-400">by {credit.author}</p>
								{/if}
								{#if credit.description}
									<p class="mt-1 text-sm text-ink-700 dark:text-ink-300">{credit.description}</p>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{:else}
		<div class="rounded-xl bg-canvas-100 p-12 text-center shadow-lg dark:bg-canvas-900">
			<p class="text-ink-700 dark:text-ink-300">No site information available.</p>
		</div>
	{/if}
</div>
