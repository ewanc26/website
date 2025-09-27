<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  let isVisible = false;
  let scrollY = 0;

  // Show button after scrolling down 300px
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
    transition:fly={{ y: 10, duration: 300, opacity: 0 }}
  >
    <!-- Chevron Up SVG icon -->
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
      <path d="m18 15-6-6-6 6"/>
    </svg>
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
    border-radius: 50%;
    background-color: var(--card-bg);
    color: var(--text-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(8px);
    border: 1px solid var(--button-bg);
  }

  .scroll-to-top:hover {
    background-color: var(--button-hover-bg);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  .scroll-to-top:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .scroll-to-top:focus {
    outline: 2px solid var(--link-color);
    outline-offset: 2px;
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .scroll-to-top {
      bottom: 1.5rem;
      left: 1.5rem;
      width: 2.75rem;
      height: 2.75rem;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .scroll-to-top {
      transition: none;
    }
    
    .scroll-to-top:hover {
      transform: none;
    }
  }
</style>