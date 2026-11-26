<script lang="ts">
  import { afterNavigate } from "$app/navigation";

  interface Props {
    container: string;
    selector?: string;
  }
  let { container, selector = "h2, h3, h4" }: Props = $props();

  let navEl: HTMLElement | undefined = $state();
  let hidden = $state(false);
  let built = $state(false);
  let entries: { id: string; text: string; level: number }[] = $state([]);

  /** Slug-ify heading text, disambiguating duplicates. Matches LeafletBlocks headingId(). */
  function makeSlug(text: string, seen: Map<string, number>): string {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  }

  function build() {
    const el = document.querySelector(container);
    const seen = new Map<string, number>();
    const found = Array.from(el?.querySelectorAll<HTMLElement>(selector) ?? []).map((h) => {
      if (!h.id) h.id = makeSlug(h.textContent ?? "", seen);
      else {
        const base = h.id.replace(/-\d+$/, "");
        seen.set(base, (seen.get(base) ?? 0) + 1);
      }
      return { id: h.id, text: h.textContent ?? "", level: parseInt(h.tagName[1]) };
    });

    built = true;
    if (found.length <= 1) {
      hidden = true;
      entries = [];
      return;
    }
    hidden = false;
    entries = found;
  }

  // Open beside the article; folded away where it would sit on top of it and
  // push the opening paragraph screens down. Matches the .article breakpoint.
  let open = $state(false);
  $effect(() => {
    const wide = window.matchMedia("(min-width: 72rem)");
    const sync = () => (open = wide.matches);
    sync();
    wide.addEventListener("change", sync);
    return () => wide.removeEventListener("change", sync);
  });

  // afterNavigate also fires once on initial mount, covering first load.
  afterNavigate(build);
</script>

{#if !hidden}
  <nav bind:this={navEl} aria-label="Table of contents" class="page-outline" class:outline-placeholder={!built}>
    <details bind:open>
    <summary><h2>Contents</h2></summary>
    <ol>
      {#if built}
        {#each entries as entry (entry.id)}
          <li>
            <a href={`#${entry.id}`} class="outline-link" class:h3={entry.level === 3} class:h4={entry.level === 4}>{entry.text}</a>
          </li>
        {/each}
      {:else}
        {#each Array.from({ length: 6 }) as _, i (i)}
          <li><span class="outline-skeleton"></span></li>
        {/each}
      {/if}
    </ol>
    </details>
  </nav>
{/if}
