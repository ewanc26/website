<script lang="ts">
  import { SITE } from '$lib/config';
  import Now from '$lib/components/Now.svelte';
  import SiteHead from '$lib/components/SiteHead.svelte';
  import { ArrowRight, ExternalLink } from '@lucide/svelte';

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

<SiteHead />

<div class="page-content" style="padding-top: var(--space-lg);">
    <header style="margin-bottom: var(--space-xl);">
        <h1 style="font-size: var(--text-xl); font-weight: 800; margin-bottom: var(--space-sm);">{SITE.title}</h1>
        <p style="margin: 0; opacity: 0.7;">{SITE.description}</p>
    </header>

    <Now kibunStatus={data.kibunStatus} />

    <section style="margin-top: var(--space-xl);">
        <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-md);">{data.blog?.title ?? 'Blog'}</h2>
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
        <a href="/blog" style="display: inline-flex; align-items: center; gap: var(--space-xs); margin-top: var(--space-md); font-size: var(--text-sm); color: var(--color-primary-500); text-decoration: none;">All posts <ArrowRight size={14} strokeWidth={2} /></a>
    </section>

    {#if data.publications.length > 0}
        <section style="margin-top: var(--space-xl);">
            <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-md);">Publications</h2>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-sm);">
                {#each data.publications as pub}
                    <li>
                        <a href={pub.url} target="_blank" rel="noopener" style="text-decoration: none; color: inherit; display: block; padding: var(--space-sm) var(--space-3); border: 1px solid var(--surface-color); border-radius: 4px;">
                            <span style="display: flex; align-items: center; gap: var(--space-xs);">
                                <strong>{pub.name}</strong>
                                <ExternalLink size={12} strokeWidth={2} style="opacity: 0.4; flex-shrink: 0;" />
                            </span>
                            {#if pub.description}
                                <p style="margin: var(--space-2xs) 0 0; font-size: var(--text-sm); opacity: 0.7;">{pub.description}</p>
                            {/if}
                        </a>
                    </li>
                {/each}
            </ul>
        </section>
    {/if}
</div>
