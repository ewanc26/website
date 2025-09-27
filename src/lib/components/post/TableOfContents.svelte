<script lang="ts">
  import type { TOCNode } from "$lib/components/shared";
  import Tree from "./Tree.svelte";

  export let tocNodes: TOCNode[] = [];
  export let activeId: string | null = null;

  // scrollToHeading prop
  export let scrollToHeading: (id: string) => void = (id: string) => {
    let el;
    
    // Special handling for footnotes - scroll to the section instead of hidden heading
    if (id === 'footnotes-section') {
      el = document.querySelector('section[data-footnotes]');
    } else {
      el = document.getElementById(id);
    }
    
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
</script>

<div class="toc-container">
  <Tree {tocNodes} {activeId} {scrollToHeading} />
</div>

<style>
  .toc-container {
    overflow-y: auto;
    max-height: calc(100vh - 6rem);
    padding-right: 0.5rem;
  }

  .toc-container::-webkit-scrollbar {
    width: 6px;
  }

  .toc-container::-webkit-scrollbar-track {
    background: var(--card-bg);
    border-radius: 3px;
  }

  .toc-container::-webkit-scrollbar-thumb {
    background: var(--button-bg);
    border-radius: 3px;
  }

  .toc-container::-webkit-scrollbar-thumb:hover {
    background: var(--button-hover-bg);
  }
</style>