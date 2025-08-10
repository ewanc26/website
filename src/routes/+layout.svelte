<script lang="ts">
  import "$css/app.css";
  import { getStores } from "$app/stores";
  const { page } = getStores();
  import Profile from "$components/profile/Profile.svelte";
  import { Footer, HeaderMain } from "$components/layout";
  import { NoScriptMessage } from "$components/shared";

  let { data, children } = $props();

  // Check if we're on the home page or blog page using $derived
  const showProfile = $derived(
    $page.route.id ? ["/", "/blog"].includes($page.route.id) : false
  );
  const isHomePage = $derived($page.route.id === "/");
  const isBlogIndex = $derived($page.route.id === "/blog");
</script>

<!-- NoScript fallback -->
<NoScriptMessage />

<!-- Main layout structure -->
<div class="box-border mx-auto px-4 sm:px-8 max-w-[1000px] pb-8">
  <HeaderMain {isHomePage} {isBlogIndex} />

  {#if showProfile}
    <Profile profile={data.profile} />
  {/if}

  {@render children()}

  <Footer profile={data.profile} posts={data.posts} />
</div>
