<script lang="ts">
    import { onMount } from 'svelte';

    let { container }: { container: string } = $props();

    interface TocEntry {
        id: string;
        text: string;
        level: number;
    }

    let entries: TocEntry[] = $state([]);
    let activeId: string = $state('');
    let mounted = $state(false);

    onMount(() => {
        mounted = true;
        const el = document.querySelector(container);
        if (!el) return;

        const headings = el.querySelectorAll('h2, h3, h4');
        entries = Array.from(headings).map((h) => ({
            id: h.id,
            text: h.textContent ?? '',
            level: parseInt(h.tagName[1]),
        }));

        if (entries.length === 0) return;

        const observer = new IntersectionObserver(
            (observed) => {
                for (const entry of observed) {
                    if (entry.isIntersecting) {
                        activeId = entry.target.id;
                    }
                }
            },
            { rootMargin: '-100px 0px -80% 0px', threshold: 0 },
        );

        for (const h of headings) {
            if (h.id) observer.observe(h);
        }

        return () => observer.disconnect();
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
                        class:active={activeId === entry.id}
                        class:h3={entry.level === 3}
                        class:h4={entry.level === 4}
                    >{entry.text}</a>
                </li>
            {/each}
        </ol>
    </nav>
{/if}
