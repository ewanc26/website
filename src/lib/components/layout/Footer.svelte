<script lang="ts">
  export let profile: any;
  export const posts: any = undefined;
</script>

<footer class="text-center py-4 text-primary opacity-50 text-sm">
  <div class="space-y-1">
    <div>
      © <span id="copyright-year"></span>
      {profile?.displayName || "@" + profile?.handle}
    </div>
    <div>
      powered by <a
        class="hover:underline hover:text-[var(--link-hover-color)]"
        href="https://atproto.com/guides/glossary#at-protocol">atproto</a
      >
      • codebase on
      <a
        class="hover:underline hover:text-[var(--link-hover-color)]"
        href="https://github.com/ewanc26/website">GitHub</a
      >
      and
      <a
        class="hover:underline hover:text-[var(--link-hover-color)]"
        href="https://tangled.sh/@ewancroft.uk/website">Tangled</a
      >
    </div>
    <div>
      <a
        class="hover:underline hover:text-[var(--link-hover-color)]"
        href="https://www.gnu.org/licenses/agpl-3.0.en.html"
        >GNU AGPLv3 licensed code</a
      >
      •
      <a
        class="hover:underline hover:text-[var(--link-hover-color)]"
        href="https://creativecommons.org/licenses/by/4.0/"
        >CC BY 4.0 licensed text &amp; imagery</a
      >
    </div>
    <script>
      document.getElementById("copyright-year").textContent = new Date()
        .getFullYear()
        .toString();
    </script>
  </div>
</footer>
