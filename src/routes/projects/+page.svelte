<script lang="ts">
	import SiteHead from '$lib/components/SiteHead.svelte';
	import { ExternalLink } from '@lucide/svelte';

	let { data } = $props();
</script>

<SiteHead title="Projects" description={data.publication?.description} ogType="PROJECTS" />

<main class="shell-wide">
	<header class="page-hd">
		<h1 class="page-title">Projects</h1>
		{#if data.publication}
			<p class="page-desc">{data.publication.description}</p>
			<a href={data.publication.url} target="_blank" rel="noopener" class="section-link">
				{data.publication.url.replace('https://', '')}
				<ExternalLink size={12} strokeWidth={2} />
			</a>
		{/if}
	</header>

	<ul class="post-list">
		{#each data.projects as project}
			<li>
				<a href={project.path ?? '#'} target="_blank" rel="noopener" class="post-row">
					<div class="row-stack">
						<strong class="post-title">{project.title}</strong>
						{#if project.description}
							<span class="post-date">{project.description}</span>
						{/if}
					</div>
				</a>
			</li>
		{/each}
	</ul>
</main>
