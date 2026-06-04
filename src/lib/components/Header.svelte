<script lang="ts">
    import { SITE, NAV_LINKS } from '$lib/config';
    import { page } from '$app/state';
    import { X, Menu } from '@lucide/svelte';
    import Triskele from './icons/Triskele.svelte';
    import { WolfToggle } from '$lib/components/layout';
import { dev } from '$app/environment';

    let isMenuOpen = $state(false);
</script>

<nav class="nav">
    <a href="/" class="nav-brand">
        <Triskele size={14} />
{SITE.title}{#if dev}<span class="dev-chip">DEV</span>{/if}
    </a>
    
    <div class="nav-actions">
        <WolfToggle />
        <button class="menu-toggle" onclick={() => isMenuOpen = !isMenuOpen} aria-label="Toggle menu">
            {#if isMenuOpen}
                <X />
            {:else}
                <Menu />
            {/if}
        </button>
    </div>

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
