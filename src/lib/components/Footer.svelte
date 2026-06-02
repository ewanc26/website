<script lang="ts">
  import Bluesky from "$lib/components/icons/Bluesky.svelte";
  import { PUBLIC_ATPROTO_DID } from "$env/static/public";
</script>

<footer class="site-footer">
  <div class="footer-left">
    <a
      href="https://bsky.app/profile/{PUBLIC_ATPROTO_DID}"
      aria-label="Bluesky"
      class="footer-icon-link"
    >
      <Bluesky size={14} />
    </a>
  </div>
  <div class="footer-copyright">
    <p>&copy; {new Date().getFullYear()} ewan croft</p>
  </div>
  <nav class="footer-nav">
    <a href="mailto:contact@ewancroft.uk" class="footer-link"
      >contact@ewancroft.uk</a
    >
    <a href="/site/brand" class="footer-link">brand</a>
    <a href="/site/meta" class="footer-link">site meta</a>
  </nav>
</footer>
