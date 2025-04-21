<script lang="ts">
    import Profile from '$lib/Profile.svelte';
    import '../app.css';
    import { page } from '$app/stores';
    import ThemeToggle from '$lib/components/ThemeToggle.svelte';

    let { data, children } = $props();
</script>

<div class="box-border mx-auto px-4 sm:px-8 max-w-[1000px] pb-8">
    <nav class="flex items-center box-border my-6">
        {#if $page.url.pathname !== '/'}
          <a href="/" class="font-medium text-[large] hover:text-[var(--link-hover-color)]" aria-label="Home">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </a>
        {/if}
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
                powered by <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://atproto.com/guides/glossary#at-protocol">atproto</a> • codebase on <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://github.com/ewanc26/website">GitHub</a> and <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://tangled.sh/@ewancroft.uk/website">Tangled</a>
            </div>
            <div>
                © 2023-<span id="copyright-year"></span> ewan croft • personal views only
            </div>
            <script>
                document.getElementById('copyright-year').textContent = new Date().getFullYear();
            </script>
            <div>
              <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://www.gnu.org/licenses/agpl-3.0.en.html">GNU AGPLv3 licensed code</a> • <a class="hover:underline hover:text-[var(--link-hover-color)]" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0 licensed text &amp; imagery</a>
            </div>
        </div>
    </div>
</footer>