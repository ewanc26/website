<script lang="ts">
    import Pentacle from '$lib/components/icons/Pentacle.svelte';
    import Triskele from '$lib/components/icons/Triskele.svelte';
    import Bluesky from '$lib/components/icons/Bluesky.svelte';
</script>

<footer class="site-footer">
    <div class="footer-symbols">
        <Pentacle size={14} />
        <span class="symbol-sep"></span>
        <Triskele size={14} />
        <span class="symbol-sep"></span>
        <a href="https://bsky.app/profile/did:plc:ofrbh253gwicbkc5nktqepol" aria-label="Bluesky" class="footer-icon-link">
            <Bluesky size={14} />
        </a>
    </div>
    <p>&copy; {new Date().getFullYear()} ewan croft</p>
    <nav class="footer-nav">
        <a href="mailto:contact@ewancroft.uk" class="footer-link">contact@ewancroft.uk</a>
        <a href="/site/brand" class="footer-link">brand</a>
        <a href="/site/meta" class="footer-link">site meta</a>
    </nav>
</footer>
