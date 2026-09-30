<script lang="ts">
  import { onMount } from "svelte";
  import SeoHead from "$lib/components/SeoHead.svelte";
  import { consumeReaderReturnTo, initReaderSession } from "$lib/services/atproto/commentClient";

  let { data } = $props();

  let status = $state("Completing your AT Protocol OAuth session…");
  let failed = $state(false);

  onMount(async () => {
    try {
      const session = await initReaderSession();
      if (!session) throw new Error("No AT Protocol OAuth session was returned.");
      location.replace(consumeReaderReturnTo());
    } catch (cause) {
      status = cause instanceof Error ? cause.message : "AT Protocol sign-in failed.";
      failed = true;
    }
  });
</script>

<SeoHead title="Signing in…" siteInfo={data.siteInfo} />

<main class="page prose-page">
  <h1 class="page-title">Signing in to comment</h1>
  <p role={failed ? "alert" : undefined}>{status}</p>
  {#if failed}
    <p><a href="/blog">Return to the blog</a></p>
  {/if}
</main>
