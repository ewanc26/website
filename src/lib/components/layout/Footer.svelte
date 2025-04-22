<script lang="ts">
  export let profile: any;
</script>

<footer class="text-center py-4 text-primary/50 text-sm">
  <div class="text-center py-4 text-primary/50">
    <div class="space-y-1">
      <div>
        powered by <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://atproto.com/guides/glossary#at-protocol">atproto</a> • codebase on <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://github.com/ewanc26/blog">GitHub</a> and <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://tangled.sh/@ewancroft.uk/blog">Tangled</a>
      </div>
      <div>
        © <span id="copyright-year"></span> {profile?.displayName || '@' + profile?.handle} • <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://www.gnu.org/licenses/agpl-3.0.en.html">GNU AGPLv3 licensed code</a>
      </div>
      <script>
        document.getElementById('copyright-year').textContent = new Date().getFullYear().toString();
      </script>
    </div>
  </div>
</footer>