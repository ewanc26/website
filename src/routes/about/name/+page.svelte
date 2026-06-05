<script lang="ts">
	import SiteHead from '$lib/components/SiteHead.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	import LeafletBlocks from '$lib/components/leaflet/LeafletBlocks.svelte';
	import Pentacle from '$lib/components/icons/Pentacle.svelte';
	import Leaflet from '$lib/components/icons/Leaflet.svelte';
	import StandardSite from '$lib/components/icons/StandardSite.svelte';
	import { page } from '$app/state';

	let { data } = $props();

	let useBlocks = $derived(data.post.blocks && data.post.blocks.length > 0);
</script>

<SiteHead
	title={data.post.title}
	description={data.post.metaDescription}
	ogType="ABOUT"
/>

<main class="shell-prose">
	<header class="post-hd">
		<h1 class="post-title">{data.post.title}</h1>
		{#if data.post.description}
			<p class="post-desc" style="font-size: 1.25em; color: var(--color-ink-700); margin-top: -1rem; margin-bottom: 1.5rem;">{data.post.description}</p>
		{/if}
	</header>

	<div class="post-layout">
		<aside class="post-sidebar">
			<TableOfContents container=".prose" />
		</aside>

		<div class="post-body">
			<article class="prose">
				{#if useBlocks}
					<LeafletBlocks blocks={data.post.blocks} />
				{:else}
					{@html data.post.renderedContent}
				{/if}

				<div class="post-end-marker">
					<Pentacle size={20} />
				</div>
			</article>

			<div class="post-after">
				{#if data.blog}
					<footer class="post-footer">
						<div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.8em;">
							<div style="display: flex; gap: 1rem; align-items: center;">
								<span style="color: var(--color-ink-600);">via</span>
								<a
									href="https://standard.site"
									target="_blank"
									rel="noopener"
									aria-label="Standard.site"
									style="display: flex; align-items: center; gap: 0.25rem; font-weight: 600;"
								>
									<StandardSite size={14} /> Standard.site
								</a>
								<a
									href="https://leaflet.pub"
									target="_blank"
									rel="noopener"
									aria-label="Leaflet"
									style="display: flex; align-items: center; gap: 0.25rem; font-weight: 600;"
								>
									<Leaflet size={14} /> Leaflet
								</a>
							</div>
						</div>
					</footer>
				{/if}
			</div>
		</div>
	</div>
</main>
