<script lang="ts">
  import SeoHead from "$lib/components/SeoHead.svelte";

  let { data } = $props();
</script>

<SeoHead ogType="HOME" siteInfo={data.siteInfo} />

<h1>SvelteKit migration in progress: {data.siteTitle}</h1>
<p>This placeholder will be replaced page-by-page. The live site is still served by Astro.</p>
