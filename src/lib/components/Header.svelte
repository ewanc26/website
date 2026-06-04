<script lang="ts">
    import { SITE, NAV_LINKS } from '$lib/config';
    import { page } from '$app/state';
    import { X } from '@lucide/svelte';
    import Triskele from './icons/Triskele.svelte';
import { dev } from '$app/environment';

    let isMenuOpen = $state(false);
</script>

<nav class="nav">
    <a href="/" class="nav-brand">
        <Triskele size={14} />
{SITE.title}{#if dev}<span class="dev-chip">DEV</span>{/if}
    </a>
    
    <button class="menu-toggle" onclick={() => isMenuOpen = !isMenuOpen}>
        {#if isMenuOpen}
            <X />
        {:else}
            <span class="hamburger"></span>
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
