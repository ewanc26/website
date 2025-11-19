<script lang="ts">
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui';
	import { TangledRepoCard } from '$lib/components/layout/main/card';
	import { fetchTangledRepos, type TangledReposData, fetchProfile } from '$lib/services/atproto';

	let repos: TangledReposData | null = null;
	let handle: string | null = null;
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const [reposData, profile] = await Promise.all([fetchTangledRepos(), fetchProfile()]);
			repos = reposData;
			handle = profile.handle;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load Tangled repositories';
		} finally {
			loading = false;
		}
	});
</script>

<div class="mx-auto w-full max-w-2xl">
	{#if loading}
		<Card loading={true} variant="elevated" padding="md">
			{#snippet skeleton()}
				<div class="mb-4 h-6 w-32 rounded bg-canvas-300 dark:bg-canvas-700"></div>
				<div class="space-y-3">
					{#each Array(3) as _}
						<div class="h-24 rounded-lg bg-canvas-300 dark:bg-canvas-700"></div>
					{/each}
				</div>
			{/snippet}
		</Card>
	{:else if error}
		<Card error={true} errorMessage={error} />
	{:else if repos && repos.repos.length > 0}
		{@const safeRepos = repos}
		<Card variant="elevated" padding="md">
			{#snippet children()}
				<h2 class="mb-4 text-2xl font-bold text-ink-900 dark:text-ink-50">Tangled Repositories</h2>
				<div class="space-y-3">
					{#each safeRepos.repos as repo}
						<TangledRepoCard {repo} {handle} />
					{/each}
				</div>
			{/snippet}
		</Card>
	{:else}
		<Card variant="flat" padding="lg">
			{#snippet children()}
				<div class="text-center">
					<p class="text-ink-700 dark:text-ink-300">
						No Tangled repositories found. Create a <code
							class="rounded bg-canvas-200 px-1 dark:bg-canvas-800">sh.tangled.repo</code
						> record to display your repositories here.
					</p>
					<p class="mt-2 text-sm text-ink-600 dark:text-ink-400">
						Learn more about Tangled at
						<a
							href="https://tangled.sh/"
							class="text-primary-600 hover:underline dark:text-primary-400"
							target="_blank"
							rel="noopener noreferrer">https://tangled.org/</a
						>
					</p>
				</div>
			{/snippet}
		</Card>
	{/if}
</div>
