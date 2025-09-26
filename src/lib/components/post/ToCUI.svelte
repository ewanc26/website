<script lang="ts">
  import TableOfContents from "./TableOfContents.svelte";
  import type { TOCNode } from "$lib/components/shared";
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";

  export let tocNodes: TOCNode[] = [];
  export let activeId: string | null = null;

  // Mobile drawer state
  let tocOpen = false;
  const closeDrawer = () => (tocOpen = false);

  // Scroll progress for desktop
  let scrollProgress = 0;
  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  };

  // Mobile TOC button visibility
  let showTOCButton = true;
  const BUFFER = 100; // pixels before first heading / after last heading

  const updateTOCButtonVisibility = () => {
    if (!tocNodes.length) return;

    const firstHeading = document.getElementById(tocNodes[0].id);
    const lastHeading = document.getElementById(
      tocNodes[tocNodes.length - 1].id,
    );

    if (!firstHeading || !lastHeading) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const lastHeadingBottom =
      lastHeading.getBoundingClientRect().bottom + window.scrollY;

    // Gradual fade with buffer
    showTOCButton =
      scrollTop + windowHeight / 2 >= firstHeading.offsetTop - BUFFER &&
      scrollTop + windowHeight / 2 <= lastHeadingBottom + BUFFER;
  };

  onMount(() => {
    const handleScroll = () => {
      updateScrollProgress();
      updateTOCButtonVisibility();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  });
</script>

<!-- Desktop Sticky Sidebar -->
{#if tocNodes.length > 0}
  <aside class="hidden lg:block">
    <div class="sticky top-8">
      <h2 class="text-sm font-semibold mb-2">Table of Contents</h2>

      <TableOfContents
        {tocNodes}
        {activeId}
        scrollToHeading={(id: string) => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <!-- Scroll Progress Bar -->
      <div class="w-full h-1 bg-button mt-2 rounded overflow-hidden">
        <div
          class="h-full bg-primary transition-all duration-100 ease-linear"
          style="width: {scrollProgress}%"
        ></div>
      </div>
    </div>
  </aside>
{/if}

<!-- Mobile TOC Drawer -->
{#if tocNodes.length > 0}
  <!-- Floating TOC Button -->
  {#if showTOCButton}
    <button
      type="button"
      class="toc-toggle fixed bottom-2.5 right-2.5 z-50 w-12 h-12 rounded-full bg-card text-text shadow-lg border border-button flex items-center justify-center hover:bg-button-hover hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 active:shadow-md lg:hidden"
      on:click={() => (tocOpen = true)}
      aria-label="Open Table of Contents"
      title="Open Table of Contents"
      transition:fly={{ y: 10, duration: 300, opacity: 0 }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  {/if}

  {#if tocOpen}
    <!-- Overlay -->
    <button
      type="button"
      class="fixed inset-0 bg-black/40 z-40 lg:hidden"
      on:click={closeDrawer}
      aria-label="Close Table of Contents"
    ></button>

    <!-- Drawer -->
    <div
      class="fixed top-0 right-0 bottom-0 w-72 bg-card shadow-lg z-50 lg:hidden flex flex-col"
      transition:fly={{ x: 300, duration: 250 }}
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-3 border-b border-button flex-shrink-0"
      >
        <h2 class="text-sm font-semibold">Table of Contents</h2>
        <button
          class="text-text hover:text-primary p-1"
          on:click={closeDrawer}
          aria-label="Close TOC"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Scrollable TOC with bottom fade -->
      <div class="relative flex-1 overflow-y-auto p-3">
        <TableOfContents
          {tocNodes}
          {activeId}
          scrollToHeading={(id: string) => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            closeDrawer();
          }}
        />

        <!-- Bottom fade overlay -->
        <div
          class="pointer-events-none absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-card to-transparent"
        ></div>
      </div>
    </div>
  {/if}
{/if}

<style>
  .toc-toggle {
    transition: all 0.3s ease;
    backdrop-filter: blur(8px);
  }

  .toc-toggle:focus {
    outline: 2px solid var(--link-color);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    .toc-toggle {
      bottom: 1.5rem;
      right: 1.5rem;
      width: 2.75rem;
      height: 2.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .toc-toggle {
      transition: none;
    }
    .toc-toggle:hover {
      transform: none;
    }
  }
</style>
