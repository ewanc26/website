<script lang="ts">
    import { SITE, NAV_LINKS } from '$lib/config';
    import { page } from '$app/state';
    import { Menu, X } from 'lucide-svelte';

    let isMenuOpen = $state(false);
</script>

<nav class="nav">
    <a href="/" class="nav-brand">{SITE.title}</a>
    
    <button class="menu-toggle" onclick={() => isMenuOpen = !isMenuOpen}>
        {#if isMenuOpen}
            <X />
        {:else}
            <Menu />
        {/if}
    </button>

    <div class="nav-links" class:open={isMenuOpen}>
        {#each NAV_LINKS as link}
            <a
                href={link.url}
                class="nav-link"
                class:active={page.url.pathname === link.url || (link.url !== '/' && page.url.pathname.startsWith(link.url))}
                onclick={() => isMenuOpen = false}
            >{link.label}</a>
        {/each}
    </div>
</nav>

<style>
    .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        padding: var(--space-md) var(--space-lg);
        border-bottom: 1px solid var(--surface-color);
        background: var(--color-canvas-50);
        position: sticky;
        top: 0;
        z-index: 10;
        font-size: var(--text-sm);
    }

    .nav-brand {
        font-weight: 700;
        text-decoration: none;
        color: var(--color-ink-950);
        font-size: var(--text-md);
    }

    .menu-toggle {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-ink-950);
    }

    .nav-links {
        display: flex;
        gap: var(--space-md);
    }

    .nav-link {
        text-decoration: none;
        color: var(--color-ink-600);
        transition: color var(--duration-fast) var(--ease-out-quart);
    }

    .nav-link:hover, .nav-link.active {
        color: var(--color-primary-700);
    }

    @media (max-width: 560px) {
        .menu-toggle {
            display: block;
        }

        .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            flex-direction: column;
            background: var(--color-canvas-50);
            padding: var(--space-md);
            border-bottom: 1px solid var(--surface-color);
            gap: var(--space-sm);
        }

        .nav-links.open {
            display: flex;
        }
    }
</style>
