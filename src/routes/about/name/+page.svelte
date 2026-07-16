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
	ogSubtitle={data.post.description}
	ogType="ABOUT"
/>

<main class="shell-prose">
	<header class="post-hd">
		<h1 class="post-title">{data.post.title}</h1>
		{#if data.post.description}
			<p class="post-deck">{data.post.description}</p>
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
						<div class="post-provenance">
							<div class="post-provenance-row">
								<span class="post-provenance-label">via</span>
								<a
									href="https://standard.site"
									target="_blank"
									rel="noopener"
									aria-label="Standard.site"
									class="post-provenance-link"
								>
									<StandardSite size={14} /> Standard.site
								</a>
								<a
									href="https://leaflet.pub"
									target="_blank"
									rel="noopener"
									aria-label="Leaflet"
									class="post-provenance-link"
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
