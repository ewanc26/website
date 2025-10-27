<script lang="ts">
  import { onMount } from "svelte";
  import { ChevronUp } from "@lucide/svelte";

  let isVisible = false;
  let scrollY = 0;

  $: isVisible = scrollY > 300;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      scrollToTop();
    }
  }

  onMount(() => {
    const updateScrollY = () => (scrollY = window.scrollY);
    window.addEventListener("scroll", updateScrollY, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollY);
  });
</script>

<svelte:window bind:scrollY />

<!-- just Tailwind fade via opacity -->
<div
  class="fixed bottom-8 left-8 z-50 sm:bottom-6 sm:left-6 transition-opacity duration-300 motion-reduce:transition-none"
  class:opacity-100={isVisible}
  class:opacity-0={!isVisible}
>
  <button
    on:click={scrollToTop}
    on:keydown={handleKeydown}
    aria-label="Scroll to top"
    title="Scroll to top"
    type="button"
    class="flex h-12 w-12 items-center justify-center rounded-full border bg-canvas-100 text-ink-900 border-primary-200 shadow-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary-500 hover:text-ink-50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-canvas-900 dark:text-ink-50 dark:border-primary-800 dark:hover:bg-primary-600 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-11 sm:w-11"
  >
    <ChevronUp width="20" height="20" aria-hidden="true" />
  </button>
</div>