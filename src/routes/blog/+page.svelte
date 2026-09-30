<script lang="ts">
  import ArrowUpRight from "$lib/components/icons/ArrowUpRight.svelte";
  import SeoHead from "$lib/components/SeoHead.svelte";
  import Slab from "$lib/components/Slab.svelte";

  let { data } = $props();
  const { blog, posts, topics } = $derived(data);

  const byYear = $derived.by(() => {
    const m = new Map<string, typeof posts>();
    for (const p of posts) m.set(p.year, [...(m.get(p.year) ?? []), p]);
    return m;
  });

  const when = (iso: string) => {
    const parts = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "Europe/London" }).formatToParts(new Date(iso));
    return { day: parts.find((p) => p.type === "day")?.value ?? "", mon: (parts.find((p) => p.type === "month")?.value ?? "").toLowerCase() };
  };

  // Live client-side filter, replacing the Astro version's manual DOM
  // hidden-toggling script with real reactive state.
  let query = $state("");
  const normalizedQuery = $derived(query.trim().toLowerCase());
  function matchesQuery(post: (typeof posts)[number]) {
    if (!normalizedQuery) return true;
    return `${post.title} ${post.tags.join(" ")}`.toLowerCase().includes(normalizedQuery);
  }
  const visibleByYear = $derived.by(() => {
    const entries: [string, typeof posts][] = [];
    for (const [year, list] of byYear) {
      const visible = list.filter(matchesQuery);
      if (visible.length > 0) entries.push([year, visible]);
    }
    return entries;
  });
  const noneMatch = $derived(normalizedQuery !== "" && visibleByYear.length === 0);
</script>

<SeoHead
  title="Blog"
  description={blog?.description ?? "Writing on technology, tradition, and the AT Protocol."}
  ogSubtitle="Writing on technology and tradition."
  ogType="BLOG"
  siteInfo={data.siteInfo}
/>

<main class="wrap">
  <Slab word="Blog" />
  <p class="lede">
    {posts.length} entries. {blog?.description}
    {#if blog?.url}
      <a href={`${blog.url.replace(/\/+$/, "")}/rss`} rel="noopener">RSS<ArrowUpRight /></a>
    {/if}
  </p>

  {#if topics.length > 0}
    <ul class="chips" aria-label="Topics" style="margin-bottom:var(--space-md)">
      {#each topics as [t, n] (t)}
        <li><button type="button" class="chip" onclick={() => (query = t)}>{t} ({n})</button></li>
      {/each}
    </ul>
  {/if}
  <div class="finder">
    <label class="sr-only" for="post-filter">Filter posts by title or topic</label>
    <input id="post-filter" type="search" placeholder="find a post…" autocomplete="off" bind:value={query} />
  </div>
  {#if noneMatch}<p class="empty">Nothing matches that.</p>{/if}

  {#if posts.length === 0}
    <p class="empty">The publishing service isn't answering just now.</p>
  {:else}
    {#each visibleByYear as [year, list] (year)}
      <section aria-labelledby={`y${year}`}>
        <span class="year" id={`y${year}`}>{year}</span>
        <ol class="tracks">
          {#each list as p (p.href)}
            {@const w = when(p.date)}
            <li>
              <a href={p.href} class="track">
                <span class="track-when"><span class="track-day">{w.day}</span><span class="track-mon">{w.mon}</span></span>
                <span class="track-title">{p.title}</span>
                {#if p.tags.length > 0}
                  <span class="track-meta tag-chip" title={p.tags.join(" · ")}>
                    <span aria-hidden="true">#</span>{p.tags.length}
                    <span class="tag-chip-list">tags: {p.tags.join(", ")}</span>
                  </span>
                {/if}
              </a>
            </li>
          {/each}
        </ol>
      </section>
    {/each}
  {/if}
</main>
