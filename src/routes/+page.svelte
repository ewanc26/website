<script lang="ts">
  import { getStores } from "$app/stores";
  const { page } = getStores();
  import DynamicLinks from "$lib/components/main/DynamicLinks.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>Ewan's Corner</title>
  <meta
    name="description"
    content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life."
  />
  <meta
    name="keywords"
    content="Ewan, personal website, coding, technology, programming, tech blog, Ewan's Corner"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.origin + $page.url.pathname} />
  <meta property="og:title" content="Ewan's Corner" />
  <meta
    property="og:description"
    content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life."
  />
  <meta property="og:site_name" content="Ewan's Corner" />
  <meta property="og:image" content={$page.url.origin + "/embed/main.png"} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={$page.url.origin + $page.url.pathname} />
  <meta name="twitter:title" content="Ewan's Corner" />
  <meta
    name="twitter:description"
    content="Welcome to Ewan's Corner - A personal space where I share my thoughts on coding, technology, and life."
  />
  <meta name="twitter:image" content={$page.url.origin + "/embed/main.png"} />
</svelte:head>

<!-- Add the DynamicLinks component -->
<DynamicLinks data={data.dynamicLinks} />
