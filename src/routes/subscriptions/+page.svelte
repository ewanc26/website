<script lang="ts">
  import SeoHead from "$lib/components/SeoHead.svelte";
  import Slab from "$lib/components/Slab.svelte";
  import SubscriptionsList from "$lib/components/SubscriptionsList.svelte";

  let { data } = $props();
</script>

<SeoHead
  title="Subscriptions"
  description="Publications I read on Standard.site."
  ogSubtitle="Publications and feeds I follow."
  ogType="SUBSCRIPTIONS"
  siteInfo={data.siteInfo}
/>

<main class="wrap">
  <Slab word="Reading" long />
  <p class="lede">A curated index of publications and feeds actively tracked on Standard.site.</p>

  <SubscriptionsList subscriptions={data.subscriptions} recommendations={data.recommendations} />
</main>
