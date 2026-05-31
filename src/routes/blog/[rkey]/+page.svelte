<script lang="ts">
    let { data } = $props();
</script>

<main class="shell-narrow" style="padding-top: var(--space-lg);">
    <header class="page-hd">
        <h1 class="page-title">{data.post.title}</h1>
        <time style="font-size: var(--text-sm); color: var(--color-ink-600);">{new Date(data.post.createdAt).toLocaleDateString()}</time>
    </header>
    <article class="prose" style="padding: var(--space-lg) 0;">
        {@html data.post.content}
    </article>
</main>

<style>
    .page-hd {
        padding-bottom: var(--space-md);
        border-bottom: 1px solid var(--surface-color);
    }

    .page-title {
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.03em;
        margin: 0 0 var(--space-sm);
    }
</style>
