<script lang="ts">
    import { SITE, NAV_LINKS } from '$lib/config';
</script>

<header style="padding: var(--space-6) 0; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--surface-color); max-width: 70ch; margin-inline: auto; width: 100%;">
    <a href="/" style="font-weight: bold; text-decoration: none; color: inherit; font-size: var(--text-md);">{SITE.title}</a>
    <nav style="display: flex; gap: var(--space-md);">
        {#each NAV_LINKS as link}
            <a href={link.url} style="text-decoration: none; color: inherit; font-size: var(--text-sm);">{link.label}</a>
        {/each}
    </nav>
</header>
