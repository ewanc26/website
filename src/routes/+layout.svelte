<script lang="ts">
    import '../app.css';
    import { page } from '$app/stores';
    import Profile from '$lib/components/profile/Profile.svelte';
    import { Navigation, Footer } from '$lib/components/layout';
    import Blob from '$lib/components/shared/Blob.svelte';
    
    let { data, children } = $props();
    
    // Check if we're on the home page or blog page using $derived
    const showProfile = $derived($page.route.id ? ['/', '/blog'].includes($page.route.id) : false);
    const isHomePage = $derived($page.route.id === '/');
    const isBlogIndex = $derived($page.route.id === '/blog');
  </script>
  
  <div class="box-border mx-auto px-4 sm:px-8 max-w-[1000px] pb-8">
    <Blob count={15} />
    <Navigation {isHomePage} {isBlogIndex}/>
    
    {#if showProfile}
      <Profile profile={data.profile}/>
    {/if}
    
    {@render children()}
    
    <Footer profile={data.profile} posts={data.posts} />
  </div>