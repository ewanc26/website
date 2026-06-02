<script lang="ts">
    import SiteHead from '$lib/components/SiteHead.svelte';
    
    let { data } = $props();
</script>

<SiteHead title={data.post.title} description={data.post.description} />

<main class="shell-narrow rkey-page">
    <header class="page-hd rkey-hd">
        <h1 class="page-title">{data.post.title}</h1>
        <time class="rkey-date">
            {new Date(data.post.createdAt).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
        </time>
    </header>
    <article class="prose rkey-prose">
        {@html data.post.content}
    </article>
</main>
