<script lang="ts">
    import Profile from '$lib/Profile.svelte';
    import '../app.css';
    import { page } from '$app/stores';
    import ThemeToggle from '$lib/components/ThemeToggle.svelte';

    let { data, children } = $props();
</script>

<div class="box-border mx-auto px-4 sm:px-8 max-w-[1000px] pb-8">
    <nav class="flex items-center box-border my-6">
        <div class="flex items-center gap-4">
          {#if $page.url.pathname !== '/'}
            <a href="/" class="font-medium text-[large] hover:text-[var(--link-hover-color)]" aria-label="Home">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-book-open">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </a>
          {/if}
          <a class="font-medium text-[large] hover:text-[var(--link-hover-color)]" href="https://ewancroft.uk" aria-label="Personal Website">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-globe">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </a>
        </div>
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