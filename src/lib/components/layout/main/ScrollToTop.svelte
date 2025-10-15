<script lang="ts">
  import { onMount } from "svelte";
  import { ChevronUp } from "@lucide/svelte";

  let isVisible = false;
  let scrollY = 0;

  $: isVisible = scrollY > 300;

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToTop();
    }
  }

  onMount(() => {
    const updateScrollY = () => scrollY = window.scrollY;
    window.addEventListener('scroll', updateScrollY, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', updateScrollY);
    };
  });
</script>

<svelte:window bind:scrollY />

{#if isVisible}
  <button
    class="scroll-to-top"
    on:click={scrollToTop}
    on:keydown={handleKeydown}
    aria-label="Scroll to top"
    title="Scroll to top"
  >
    <ChevronUp width="20" height="20" />
  </button>
{/if}

<style>
  .scroll-to-top {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    z-index: 50;
    width: 3rem;
    height: 3rem;
    border: none;
    border-radius: 9999px;
    background-color: rgb(var(--canvas-100));
    color: rgb(var(--ink-900));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border: 1px solid rgb(var(--sage-200));
  }

  :global(.dark) .scroll-to-top {
    background-color: rgb(var(--canvas-900));
    color: rgb(var(--ink-50));
    border-color: rgb(var(--sage-800));
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .scroll-to-top:hover {
    background-color: rgb(var(--sage-500));
    color: rgb(var(--ink-50));
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  :global(.dark) .scroll-to-top:hover {
    background-color: rgb(var(--sage-600));
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  .scroll-to-top:active {
    transform: translateY(0);
  }

  .scroll-to-top:focus {
    outline: 2px solid rgb(var(--sage-500));
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    .scroll-to-top {
      bottom: 1.5rem;
      left: 1.5rem;
      width: 2.75rem;
      height: 2.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .scroll-to-top {
      transition: none;
    }
    
    .scroll-to-top:hover {
      transform: none;
    }
  }
</style>