<script lang="ts">
    let { data } = $props();
</script>

<main class="shell-narrow rkey-page">
    <header class="page-hd rkey-hd">
        <h1 class="page-title">{data.project.title}</h1>
        <time class="rkey-date">{new Date(data.project.publishedAt).toLocaleDateString()}</time>
    </header>
    <article class="prose rkey-prose">
        {@html data.project.content}
    </article>
</main>
