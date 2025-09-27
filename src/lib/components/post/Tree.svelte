<script lang="ts">
  import type { TOCNode } from "$lib/components/shared";
  import { writable } from "svelte/store";
  import Tree from "./Tree.svelte"; // Recursive import for nested nodes

  export let tocNodes: TOCNode[] = [];
  export let activeId: string | null = null;
  export let scrollToHeading: (id: string) => void;

  const expanded = writable<Record<string, boolean>>({});

  const toggle = (id: string) => {
    expanded.update((e) => ({ ...e, [id]: !e[id] }));
  };

  const levelIndent = (level: number) => {
    switch (level) {
      case 1:
        return "ml-0";
      case 2:
        return "ml-2";
      case 3:
        return "ml-4";
      case 4:
        return "ml-6";
      case 5:
        return "ml-8";
      case 6:
        return "ml-10";
      default:
        return "ml-0";
    }
  };

  const hasChildren = (node: TOCNode) => node.children.length > 0;
</script>

<ul class="list-none pl-0 m-0">
  {#each tocNodes as node}
    <li class={`my-0.5 ${levelIndent(node.level)}`}>
      <div class="flex items-start gap-1">
        {#if hasChildren(node)}
          <button
            type="button"
            class="shrink-0 text-text hover:text-primary"
            on:click={() => toggle(node.id)}
            aria-label="Toggle section"
          >
            {#if $expanded[node.id]}▾{:else}▸{/if}
          </button>
        {/if}

        <button
          type="button"
          class={`flex-1 text-left px-1 py-0.5 rounded cursor-pointer text-sm toc-link
                  hover:bg-button-hover
                  ${
                    node.id === activeId
                      ? "bg-primary text-[var(--background-color)] active-link"
                      : "text-text"
                  }`}
          on:click={() => scrollToHeading(node.id)}
          aria-controls={node.id}
          aria-current={node.id === activeId ? "true" : "false"}
          data-content={node.name}
        >
          {node.name}
        </button>
      </div>

      {#if hasChildren(node) && $expanded[node.id]}
        <Tree {scrollToHeading} {activeId} tocNodes={node.children} />
      {/if}
    </li>
  {/each}
</ul>

<style>
  .toc-link {
    position: relative;
  }

  /* Reserve space for bold font weight to prevent layout shift */
  .toc-link::after {
    display: block;
    content: attr(data-content);
    height: 0;
    overflow: hidden;
    visibility: hidden;
    font-weight: 600; /* semibold equivalent */
    pointer-events: none;
  }

  /* Apply bold font weight when active */
  .toc-link.active-link {
    font-weight: 600; /* semibold equivalent */
  }
</style>