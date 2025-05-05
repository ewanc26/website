<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import Profile from "$lib/components/profile/Profile.svelte";
  import { Navigation, Footer } from "$lib/components/layout";
  import { DynamicShapes } from "$lib/components/background";

  let { data, children } = $props();

  // Check if we're on the home page or blog page using $derived
  const showProfile = $derived(
    $page.route.id ? ["/", "/blog"].includes($page.route.id) : false
  );
  const isHomePage = $derived($page.route.id === "/");
  const isBlogIndex = $derived($page.route.id === "/blog");

  // Dynamic shape count based on viewport size
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  const shapeCount = writable(10);
  function calculateShapeCount() {
    if (typeof window !== "undefined") {
      const area = window.innerWidth * window.innerHeight;
      // 1 shape per 40,000px^2, clamped between 3 and 20
      const count = Math.max(3, Math.min(20, Math.round(area / 40000)));
      shapeCount.set(count);
    }
  }
  onMount(() => {
    calculateShapeCount();
    window.addEventListener("resize", calculateShapeCount);
    return () => window.removeEventListener("resize", calculateShapeCount);
  });
</script>

<!-- Add the dynamic background shapes component -->
<DynamicShapes opacity={0.3} timeEnabled={true} count={$shapeCount} />

<div class="box-border mx-auto px-4 sm:px-8 max-w-[1000px] pb-8">
  <Navigation {isHomePage} {isBlogIndex} />

  {#if showProfile}
    <Profile profile={data.profile} />
  {/if}

  {@render children()}

  <Footer profile={data.profile} posts={data.posts} />
</div>
