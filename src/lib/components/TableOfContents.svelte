<script lang="ts">
    /**
     * TableOfContents — generates a linked outline from headings.
     *
     * Queries the given `container` for headings matching `selector`,
     * slug-ifies each heading id (disambiguating duplicates), and
     * renders a navigable list. SSR-safe: shows a skeleton before mount.
     */
    import { onMount } from 'svelte';

    let { container, selector = 'h2, h3, h4' }: { container: string; selector?: string } = $props();

    interface TocEntry {
        id: string;
        text: string;
        level: number;
    }

    let entries: TocEntry[] = $state([]);
    let mounted = $state(false);

    /** Slug-ify heading text, disambiguating duplicates. Matches LeafletBlocks headingId(). */
    function makeSlug(text: string, seen: Map<string, number>): string {
        const base = text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        return count === 0 ? base : `${base}-${count}`;
    }

    onMount(() => {
        mounted = true;
        const el = document.querySelector(container);
        if (!el) return;

        const headings = el.querySelectorAll(selector);
        const seen = new Map<string, number>();

        entries = Array.from(headings).map((h) => {
            if (!h.id) {
                h.id = makeSlug(h.textContent ?? '', seen);
            } else {
                const base = h.id.replace(/-\d+$/, '');
                seen.set(base, (seen.get(base) ?? 0) + 1);
            }
            return {
                id: h.id,
                text: h.textContent ?? '',
                level: parseInt(h.tagName[1]),
            };
        });
    });
</script>

{#if !mounted}
    <!-- SSR placeholder: reserves space to prevent layout shift -->
    <nav aria-label="Table of contents" class="toc toc-placeholder">
        <h2>Contents</h2>
        <ol>
            <li><span class="toc-skeleton"></span></li>
            <li><span class="toc-skeleton"></span></li>
            <li><span class="toc-skeleton"></span></li>
            <li><span class="toc-skeleton"></span></li>
            <li><span class="toc-skeleton"></span></li>
            <li><span class="toc-skeleton"></span></li>
        </ol>
    </nav>
{:else if entries.length > 1}
    <nav aria-label="Table of contents" class="toc">
        <h2>Contents</h2>
        <ol>
            {#each entries as entry}
                <li>
                    <a
                        href="#{entry.id}"
                        class="toc-link"
                        class:h3={entry.level === 3}
                        class:h4={entry.level === 4}
                    >{entry.text}</a>
                </li>
            {/each}
        </ol>
    </nav>
{:else}
    <div class="toc-sentinel"></div>
{/if}
