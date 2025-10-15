<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchSiteInfo, type SiteInfoData } from '$lib/services/atproto';
	import { LinkCard } from '$lib/components/layout/main/card';

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
					<div class="space-y-2">
						{#each siteInfo.technologyStack as tech}
							<LinkCard
								url={tech.url || '#'}
								title={tech.name}
								description={tech.description}
							/>
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
								<LinkCard
									url={repo.url}
									title={repo.description || repo.url}
									description=""
									badges={[
										...(repo.platform ? [{ text: repo.platform }] : []),
										...(repo.type ? [{ text: repo.type, color: 'mint' as const }] : [])
									]}
								/>
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