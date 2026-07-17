<script lang="ts">
    /**
     * Header — site navigation bar.
     * Includes the brand logo (Triskele icon + name), nav links,
     * a mobile hamburger menu, and the Mōnandæg moon-day indicator.
     * DEV environment gets a visible development chip.
     */
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

<nav class="nav" aria-label="Primary navigation">
    <div class="nav-inner">
        <div class="nav-brand">
            <a href="/" class="nav-brand-home" aria-label="{SITE.title}, home">
                <img class="nav-logo" src="/favicon.svg" alt="" />
                <span class="nav-brand-name">
                    {SITE.title}
                    {#if isMoonDay}
                        <span class="moon-day-label">on mōnandæg</span>
                    {/if}
                    {#if dev}<span class="dev-chip"><br />DEV</span>{/if}
                </span>
            </a>
            <span class="nav-brand-icon">
                <TriskeleEgg size={12} />
            </span>
        </div>

        <button
            class="menu-toggle"
            onclick={() => isMenuOpen = !isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
        >
            {#if isMenuOpen}
                <X aria-hidden="true" />
            {:else}
                <Menu aria-hidden="true" />
            {/if}
        </button>

        <div class="nav-links" class:open={isMenuOpen} id="primary-navigation">
            {#each NAV_LINKS as link}
                {@const isActive = page.url.pathname === link.url || (link.url !== '/' && link.url.startsWith('/') && page.url.pathname.startsWith(link.url))}
                <a
                    href={link.url}
                    class="nav-link"
                    class:active={isActive}
                    aria-current={isActive ? 'page' : undefined}
                    onclick={() => isMenuOpen = false}
                >{link.label}</a>
            {/each}
        </div>
    </div>
</nav>
