<script lang="ts">
  import Link from "$lib/components/icons/Link.svelte";
  import FeedTypeIcon from "$lib/components/icons/FeedTypeIcon.svelte";
  import ArrowUpRight from "$lib/components/icons/ArrowUpRight.svelte";
  import HalftoneMoon from "$lib/components/HalftoneMoon.svelte";
  import SigilRule from "$lib/components/SigilRule.svelte";
  import Pentacle from "$lib/components/icons/Pentacle.svelte";
  import Triskele from "$lib/components/icons/Triskele.svelte";
  import SeoHead from "$lib/components/SeoHead.svelte";
  import KibunStatus from "$lib/components/KibunStatus.svelte";
  import GithubActivity from "$lib/components/GithubActivity.svelte";
  import NowPlayingChip from "$lib/components/NowPlayingChip.svelte";
  import { normalizeSlug } from "$lib/utils/slugify";
  import { blogDateParts } from "$lib/utils/date";
  import { PUBLIC_LEAFLET_BLOG_PUBLICATION, PUBLIC_ATPROTO_DID } from "$env/static/public";

  let { data } = $props();
  const { profile, kibunStatus, musicStatus, posts, githubProjects, githubUsername, githubContributions, githubLanguages, githubCommits, publications, links, apps, watching, feed, latestPlay } = $derived(data);

  const almanac = $derived(data.almanac);
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const name = $derived((profile.displayName ?? profile.handle).trim());
  const bio = $derived(
    esc(profile.description ?? "").replace(
      /(werewol(?:f|ves)|furr(?:y|ies)|pagan|poet|programmer|Gàidhlig(?: na h-Alba)?)/gi,
      "<mark>$1</mark>",
    ),
  );

  const writing = $derived(posts.filter((p: any) => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION).slice(0, 6));
  const otherPublications = $derived(publications.filter((p: any) => p.rkey !== PUBLIC_LEAFLET_BLOG_PUBLICATION));
  const blogUrl = (post: { title: string; createdAt: string }) => {
    const { year, month, day } = blogDateParts(post.createdAt);
    return `/blog/${year}/${month}/${day}/${normalizeSlug(post.title)}`;
  };
  const when = (iso: string) => {
    const parts = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", timeZone: "Europe/London" }).formatToParts(new Date(iso));
    return {
      day: parts.find((p) => p.type === "day")?.value ?? "",
      mon: (parts.find((p) => p.type === "month")?.value ?? "").toLowerCase(),
    };
  };
  const pad = (n: number) => String(n).padStart(2, "0");
  const tilts = [-1.1, 0.8, -0.5, 1.2, -0.9, 0.6];

  const feedTitle = (post: (typeof feed)[number]) => {
    if (post.text) return post.text;
    switch (post.kind) {
      case "images":
        return (post.imageCount ?? 1) > 1 ? `Shared ${post.imageCount} photos` : "Shared a photo";
      case "external":
        return post.linkTitle ? `Shared a link: ${post.linkTitle}` : "Shared a link";
      case "video":
        return "Shared a video";
      case "quote":
      case "quote-media":
        return post.quoted?.author ? `Quoted ${post.quoted.author}` : "Quoted a post";
      default:
        return "";
    }
  };
  const feedTag: Partial<Record<(typeof feed)[number]["kind"], string>> = {
    images: "Photo",
    external: "Link",
    video: "Video",
    quote: "Quote",
    "quote-media": "Quote with media",
  };
</script>

<SeoHead title="" ogType="HOME" siteInfo={data.siteInfo} />

