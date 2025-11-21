<script lang="ts">
	import { LinkCard } from '$lib/components/layout/main/card';
	import type { SiteInfoData } from '$lib/services/atproto';
	import type { SiteMetadata } from '$lib/helper/siteMeta';

	export let data: {
		siteInfo: SiteInfoData | null;
		error: string | null;
		meta: SiteMetadata;
	};

	const { siteInfo, error, meta } = data;
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
</svelte:head>

<div class="mx-auto max-w-5xl space-y-8">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold text-ink-900 md:text-5xl dark:text-ink-50">Site Meta</h1>
		<p class="text-lg text-ink-700 dark:text-ink-200">
			Information about this website, its technology, and the people who made it possible.
		</p>
	</div>

	{#if error}
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

			{#if siteInfo.technologyStack?.length}
				<section
					class="rounded-xl bg-canvas-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900"
				>
					<h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Technology Stack</h2>
					<div class="space-y-2">
						{#each siteInfo.technologyStack as tech}
							<LinkCard url={tech.url || '#'} title={tech.name} description={tech.description} />
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
					{#if siteInfo.openSourceInfo.repositories?.length}
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

			{#if siteInfo.credits?.length}
				<section
					class="rounded-xl bg-canvas-100 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-canvas-900"
				>
					<h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Credits</h2>
					<div class="grid gap-4 md:grid-cols-2">
						{#each siteInfo.credits as credit}
							<div class="rounded-lg bg-canvas-200 p-4 dark:bg-canvas-800">
								<h4 class="font-medium text-ink-900 dark:text-ink-50">{credit.name}</h4>
								{#if credit.author}<p class="text-sm text-ink-600 dark:text-ink-400">
										by {credit.author}
									</p>{/if}
								{#if credit.description}<p class="mt-1 text-sm text-ink-700 dark:text-ink-300">
										{credit.description}
									</p>{/if}
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
