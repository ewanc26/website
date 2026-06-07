<script lang="ts">
    import { SITE, NAV_LINKS } from '$lib/config';
    import { page } from '$app/state';
    import { X, Menu } from '@lucide/svelte';
    import TriskeleEgg from '$lib/components/ostara-eggs/TriskeleEgg.svelte';
    import { dev } from '$app/environment';
    import { onMount } from 'svelte';

    let isMenuOpen = $state(false);
    let isMoonDay = $state(false);

    onMount(() => {
        isMoonDay = new Date().getDay() === 1;
    });
</script>

<nav class="nav">
    <div class="nav-brand">
        <span class="nav-brand-icon">
            <TriskeleEgg size={14} />
        </span>
        <span class="nav-brand-name">
            {SITE.title}
            {#if isMoonDay}
                <span class="moon-day-label">on mōnandæg</span>
            {/if}
            {#if dev}<span class="dev-chip"><br />DEV</span>{/if}
        </span>
    </div>
    
    <button class="menu-toggle" onclick={() => isMenuOpen = !isMenuOpen} aria-label="Toggle menu">
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