<main class="wrap">
  <section class="poster" class:poster--chips={kibunStatus || latestPlay}>
    <div class="poster-moon"><HalftoneMoon phase={almanac.moon.phase} id="pm" /></div>
    <div class="poster-sigils" aria-hidden="true">
      <Pentacle size={96} class="ps-a" style="--x:2%;--y:14%;--w:20%;--r:-12deg" />
      <Triskele size={96} class="ps-b" style="--x:27%;--y:2%;--w:11%;--r:18deg" />
      <Triskele size={96} class="ps-b" style="--x:34%;--y:42%;--w:16%;--r:-25deg" />
      <Pentacle size={96} class="ps-a" style="--x:58%;--y:6%;--w:13%;--r:9deg" />
      <Triskele size={96} class="ps-b" style="--x:82%;--y:34%;--w:11%;--r:40deg" />
    </div>
    {#if kibunStatus || latestPlay}
      <div class="poster-chips">
        <KibunStatus status={kibunStatus} />
        <NowPlayingChip play={latestPlay} />
      </div>
    {/if}
    <h1 class="poster-name" data-t={name} style={`--n:${Math.max(3, name.length)}`}>
      {name}
    </h1>

    <div class="poster-row">
      <div class="thunk">
        <p class="bio">{@html bio}</p>
        {#if musicStatus}
          <div class="poster-statuses">
            <span class="now now--track">
              {#if musicStatus.artworkUrl}
                <img src={musicStatus.artworkUrl} alt={`Album art for ${musicStatus.trackName}`} width="36" height="36" loading="lazy" decoding="async" />
              {:else}
                <span aria-hidden="true">♪</span>
              {/if}
              <span>{musicStatus.trackName} — {musicStatus.artists.map((a: any) => a.artistName).join(", ")}</span>
            </span>
          </div>
        {/if}
      </div>

      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="nametag thunk" style="--i:2" tabindex="0">
        <div class="nametag-hd nt-swap">
          <span class="nt-gd" lang="gd">Halò<small>’S e</small></span>
          <span class="nt-en" lang="en">Hello<small>my name is</small></span>
        </div>
        <div class="nametag-name nt-swap">
          <span class="nt-gd" lang="gd">eòghann</span>
          <span class="nt-en" lang="en">ewan</span>
        </div>
        <div class="nametag-sub nt-swap">
          <span class="nt-gd" lang="gd">an t-ainm a th’ orm.</span>
          <span class="nt-en" lang="en">(that's Eòghann, in Gaelic)</span>
        </div>
      </div>
    </div>
  </section>

  <h2 class="word"><span class="word-text" style="--n:5">Words</span><small>the newest six</small></h2>
  {#if writing.length > 0}
    <div>
      <ol class="tracks">
        {#each writing as post, i (post.rkey ?? post.title)}
          {@const w = when(post.createdAt)}
          <li>
            <a href={blogUrl(post)} class="track" class:track--lead={i === 0}>
              <span class="track-when"><span class="track-day">{w.day}</span><span class="track-mon">{w.mon}</span></span>
              <span class="track-title">{post.title}</span>
            </a>
          </li>
        {/each}
      </ol>
      <div class="btns"><a href="/blog" class="btn btn--a">Everything I've written →</a></div>
    </div>
  {:else}
    <p class="empty">The publishing service isn't answering. Try again in a bit.</p>
  {/if}

  {#if feed.length > 0}
    <SigilRule /><h2 class="word"><span class="word-text" style="--n:4">Feed</span><small>lately, on Bluesky</small></h2>
    <div>
      <ol class="tracks">
        {#each feed as post (post.rkey)}
          {@const w = when(post.createdAt)}
          {@const tag = feedTag[post.kind]}
          <li>
            <a href={`https://bsky.app/profile/${PUBLIC_ATPROTO_DID}/post/${post.rkey}`} class="track" target="_blank" rel="noopener">
              <span class="track-when"><span class="track-day">{w.day}</span><span class="track-mon">{w.mon}</span></span>
              <span class="track-title">{feedTitle(post)}</span>
              {#if tag}
                <span class="track-meta shelf-meta shelf-chip" title={tag}>
                  <FeedTypeIcon kind={post.kind} />
                  <span class="sr-only">{tag}</span>
                </span>
              {/if}
              {#if post.quoted?.text}
                <span class="track-note"
                  >“{post.quoted.text.length > 140 ? post.quoted.text.slice(0, 139) + "…" : post.quoted.text}”</span
                >
              {/if}
            </a>
          </li>
        {/each}
      </ol>
      <div class="btns">
        <a href={`https://bsky.app/profile/${PUBLIC_ATPROTO_DID}`} target="_blank" rel="noopener" class="btn btn--small"
          >Follow on Bluesky<ArrowUpRight /></a
        >
      </div>
    </div>
  {/if}

  {#if apps.length > 0}
    <SigilRule /><h2 class="word"><span class="word-text" style="--n:4">Apps</span><small>things I've shipped</small></h2>
    <div>
      <ul class="carts">
        {#each apps.slice(0, 6) as app, i (app.externalUrl)}
          <li>
            <a class="cart" href={app.externalUrl} rel="noopener" style={`--tilt:${tilts[i % tilts.length]}deg`}>
              <span class="cart-band" style="background:var(--riso-a)"></span>
              <span class="cart-body">
                <span class="cart-no">app {pad(i + 1)}</span>
                <span class="cart-head">
                  {#if app.iconUrl}
                    <img class="cart-icon" src={app.iconUrl} alt="" width="28" height="28" loading="lazy" decoding="async" />
                  {/if}
                  <span class="cart-name">{app.name}</span>
                </span>
                {#if app.tagline}<span class="cart-desc">{app.tagline}</span>{/if}
                <span class="cart-foot"><span>{new URL(app.externalUrl).hostname}</span><span>open ▸</span></span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <SigilRule /><h2 class="word"><span class="word-text" style="--n:5">Works</span><small>open source, live from GitHub</small></h2>
  {#if githubProjects.length > 0}
    <div>
      <ul class="carts">
        {#each githubProjects.slice(0, 6) as project, i (project.url)}
          <li>
            <a class="cart" href={project.url} rel="noopener" style={`--tilt:${tilts[i % tilts.length]}deg;--lang:${project.languageColor ?? "var(--riso-a)"}`}>
              <span class="cart-band"></span>
              <span class="cart-body">
                <span class="cart-no">cart {pad(i + 1)}</span>
                <span class="cart-name">{project.name}</span>
                {#if project.description}<span class="cart-desc">{project.description}</span>{/if}
                <span class="cart-foot"><span>{project.language ?? ""}</span><span>play ▸</span></span>
              </span>
            </a>
          </li>
        {/each}
      </ul>
      <div class="btns">
        <a href={`https://github.com/${githubUsername}?tab=repositories`} rel="noopener" class="btn btn--small">All repositories<ArrowUpRight /></a>
        <a href="https://docs.ewancroft.uk" rel="noopener" class="btn btn--small">The docs<ArrowUpRight /></a>
      </div>
    </div>
  {:else}
    <p class="empty">Project data is unavailable right now.</p>
  {/if}

  <SigilRule /><h2 class="word"><span class="word-text" style="--n:7">Commits</span><small>a year of GitHub</small></h2>
  <GithubActivity username={githubUsername} contributions={githubContributions} languages={githubLanguages} commits={githubCommits} />

  {#if watching.length > 0}
    <SigilRule /><h2 class="word"><span class="word-text" style="--n:8">Watching</span><small>logged on Popfeed</small></h2>
    <ul class="carts">
      {#each watching.slice(0, 6) as w, i (w.title + (w.releaseDate ?? ""))}
        {@const href = w.imdbId ? `https://www.imdb.com/title/${w.imdbId}/` : undefined}
        {@const kind = w.creativeWorkType === "tv_show" ? "TV" : w.creativeWorkType === "movie" ? "Film" : w.creativeWorkType}
        {@const year = w.releaseDate ? new Date(w.releaseDate).getFullYear() : null}
        <li>
          {#if href}
            <a class="cart" {href} target="_blank" rel="noopener" style={`--tilt:${tilts[i % tilts.length]}deg`}>
              <span class="photo photo--poster">
                {#if w.posterUrl}<img src={w.posterUrl} alt={`Poster for ${w.title}`} loading="lazy" decoding="async" />{/if}
                {#if w.rating != null}<span class="cart-rating">{pad(w.rating)}/10</span>{/if}
              </span>
              <span class="cart-body">
                <span class="cart-no">watch {pad(i + 1)}</span>
                <span class="cart-name" style="font-size:1.3rem">{w.title}</span>
                <span class="cart-desc">{[kind, year, w.genres[0]].filter(Boolean).join(" · ")}</span>
              </span>
            </a>
          {:else}
            <div class="cart" style={`--tilt:${tilts[i % tilts.length]}deg`}>
              <span class="photo photo--poster">
                {#if w.posterUrl}<img src={w.posterUrl} alt={`Poster for ${w.title}`} loading="lazy" decoding="async" />{/if}
                {#if w.rating != null}<span class="cart-rating">{pad(w.rating)}/10</span>{/if}
              </span>
              <span class="cart-body">
                <span class="cart-no">watch {pad(i + 1)}</span>
                <span class="cart-name" style="font-size:1.3rem">{w.title}</span>
                <span class="cart-desc">{[kind, year, w.genres[0]].filter(Boolean).join(" · ")}</span>
              </span>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  {#if otherPublications.length > 0}
    <SigilRule /><h2 class="word"><span class="word-text" style="--n:5">Shelf</span><small>other things I publish</small></h2>
    <ul class="shelf">
      {#each otherPublications as pub (pub.rkey ?? pub.url)}
        <li>
          <a href={pub.url} rel="noopener">
            <span class="shelf-name">{pub.name}</span><span class="shelf-meta"><ArrowUpRight /></span>
            {#if pub.description}<p class="shelf-note">{pub.description}</p>{/if}
          </a>
        </li>
      {/each}
    </ul>
  {/if}

  {#if links.cards?.length > 0}
    <SigilRule /><h2 class="word"><span class="word-text" style="--n:9">Elsewhere</span></h2>
    <ul class="shelf">
      {#each links.cards.slice(0, 8) as link (link.url)}
        <li>
          <a href={link.url} rel="noopener">
            <span class="shelf-name">{#if link.emoji}<span aria-hidden="true">{link.emoji} </span>{/if}{link.text}</span>
            <span class="shelf-meta shelf-chip"
              ><Link /><span class="sr-only">{link.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span></span
            >
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</main>


<style>
  .poster-chips {
    position: absolute;
    z-index: 1;
    top: clamp(1rem, 6vw, 3rem);
    right: clamp(0.5rem, 6vw, 3rem);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.85rem;
    max-width: min(48vw, 17rem);
  }

  /* Reserve extra headroom above the name so the stamped chips on the
     moon never crowd/overlap the huge display letters below them. */
  .poster--chips {
    padding-top: max(var(--space-2xl), 13rem);
  }
  @media (max-width: 40rem) {
    .poster--chips {
      padding-top: 14rem;
    }
  }
</style>
