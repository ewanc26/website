<script lang="ts">
    import Bluesky from '$lib/components/icons/Bluesky.svelte';
    import Eurosky from '$lib/components/icons/Eurosky.svelte';
    import { PUBLIC_ATPROTO_DID } from '$env/static/public';
</script>

<footer class="site-footer">
    <div class="footer-symbols">
        <a href="https://bsky.app/profile/{PUBLIC_ATPROTO_DID}" aria-label="Bluesky" class="footer-icon-link">
            <Bluesky size={14} />
        </a>
        <span class="symbol-sep"></span>
        <a href="https://eurosky.tech" aria-label="Eurosky" class="footer-icon-link">
            <Eurosky size={14} />
        </a>
    </div>
    <p>&copy; {new Date().getFullYear()} ewan croft</p>
    <nav class="footer-nav">
        <a href="mailto:contact@ewancroft.uk" class="footer-link">contact@ewancroft.uk</a>
        <a href="/site/brand" class="footer-link">brand</a>
        <a href="/site/meta" class="footer-link">site meta</a>
    </nav>
</footer>
