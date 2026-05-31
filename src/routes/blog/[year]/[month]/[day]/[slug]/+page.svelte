<script lang="ts">
    import ShareButtons from '$lib/components/ShareButtons.svelte';
    import { page } from '$app/state';

    let { data } = $props();
    const { post } = data;
</script>

<article style="padding-top: var(--space-lg);">
    <header style="margin-bottom: var(--space-xl);">
        <h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">{post.title}</h1>
        <time style="font-size: var(--text-sm); opacity: 0.6;">{new Date(post.createdAt).toLocaleDateString()}</time>
    </header>
    <div class="prose">
        {@html post.renderedContent}
    </div>
    <ShareButtons url={page.url.href} title={post.title} />
</article>
