<script lang="ts">
  import "$css/app.css";
  import { getStores } from "$app/stores";
  import { onMount } from "svelte";
  const { page } = getStores();
  import Profile from "$components/profile/Profile.svelte";
  import { Footer, HeaderMain } from "$components/layout";
  import { ScrollToTop } from "$components/layout/main";
  import { NoScriptMessage } from "$components/shared";
  import { measurePerformance, logPerformanceMetrics } from "$utils/performance";

  let { data, children } = $props();

  // Check if we're on the home page or blog page using $derived
  const showProfile = $derived(
    $page.route.id ? ["/", "/blog"].includes($page.route.id) : false
  );
  const isHomePage = $derived($page.route.id === "/");
  const isBlogIndex = $derived($page.route.id === "/blog");

    // Performance monitoring
    onMount(() => {
      // Measure performance after page load
      setTimeout(async () => {
        try {
          const metrics = await measurePerformance();
          logPerformanceMetrics(metrics);
          
          // Send metrics to analytics if configured
          // sendPerformanceMetrics(metrics, '/api/analytics/performance');
        } catch (error) {
          console.warn('Performance measurement failed:', error);
        }
      }, 1000);
    });
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

  <Footer profile={data.profile} siteInfo={data.siteInfo} posts={data.posts} />
</div>

<!-- Scroll to top button -->
<ScrollToTop />