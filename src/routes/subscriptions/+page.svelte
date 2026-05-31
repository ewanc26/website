<script lang="ts">
	import SiteHead from '$lib/components/SiteHead.svelte';
	import { ExternalLink } from '@lucide/svelte';

	let { data } = $props();
</script>

<SiteHead title="Subscriptions" description="Publications I read on Standard.site." />

<main class="shell-narrow">
	<header class="page-hd">
		<h1 class="page-title">Subscriptions</h1>
		<p style="margin: var(--space-sm) 0 0; color: var(--color-ink-700);">Publications I read on Standard.site.</p>
	</header>

	{#if data.subscriptions.length === 0}
		<p style="color: var(--color-ink-600); padding: var(--space-lg) 0;">No subscriptions found.</p>
	{:else}
		<ul class="sub-list">
			{#each data.subscriptions as sub}
				<li>
					<a href={sub.url} target="_blank" rel="noopener" class="sub-row">
						<span class="sub-name">{sub.name} <ExternalLink size={12} strokeWidth={2} style="opacity: 0.4; vertical-align: middle;" /></span>
						<span class="sub-author">by {sub.authorDisplayName ?? sub.authorHandle}</span>
						{#if sub.description}
							<span class="sub-desc">{sub.description}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	.page-hd {
		padding: var(--space-lg) 0;
		border-bottom: 1px solid var(--surface-color);
	}

	.page-title {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		margin: 0;
	}

	.sub-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	.sub-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		padding: var(--space-sm) 0;
		border-bottom: 1px dashed var(--surface-color);
		text-decoration: none;
		color: inherit;
		transition: background-color var(--duration-fast) var(--ease-out-quart);
	}

	.sub-row:hover {
		background-color: var(--surface-raised);
		padding-left: var(--space-sm);
		padding-right: var(--space-sm);
		margin-left: calc(-1 * var(--space-sm));
		margin-right: calc(-1 * var(--space-sm));
	}

	.sub-name {
		font-weight: 600;
	}

	.sub-author {
		font-size: var(--text-sm);
		color: var(--color-ink-600);
	}

	.sub-desc {
		font-size: var(--text-sm);
		color: var(--color-ink-700);
	}
</style>
