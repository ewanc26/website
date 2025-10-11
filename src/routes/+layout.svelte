<script lang="ts">
  import "$css/app.css";
  import { page } from "$app/stores";
  import Profile from "$components/profile/Profile.svelte";
  import { Footer, HeaderMain } from "$components/layout";
  import { ScrollToTop } from "$components/layout/main";
  import { NoScriptMessage } from "$components/shared";

  let { data, children } = $props();

  // Check if we're on the home page or blog page
  const showProfile = $derived(
    $page.route.id ? ["/", "/blog"].includes($page.route.id) : false
  );
  const isHomePage = $derived($page.route.id === "/");
  const isBlogIndex = $derived($page.route.id === "/blog");
</script>

<NoScriptMessage />

<div class="box-border mx-auto px-4 sm:px-8 max-w-[1000px] pb-8">
  <HeaderMain {isHomePage} {isBlogIndex} />

  {#if showProfile}
    <Profile profile={data.profile} />
  {/if}

  {@render children()}

  <Footer profile={data.profile} siteInfo={data.siteInfo} />
</div>

<ScrollToTop />
