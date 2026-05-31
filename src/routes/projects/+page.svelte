<script lang="ts">
	import SiteHead from '$lib/components/SiteHead.svelte';
	import { ExternalLink } from '@lucide/svelte';

	let { data } = $props();
</script>

<SiteHead title="Projects" description={data.publication?.description} />

<main class="page-content" style="padding-top: var(--space-lg);">
	<header style="margin-bottom: var(--space-xl);">
		<h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">Projects</h1>
		{#if data.publication}
			<p style="margin: 0; opacity: 0.7;">{data.publication.description}</p>
			<a href={data.publication.url} target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: var(--space-xs); margin-top: var(--space-sm); font-size: var(--text-sm); color: var(--color-primary-500); text-decoration: none;">
				{data.publication.url.replace('https://', '')}
				<ExternalLink size={12} strokeWidth={2} style="opacity: 0.6;" />
			</a>
		{/if}
	</header>

	<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-sm);">
		{#each data.projects as project}
			<li style="padding: var(--space-sm) var(--space-3); border: 1px solid var(--surface-color); border-radius: 4px;">
				<strong style="display: block; margin-bottom: var(--space-2xs);">{project.title}</strong>
				{#if project.description}
					<p style="margin: 0; font-size: var(--text-sm); opacity: 0.7; line-height: 1.5;">{project.description}</p>
				{/if}
				{#if project.path}
					<span style="font-size: var(--text-xs); opacity: 0.4; font-family: var(--font-mono, monospace);">{project.path}</span>
				{/if}
			</li>
		{/each}
	</ul>
</main>
