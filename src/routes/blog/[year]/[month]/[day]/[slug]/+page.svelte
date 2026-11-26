<script lang="ts">
  import { page } from "$app/state";
  import SeoHead from "$lib/components/SeoHead.svelte";
  import SigilBand from "$lib/components/SigilBand.svelte";
  import ShareButtons from "$lib/components/ShareButtons.svelte";
  import TableOfContents from "$lib/components/TableOfContents.svelte";
  import CommentSection from "$lib/components/CommentSection.svelte";
  import LeafletBlocks from "$lib/components/leaflet/LeafletBlocks.svelte";
  import AtMentions from "$lib/components/AtMentions.svelte";
  import ArrowUpRight from "$lib/components/icons/ArrowUpRight.svelte";
  import { extraBacklinkTargets } from "$lib/stores/backlinkTargets";

  let { data } = $props();
  const { post, blog } = $derived(data);
  const useBlocks = $derived(post.blocks && post.blocks.length > 0);
  const url = $derived(page.url.href);
  const dateLong = $derived(
    new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "long", day: "2-digit", timeZone: "Europe/London" }).format(new Date(post.createdAt)),
  );

  $effect(() => {
    extraBacklinkTargets.set([post.uri, post.url].filter((v): v is string => Boolean(v)));
    return () => extraBacklinkTargets.set([]);
  });

  // readerPosts is newest first.
  const neighbours = $derived.by(() => {
    const i = data.readerPosts.findIndex((p) => p.uri === post.uri);
    if (i < 0) return [];
    return [
      { label: "← Older", entry: data.readerPosts[i + 1], newer: false },
      { label: "Newer →", entry: data.readerPosts[i - 1], newer: true },
    ].filter((n) => n.entry);
  });
</script>

<SeoHead
  title={post.title}
  description={post.metaDescription}
  ogSubtitle={post.description}
  type="article"
  ogType="ARTICLE"
  publishedTime={post.createdAt}
  tags={post.tags}
  author="https://ewancroft.uk/about"
  documentRkey={post.rkey}
  siteInfo={data.siteInfo}
/>

<main class="wrap">
  <SigilBand seed={post.title} />
  <header class="post-hero">
    <p class="pix"><a href="/blog">← The archive</a></p>
    <h1 class="post-title">{post.title}</h1>
    {#if post.description}<p class="post-deck">{post.description}</p>{/if}
    <div class="post-byline">
      <span class="tape">{dateLong}</span>
      {#if (post.tags?.length ?? 0) > 0}
        <span class="chips">
          {#each post.tags as t (t)}<span class="chip">{t.replace(/_/g, " ")}</span>{/each}
        </span>
      {/if}
    </div>
    <div class="post-byline">
      <ShareButtons {url} title={post.title} />
      <AtMentions {url} aturi={post.uri} variant="default" />
    </div>
  </header>

  <div class="article">
    <aside class="rail"><TableOfContents container=".prose" /></aside>
    <div>
      <article class="prose">
        {#if useBlocks}
          <LeafletBlocks
            blocks={post.blocks}
            pages={post.pages}
            pageType={post.primaryPageType}
            sourceUrl={post.url ?? blog?.url}
            posts={data.readerPosts}
            publication={blog}
            references={data.readerReferences}
            recommendedPublications={data.recommendedPublications}
            header={{ title: post.title, description: post.description ?? undefined, publishedAt: post.createdAt, tags: post.tags ?? undefined }}
          />
        {:else}
          {@html post.renderedContent}
        {/if}
      </article>
      <p class="post-end" aria-hidden="true">◆ ◆ ◆</p>

      {#if neighbours.length > 0}
        <nav class="turn" aria-label="More entries">
          {#each neighbours as n (n.entry.uri)}
            <a href={n.entry.url} class:turn--newer={n.newer}>
              <span class="pix">{n.label}</span>
              <span class="turn-title">{n.entry.title}</span>
            </a>
          {/each}
        </nav>
      {/if}

      <div class="post-after">
        <CommentSection comments={data.comments} subjectUri={post.uri} />
        {#if blog}
          <footer class="publication">
            <h2>Published in</h2>
            <p>
              {#if blog.url}<a href={blog.url} rel="noopener noreferrer">{blog.title}</a>{:else}{blog.title}{/if}
              {#if blog.description}&mdash; <em>{blog.description}</em>{/if}
            </p>
            <ul class="chips publication-links">
              <li class="chip">Standard.site</li>
              <li class="chip">Leaflet</li>
              {#if blog.rss}
                <li>
                  <a class="chip publication-rss" href={blog.rss} rel="noopener noreferrer">
                    <span>RSS</span><ArrowUpRight />
                  </a>
                </li>
              {/if}
            </ul>
          </footer>
        {/if}
      </div>
    </div>
  </div>
</main>
