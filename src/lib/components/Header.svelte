<script lang="ts">
    import { SITE, NAV_LINKS } from '$lib/config';
    import { page } from '$app/state';
    import { Menu, X } from '@lucide/svelte';

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
