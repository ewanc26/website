<script lang="ts">
  import BlogEmbedImage from '$lib/components/post/BlogEmbedImage.svelte';
  
  let { data } = $props();
  let post = $derived(data.post);
  let profile = $derived(data.profile);
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-4">Blog Post Embed Image</h1>
  <p class="mb-6">This is a preview of the embed image that will be used when sharing this blog post.</p>
  
  {#if post && profile}
    <BlogEmbedImage {post} {profile} />
  {:else}
    <div class="bg-[var(--header-footer-bg,#1e2c23)] text-[var(--text-color,#d8e8d8)] p-4 rounded border border-[var(--link-hover-color,#8fd0a0)] shadow-md">
      Post or profile information not found.
    </div>
  {/if}
</div>
