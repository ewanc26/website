<script lang="ts">
  import { page } from "$app/state";
  import SeoHead from "$lib/components/SeoHead.svelte";
  import Slab from "$lib/components/Slab.svelte";
  import NotFoundEgg from "$lib/components/ostara-eggs/NotFoundEgg.svelte";
</script>

<SeoHead title="Page not found" description="That page doesn't exist here." ogType="ERROR" siteInfo={page.data.siteInfo} />

<main class="wrap">
  <p class="tape tape--a">ERROR {page.status}</p>
  <Slab word="Nowhere" long />
  <p class="lede">Whatever was here has moved, or was never here at all.</p>
  <div class="btns"><a class="btn btn--a" href="/">Back home</a><a class="btn" href="/blog">The archive</a></div>
  <NotFoundEgg />
</main>
