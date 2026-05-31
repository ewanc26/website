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
            { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
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

<style>
    .toc {
        margin-bottom: var(--space-lg);
    }

    .toc h2 {
        font-size: var(--text-sm);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-ink-700);
        margin: 0 0 var(--space-sm);
    }

    .toc ol {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-2xs);
        border-left: 1px solid var(--surface-color);
    }

    .toc-link {
        display: block;
        font-size: var(--text-sm);
        text-decoration: none;
        color: var(--color-ink-700);
        padding: var(--space-2xs) var(--space-sm);
        border-left: 2px solid transparent;
        margin-left: -1px;
        transition:
            color var(--duration-fast) var(--ease-out-quart),
            border-color var(--duration-fast) var(--ease-out-quart);
    }

    .toc-link.h3 {
        padding-left: var(--space-md);
    }

    .toc-link.h4 {
        padding-left: var(--space-lg);
    }

    .toc-link.active {
        color: var(--color-primary-500);
        border-left-color: var(--color-primary-500);
        font-weight: 600;
    }

    /* SSR placeholder skeleton */
    .toc-skeleton {
        display: block;
        height: 1em;
        width: 60%;
        background: var(--surface-color);
        border-radius: var(--radius-xs);
    }

    .toc-placeholder ol {
        gap: var(--space-xs);
    }

    .toc-placeholder li {
        padding: var(--space-2xs) var(--space-sm);
    }
</style>
