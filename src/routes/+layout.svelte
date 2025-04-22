<script lang="ts">
    import Profile from '$lib/Profile.svelte';
    import '../app.css';
    import { page } from '$app/stores';
    import ThemeToggle from '$lib/components/ThemeToggle.svelte';
    import Footer from '$lib/components/Footer.svelte';

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

<Footer profile={data.profile} />