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

<main class="shell-wide">
  <section class="hero">
    <div>
      <h1 class="hero-title">{SITE.title}</h1>
      <p class="hero-desc">{SITE.description}</p>
    </div>
  </section>

  <Now kibunStatus={data.kibunStatus} />

  <section class="home-section">
    <h2 class="section-title">{data.blog?.title ?? 'Blog'}</h2>
    <ul class="post-list">
      {#each data.posts as post}
        <li>
          <a href={getBlogUrl(post)} class="post-row">
            <span class="post-title">{post.title}</span>
            <time class="post-date">{new Date(post.createdAt).toLocaleDateString()}</time>
          </a>
        </li>
      {/each}
    </ul>
    <a href="/blog" class="section-link">All posts <ArrowRight size={14} strokeWidth={2} /></a>
  </section>

  {#if data.publications.length > 0}
    <section class="home-section">
      <h2 class="section-title">Publications</h2>
      <ul class="post-list">
        {#each data.publications as pub}
          <li>
            <a href={pub.url} target="_blank" rel="noopener" class="post-row">
              <span class="post-title">{pub.name} <ExternalLink size={12} strokeWidth={2} style="opacity: 0.4; vertical-align: middle;" /></span>
              {#if pub.description}
                <span class="post-desc">{pub.description}</span>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</main>

<style>
  .hero {
    padding: var(--space-xl) 0 var(--space-lg);
  }

  .hero-title {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 0.95;
    margin: 0 0 var(--space-sm);
  }

  .hero-desc {
    margin: 0;
    color: var(--color-ink-700);
    font-size: var(--text-md);
  }

  .home-section {
    padding: var(--space-lg) 0;
  }

  .section-title {
    font-size: var(--text-sm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink-600);
    margin: 0 0 var(--space-md);
  }

  .post-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  .post-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-md);
    padding: var(--space-sm) 0;
    border-bottom: 1px dashed var(--surface-color);
    text-decoration: none;
    color: inherit;
    transition: background-color var(--duration-fast) var(--ease-out-quart);
  }

  .post-row:hover {
    background-color: var(--surface-raised);
    padding-left: var(--space-sm);
    padding-right: var(--space-sm);
    margin-left: calc(-1 * var(--space-sm));
    margin-right: calc(-1 * var(--space-sm));
  }

  .post-title {
    font-weight: 600;
  }

  .post-date {
    font-size: var(--text-xs);
    color: var(--color-ink-600);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .post-desc {
    font-size: var(--text-sm);
    color: var(--color-ink-600);
  }

  .section-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    margin-top: var(--space-md);
    font-size: var(--text-sm);
    color: var(--color-primary-500);
    text-decoration: none;
  }

  @media (max-width: 560px) {
    .post-row {
      flex-direction: column;
      gap: var(--space-2xs);
    }
  }
</style>
