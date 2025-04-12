<script lang="ts">
    import Profile from '$lib/Profile.svelte';
    import '../app.css';
    import { page } from '$app/stores';
    
    let { data, children } = $props();
    
    // Check if we're on the home page or a blog post page using $derived
    const isHomePage = $derived($page.route.id === '/');
</script>

<svelte:head>
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png">
    <link rel="manifest" href="/favicon/site.webmanifest">
</svelte:head>

<div class="box-border mx-auto px-4 sm:px-8 max-w-[1000px] pb-8">
    <nav class="flex items-center box-border my-6">
        {#if $page.url.pathname !== '/'}
          <a href="/" class="font-medium text-[large] hover:text-[#b7e6c4]" aria-label="Home">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </a>
        {/if}
        <a class="font-medium text-[large] hover:text-[#b7e6c4] ml-4" href="https://github.com/ewanc26" aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-github">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
          </svg>
        </a>
        <a class="font-medium text-[large] hover:text-[#b7e6c4] ml-4" href="https://blog.ewancroft.uk" aria-label="Blog">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-book-open">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </a>
    </nav>
    
    {#if isHomePage}
        <Profile profile={data.profile}/>
    {/if}
    
    {@render children()}
</div>
<footer class="text-center py-4 text-[#a9c8b3]/50 text-sm">
    <div class="text-center py-4 text-[#a9c8b3]/50">
        <div class="space-y-1">
            <div>
                powered by <a class="hover:underline hover:text-[#b7e6c4]" href="https://atproto.com/guides/glossary#at-protocol">atproto</a> • codebase on <a class="hover:underline hover:text-[#b7e6c4]" href="https://github.com/ewanc26/website">GitHub</a> and <a class="hover:underline hover:text-[#b7e6c4]" href="https://tangled.sh/@ewancroft.uk/website">Tangled</a>
            </div>
            <div>
                © 2023-<span id="copyright-year"></span> ewan croft • personal views only
            </div>
            <script>
                document.getElementById('copyright-year').textContent = new Date().getFullYear();
            </script>
            <div>
              <a class="hover:underline hover:text-[#b7e6c4]" href="https://www.gnu.org/licenses/agpl-3.0.en.html">GNU AGPLv3 licensed code</a> • <a class="hover:underline hover:text-[#b7e6c4]" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0 licensed text &amp; imagery</a>
            </div>
        </div>
    </div>
</footer>