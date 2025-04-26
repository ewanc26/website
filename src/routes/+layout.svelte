<script lang="ts">
    import { injectAnalytics } from '@vercel/analytics/sveltekit';
    import '../app.css';
    import { page } from '$app/stores';
    import Profile from '$lib/components/profile/Profile.svelte';
    import Navigation from '$lib/components/layout/Navigation.svelte';
    import Footer from '$lib/components/layout/Footer.svelte';
    
    let { data, children } = $props();
    
    // Check if we're on the home page or blog page using $derived
    const showProfile = $derived($page.route.id ? ['/', '/blog'].includes($page.route.id) : false);
    const isHomePage = $derived($page.route.id === '/');

    injectAnalytics();
  </script>
  
  <div class="box-border mx-auto px-4 sm:px-8 max-w-[1000px] pb-8">
    <Navigation {isHomePage} />
    
    {#if showProfile}
      <Profile profile={data.profile}/>
    {/if}
    
    {@render children()}
    
    <Footer profile={data.profile} posts={data.posts} />
  </div>