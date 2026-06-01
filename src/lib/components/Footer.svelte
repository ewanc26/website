<script lang="ts">
    import Pentacle from '$lib/components/icons/Pentacle.svelte';
    import Triskele from '$lib/components/icons/Triskele.svelte';
</script>

<footer class="site-footer">
    <div class="footer-symbols">
        <Pentacle size={16} />
        <Triskele size={16} />
    </div>
    <p>&copy; {new Date().getFullYear()} ewan croft</p>
    <nav class="footer-nav">
        <a href="mailto:contact@ewancroft.uk" class="footer-link">contact@ewancroft.uk</a>
        <a href="/site/brand" class="footer-link">brand</a>
        <a href="/site/meta" class="footer-link">site meta</a>
    </nav>
</footer>
