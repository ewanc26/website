<script lang="ts">
	import SiteHead from '$lib/components/SiteHead.svelte';
	import { ExternalLink } from '@lucide/svelte';

	let { data } = $props();
</script>

<SiteHead title="Projects" description={data.publication?.description} />

<main class="shell-narrow">
	<header class="page-hd">
		<h1 class="page-title">Projects</h1>
		{#if data.publication}
			<p style="margin: var(--space-sm) 0 0; color: var(--color-ink-700);">{data.publication.description}</p>
			<a href={data.publication.url} target="_blank" rel="noopener" class="pub-link">
				{data.publication.url.replace('https://', '')}
				<ExternalLink size={12} strokeWidth={2} style="opacity: 0.6;" />
			</a>
		{/if}
	</header>

	<ul class="project-list">
		{#each data.projects as project}
			<li class="project-item">
				<strong class="project-name">{project.title}</strong>
				{#if project.description}
					<p class="project-desc">{project.description}</p>
				{/if}
				{#if project.path}
					<span class="project-path">{project.path}</span>
				{/if}
			</li>
		{/each}
	</ul>
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

	.pub-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		margin-top: var(--space-sm);
		font-size: var(--text-sm);
		color: var(--color-primary-500);
		text-decoration: none;
	}

	.project-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	.project-item {
		padding: var(--space-sm) 0;
		border-bottom: 1px dashed var(--surface-color);
	}

	.project-name {
		display: block;
		margin-bottom: var(--space-2xs);
	}

	.project-desc {
		margin: 0 0 var(--space-2xs);
		font-size: var(--text-sm);
		color: var(--color-ink-700);
	}

	.project-path {
		font-size: var(--text-xs);
		color: var(--color-ink-600);
		font-family: var(--font-mono);
	}
</style>
