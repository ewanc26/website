<script lang="ts">
    import Profile from '$lib/Profile.svelte';
    import '../app.css';
    import { page } from '$app/stores';
    import ThemeToggle from '$lib/components/ThemeToggle.svelte';

    let { data, children } = $props();
</script>

<div class="box-border mx-auto px-4 sm:px-8 max-w-[1000px] pb-8">
    <nav class="flex items-center box-border my-6">
        <div class="ml-auto"></div>
        <ThemeToggle />
    </nav>
    
    <Profile profile={data.profile}/>
    
    {@render children()}
</div>

<footer class="text-center py-4 text-primary/50 text-sm">
  <div class="text-center py-4 text-primary/50">
      <div class="space-y-1">
          <div>
              powered by <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://atproto.com/guides/glossary#at-protocol">atproto</a> • codebase on <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://github.com/ewanc26/blog">GitHub</a> and <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://tangled.sh/@ewancroft.uk/blog">Tangled</a>
          </div>
          <div>
              © <span id="copyright-year"></span> {data.profile?.displayName || '@' + data.profile?.handle} • <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://www.gnu.org/licenses/agpl-3.0.en.html">GNU AGPLv3 licensed code</a>
          </div>
          <script>
              document.getElementById('copyright-year').textContent = new Date().getFullYear();
          </script>
      </div>
  </div>
</footer>