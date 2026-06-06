<script lang="ts">
    import SiteHead from '$lib/components/SiteHead.svelte';
    let { data } = $props();
</script>

<SiteHead title={data.project.title} ogType="PROJECT" />

<main class="shell-narrow rkey-page">
    <header class="page-hd rkey-hd">
        <h1 class="page-title">{data.project.title}</h1>
        <time class="rkey-date">{new Date(data.project.publishedAt).toLocaleDateString()}</time>
    </header>
    <article class="prose rkey-prose">
        {@html data.project.content}
    </article>
</main>
