<script lang="ts">
	import SiteHead from '$lib/components/SiteHead.svelte';
	import { ExternalLink } from '@lucide/svelte';

	let { data } = $props();
</script>

<SiteHead title="Subscriptions" description="Publications I read on Standard.site." />

<main style="padding-top: var(--space-lg);">
	<header style="margin-bottom: var(--space-xl);">
		<h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">Subscriptions</h1>
		<p style="margin: 0; opacity: 0.7;">Publications I read on Standard.site.</p>
	</header>

	{#if data.subscriptions.length === 0}
		<p style="opacity: 0.6;">No subscriptions found.</p>
	{:else}
		<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-sm);">
			{#each data.subscriptions as sub}
				<li>
					<a href={sub.url} target="_blank" rel="noopener" style="text-decoration: none; color: inherit; display: block; padding: var(--space-sm) var(--space-3); border: 1px solid var(--surface-color); border-radius: 4px;">
						<span style="display: flex; align-items: center; gap: var(--space-xs);">
							<strong>{sub.name}</strong>
							<ExternalLink size={12} strokeWidth={2} style="opacity: 0.4; flex-shrink: 0;" />
						</span>
						{#if sub.description}
							<p style="margin: var(--space-2xs) 0 0; font-size: var(--text-sm); opacity: 0.7;">{sub.description}</p>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>
