<script lang="ts">
    import { formatDate } from '$lib/components/dateFormatter';
    import { onMount } from 'svelte';
    import Profile from '$lib/components/ATProfile.svelte';
    
    const { data } = $props();
    
    // Get posts from data and sort them by createdAt in descending order (newest first)
    const posts = $derived(
        Array.from(data.posts.values())
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
    
    // State to track if locale has been properly loaded
    let localeLoaded = $state(false);
    
    onMount(() => {
        // Set a brief timeout to ensure the browser has time to determine locale
        setTimeout(() => {
            localeLoaded = true;
        }, 10);
    });
</script>

<svelte:head>
    <title>Blog | Ewan's Web Corner</title>
    <meta name="description" content="Ewan's Self-Hosted WhiteWind Blog" />
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="/blog" />
    <meta property="og:title" content="Blog | Ewan's Web Corner" />
    <meta property="og:description" content="Ewan's Self-Hosted WhiteWind Blog" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="/blog" />
    <meta property="twitter:title" content="Blog | Ewan's Web Corner" />
    <meta property="twitter:description" content="Ewan's Self-Hosted WhiteWind Blog" />
</svelte:head>

<div class="container">
    <Profile profile={data}/>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-4 gap-y-6 mx-2 my-6">
        {#each posts as post}
            <div class="post-card">
                <a href="/blog/{post.rkey}">
                    <div class="flex flex-col h-[110px] justify-between">
                        <p class="text-[#8bd5a0] leading-[1.5] pb-2 title-truncate font-medium" title={post.title}>{post.title}</p>
                        <div>
                            <p class="text-[#a9c8b3] text-sm">Last Updated:</p>
                            <p class="object-bottom text-[#c9e8d3]">
                                {#if localeLoaded}
                                    {formatDate(post.createdAt)}
                                {:else}
                                    <span class="opacity-50">Loading...</span>
                                {/if}
                            </p>
                        </div>
                    </div>
                </a>
            </div>
        {/each}
    </div>
</div>

<style>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }
</style>