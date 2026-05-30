<script lang="ts">
    import ShareButtons from '$lib/components/ShareButtons.svelte';
    import { page } from '$app/state';

    let { data } = $props();
    const { post } = data;
</script>

<article>
    <header style="margin-bottom: var(--space-xl);">
        <h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">{post.title}</h1>
        <time style="font-size: var(--text-sm); opacity: 0.7;">{new Date(post.createdAt).toLocaleDateString()}</time>
    </header>
    <div style="font-size: var(--text-md); line-height: 1.6;">
        {@html post.renderedContent}
    </div>
    <ShareButtons url={page.url.href} title={post.title} />
</article>
