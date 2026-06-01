<script lang="ts">
    let { data } = $props();
</script>

<main class="shell-narrow rkey-page">
    <header class="page-hd rkey-hd">
        <h1 class="page-title">{data.post.title}</h1>
        <time class="rkey-date">{new Date(data.post.createdAt).toLocaleDateString()}</time>
    </header>
    <article class="prose rkey-prose">
        {@html data.post.content}
    </article>
</main>
