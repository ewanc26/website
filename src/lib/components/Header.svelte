<script lang="ts">
    import { SITE, NAV_LINKS } from '$lib/config';
    import { page } from '$app/state';
</script>

<nav class="nav">
    <a href="/" class="nav-brand">{SITE.title}</a>
    {#each NAV_LINKS as link}
        <a
            href={link.url}
            class="nav-link"
            class:active={page.url.pathname === link.url || (link.url !== '/' && page.url.pathname.startsWith(link.url))}
        >{link.label}</a>
    {/each}
</nav>

<style>
    .nav {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-md) var(--space-lg);
        border-bottom: 1px solid var(--surface-color);
        background: var(--color-canvas-50);
        position: sticky;
        top: 0;
        z-index: 10;
        font-size: var(--text-sm);
        white-space: nowrap;
        max-width: 100vw;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .nav::-webkit-scrollbar {
        display: none;
    }

    .nav-brand {
        font-weight: 700;
        text-decoration: none;
        color: var(--color-ink-950);
        font-size: var(--text-md);
        flex-shrink: 0;
    }

    .nav-link {
        text-decoration: none;
        color: var(--color-ink-600);
        transition: color var(--duration-fast) var(--ease-out-quart);
        flex-shrink: 0;
    }

    .nav-link:hover {
        color: var(--color-primary-500);
    }

    .nav-link.active {
        color: var(--color-primary-500);
    }

    @media (max-width: 560px) {
        .nav {
            padding: var(--space-sm) var(--space-md);
            gap: var(--space-sm);
        }
    }
</style>
