<script lang="ts">
  import { page } from "$app/state";
  import SeoHead from "#lib/components/SeoHead.svelte";
  import Slab from "#lib/components/Slab.svelte";
  import NotFoundEgg from "#lib/components/ostara-eggs/NotFoundEgg.svelte";

  const missing = $derived(page.status === 404);
</script>

<SeoHead
  title={missing ? "Page not found" : "Something broke"}
  description={missing ? "That page doesn't exist here." : "That page couldn't be loaded."}
  ogType="ERROR"
  siteInfo={page.data.siteInfo}
/>

<main class="wrap">
  <p class="tape tape--a">ERROR {page.status}</p>
  <Slab word={missing ? "Nowhere" : "Jammed"} long />
  <p class="lede">
    {missing ? "Whatever was here has moved, or was never here at all." : "Something broke on this page. Try again in a bit."}
  </p>
  <div class="btns"><a class="btn btn--a" href="/">Back home</a><a class="btn" href="/blog">The archive</a></div>
  {#if missing}<NotFoundEgg />{/if}
</main>
