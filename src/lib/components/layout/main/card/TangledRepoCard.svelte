<script lang="ts">
	import { onMount } from 'svelte';
	import { ExternalLink, GitBranch, Server, User } from '@lucide/svelte';
	import { Card, InternalCard } from '$lib/components/ui';
	import { fetchTangledRepos, type TangledReposData, fetchProfile } from '$lib/services/atproto';
	import { PUBLIC_ATPROTO_DID } from '$env/static/public';

	let repos: TangledReposData | null = $state(null);
	let handle: string | null = $state(null);
	let loading = $state(true);
	let error: string | null = $state(null);

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

	// Build the tangled.org URL: tangled.org/[handle or did]/[repo]
	// Prefer handle if available, otherwise use DID
	function buildRepoUrl(repoName: string): string {
		const identifier = handle || PUBLIC_ATPROTO_DID;
		return `https://tangled.org/${identifier}/${repoName}`;
	}

	// Extract knot server name from DID or URL
	function getKnotServerName(knot: string): string {
		if (knot.startsWith('http')) {
			try {
				return new URL(knot).hostname;
			} catch {
				return knot;
			}
		}
		// If it's a DID, just return it as-is
		return knot;
	}
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
						<InternalCard href={buildRepoUrl(repo.name)}>
							{#snippet children()}
								<GitBranch
									class="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400"
									aria-hidden="true"
								/>
								<div class="min-w-0 flex-1 space-y-2">
									<h3
										class="overflow-wrap-anywhere font-semibold wrap-break-word text-ink-900 dark:text-ink-50"
									>
										{repo.name}
									</h3>
									<div
										class="flex flex-wrap items-center gap-3 text-xs text-ink-700 dark:text-ink-200"
									>
										<div class="flex min-w-0 items-center gap-1">
											<Server class="h-3 w-3 shrink-0" aria-hidden="true" />
											<span class="truncate">{getKnotServerName(repo.knot)}</span>
										</div>
										<div class="flex min-w-0 items-center gap-1">
											<User class="h-3 w-3 shrink-0" aria-hidden="true" />
											<span class="truncate">{handle || PUBLIC_ATPROTO_DID}</span>
										</div>
									</div>
								</div>
								<ExternalLink
									class="h-4 w-4 shrink-0 text-ink-700 transition-colors dark:text-ink-200"
									aria-hidden="true"
								/>
							{/snippet}
						</InternalCard>
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
