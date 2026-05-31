<script lang="ts">
  import { SITE } from '$lib/config';
  import Now from '$lib/components/Now.svelte';

  import { normalizeSlug } from '$lib/utils/slugify';

  let { data } = $props();

  function getBlogUrl(post: any) {
    const date = new Date(post.createdAt);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const slug = normalizeSlug(post.title);
    return `/blog/${y}/${m}/${d}/${slug}`;
  }
</script>

<main style="padding-top: var(--space-lg);">
    <header style="margin-bottom: var(--space-xl);">
        <h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">{SITE.title}</h1>
        <p style="margin: 0; opacity: 0.7;">{SITE.description}</p>
    </header>

    <Now kibunStatus={data.kibunStatus} />

    <section style="margin-top: var(--space-xl);">
        <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-md);">Blog</h2>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-sm);">
            {#each data.posts as post}
                <li>
                    <a href={getBlogUrl(post)} style="text-decoration: none; color: inherit; display: block; padding: var(--space-md) var(--space-3); border: 1px solid var(--surface-color); border-radius: 4px;">
                        <h3 style="margin: 0 0 var(--space-2xs); font-size: var(--text-md);">{post.title}</h3>
                        <time style="font-size: var(--text-sm); opacity: 0.6;">{new Date(post.createdAt).toLocaleDateString()}</time>
                    </a>
                </li>
            {/each}
        </ul>
    </section>
</main>
