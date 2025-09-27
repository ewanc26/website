<script lang="ts">
  import type { Post } from "$components/shared";
  import type { TOCNode } from "$lib/components/shared";
  import { onMount, afterUpdate } from "svelte";
  import PostTOC from "./ToCUI.svelte";

  export let post: Post;

  let tocNodes: TOCNode[] = [];
  let activeId: string | null = null;

  $: hasValidContent =
    post &&
    post.content &&
    typeof post.content === "string" &&
    post.content.trim().length > 0;

  const generateTOC = () => {
    if (!hasValidContent) return [];
    const container = document.createElement("div");
    container.innerHTML = post.content;
    const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
    return Array.from(headings).map((h) => ({
      id: h.id,
      name: h.textContent ?? "",
      level: parseInt(h.tagName[1]),
      children: [],
    }));
  };

  const resetTOC = () => {
    tocNodes = generateTOC();
    activeId = null; // reset highlighted heading
  };

  // Regenerate TOC whenever post changes
  $: if (post) resetTOC();

  const handleScroll = () => {
    for (const node of tocNodes) {
      const el = document.getElementById(node.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight / 3) {
          activeId = node.id;
          break;
        }
      }
    }
  };

  onMount(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  });
</script>

{#if hasValidContent}
  <hr class="my-6 border-[var(--button-bg)]" />

  <div class="w-full">
    {#if tocNodes.length > 0}
      <!-- Layout with TOC: Grid with content and sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
        <!-- Post Content -->
        <article class="prose dark:prose-invert w-full max-w-none">
          {@html post.content}
        </article>

        <!-- TOC (desktop + mobile handled in PostTOC) -->
        <PostTOC {tocNodes} {activeId} />
      </div>
    {:else}
      <!-- Layout without TOC: 10vw margins on desktop, centered on mobile -->
      <div class="lg:mx-[10vw] mx-auto max-w-4xl lg:max-w-none">
        <article class="prose dark:prose-invert w-full">
          {@html post.content}
        </article>
      </div>
    {/if}
  </div>

  <hr class="my-6 border-[var(--button-bg)]" />
{:else}
  <!-- Loading state -->
  <hr class="my-6 border-[var(--button-bg)]" />
  <div class="lg:mx-[10vw] mx-auto max-w-4xl lg:max-w-none">
    <article class="prose dark:prose-invert w-full text-center">
      <div class="flex justify-center items-center min-h-[200px]">
        <div class="text-center">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-card rounded w-3/4 mx-auto"></div>
            <div class="h-4 bg-card rounded w-1/2 mx-auto"></div>
            <div class="h-4 bg-card rounded w-5/6 mx-auto"></div>
            <div class="h-4 bg-card rounded w-2/3 mx-auto"></div>
          </div>
          <p class="mt-6 text-sm opacity-60">Loading post content...</p>
        </div>
      </div>
    </article>
  </div>
  <hr class="my-6 border-[var(--button-bg)]" />
{/if}

<style>
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .animate-pulse .h-4 {
    height: 1rem;
    background-color: var(--button-bg);
    opacity: 0.6;
  }
</style>