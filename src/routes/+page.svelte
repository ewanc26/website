<script lang="ts">
  import { onMount } from 'svelte';
  import SiteHead from '$lib/components/SiteHead.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';
  import VerificationBadge from '$lib/components/VerificationBadge.svelte';
  import Triskele from '$lib/components/icons/Triskele.svelte';
  import Pentacle from '$lib/components/icons/Pentacle.svelte';
  import { ArrowRight, ExternalLink, Music } from '@lucide/svelte';
  import { normalizeSlug } from '$lib/utils/slugify';
  import { blogDateParts } from '$lib/utils/date';
  import type { ProfileData } from '@ewanc26/atproto';
  import { PUBLIC_LEAFLET_BLOG_PUBLICATION } from '$env/static/public';
  import { pulseAmbiance } from '$lib/stores/ambiance';

  let { data } = $props();

  let profile = $derived(data.profile as ProfileData);

  let kibunStatus = $state<any>(null);
  let musicStatus = $state<any>(null);
  let posts = $state<any>(null);
  let githubProjects = $state<any>(null);
  let githubUsername = $state('ewanc26');
  let publications = $state<any>(null);
  let links = $state<any>(null);
  let homeLoading = $state(true);

  let pinnedProjects = $derived(githubProjects ? githubProjects.slice(0, 6) : []);

  onMount(async () => {
    try {
      const response = await fetch('/api/home');
      if (!response.ok) throw new Error(`Home API returned ${response.status}`);

      const d = await response.json();
      kibunStatus = d.kibunStatus;
      musicStatus = d.musicStatus;
      posts = d.posts;
      githubProjects = d.githubProjects;
      githubUsername = d.githubUsername ?? githubUsername;
      publications = d.publications;
      links = d.links;
    } catch (e) {
      console.error("Failed to load home data", e);
      posts = [];
      githubProjects = [];
      publications = [];
      links = { cards: [] };
    } finally {
      homeLoading = false;
    }
  });

  // The scrolling band pauses on hover/focus (see pages.css); pausing it
  // is a deliberate "let me read this" gesture, unlike the section-link
  // hover elsewhere on this page, which fires on every glance. Rare and
  // intentional enough to earn the same confirmation chime as copying a
  // link — throttled so resting the pointer there doesn't ring it twice.
  let lastBandPulse = 0;
  function pulseOnBandPause() {
    const now = Date.now();
    if (now - lastBandPulse < 4000) return;
    lastBandPulse = now;
    pulseAmbiance();
  }

  // Repeated several times over so one block alone is comfortably wider
  // than any real viewport (a single pass of six words is only ~1200px,
  // narrower than most monitors) — the two-block translateX(-50%) loop
  // in pages.css only reads as seamless if a block can never run out of
  // content before the viewport's trailing edge does.
  const bandWords = Array(4).fill([
    'Poet',
    'Programmer',
    'Pagan',
    'AT Protocol',
    'Gàidhlig na h-Alba',
    'Werewolf enthusiast'
  ]).flat();

  function getBlogUrl(post: any) {
    const { year: y, month: m, day: d } = blogDateParts(post.createdAt);
    const slug = normalizeSlug(post.title);
    return `/blog/${y}/${m}/${d}/${slug}`;
  }
</script>

<SiteHead ogType="HOME" />

<main class="shell-wide home-page">
  <!-- Hero -->
  <section class="page-hd hero-hd hero-reveal">
    <div class="hero-masthead">
      <h1 class="page-title hero-name">
        {profile.displayName ?? profile.handle}<span class="hero-badge"><VerificationBadge verified={true} verifiers={data.verifications} /></span>
      </h1>
      <p class="hero-gaelic text-outline" lang="gd">eòghann</p>
    </div>
    <div class="hero-text">
      {#if profile.avatar}
        <img src={profile.avatar} alt="" class="hero-avatar" width="128" height="128" decoding="async" />
      {/if}
      <div class="hero-copy">
        <p class="hero-bio">{profile.description}</p>
        <div class="hero-meta" aria-label="Profile metadata">
          <span>@{profile.handle}</span>
          <span>AT Protocol</span>
          <span>Personal web</span>
        </div>
        <!-- Status row -->
        {#if homeLoading}
          <div class="status-row animate-in stagger-1" aria-busy="true">
            <LoadingSkeleton label="Loading current status" />
          </div>
        {:else if kibunStatus !== null || musicStatus !== null}
          <div class="status-row content-reveal">
            {#if kibunStatus}
              <div class="status-chip">
                <span class="status-emoji">{kibunStatus.emoji}</span>
                <span class="status-text">{kibunStatus.text}</span>
              </div>
            {/if}
            {#if musicStatus}
              <div class="status-chip status-chip--music">
                {#if musicStatus.artworkUrl}
                  <img
                    src={musicStatus.artworkUrl}
                    alt=""
                    class="now-playing-art"
                    width="24"
                    height="24"
                    loading="lazy"
                    decoding="async"
                  />
                {:else}
                  <Music size={14} strokeWidth={2} class="muted-icon" />
                {/if}
                <span class="status-text">{musicStatus.trackName} — {musicStatus.artists.map((a: any) => a.artistName).join(', ')}</span>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </section>

  <div class="hero-band" aria-hidden="true" onmouseenter={pulseOnBandPause}>
    <div class="hero-band-track">
      {#each [0, 1] as _}
        <span class="hero-band-run">
          {#each bandWords as word}
            <span>{word}</span><Triskele size={16} />
          {/each}
        </span>
      {/each}
    </div>
  </div>

  <div class="home-ornament" aria-hidden="true">
    <Pentacle size={11} />
    <Triskele size={18} />
    <Pentacle size={11} />
  </div>

  <!-- Writing -->
  <section class="home-section animate-in stagger-2" aria-busy={posts === null}>
    <div class="home-section-hd">
      <span class="home-section-num" aria-hidden="true">01</span>
      <h2 class="home-section-title">Recent writing</h2>
    </div>
    {#if posts === null}
      <LoadingSkeleton count={3} label="Loading recent posts" />
    {:else if Array.isArray(posts) && posts.length > 0}
        <ul class="post-list home-post-list content-reveal-list">
          {#each posts.filter(p => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION).slice(0, 5) as post, i}
            <li>
              <a href={getBlogUrl(post)} class="post-row active-press" class:post-row--featured={i === 0}>
                <span class="row-stack post-copy">
                  {#if i === 0}<span class="home-row-label">Latest</span>{/if}
                  <span class="post-title">{post.title}</span>
                </span>
                <time class="post-date">{new Date(post.createdAt).toLocaleDateString('en-gb', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
              </a>
            </li>
          {/each}
        </ul>
        <a href="/blog" class="section-link">All posts <ArrowRight size={14} strokeWidth={2} /></a>
    {:else}
        <EmptyState
          title="Blog unavailable"
          description="Unable to load blog posts at the moment. The publishing service may be temporarily unavailable. Please try again later."
        />
    {/if}
  </section>

  <!-- Projects -->
  <section class="home-section animate-in stagger-3" aria-busy={githubProjects === null}>
    <div class="home-section-hd">
      <span class="home-section-num" aria-hidden="true">02</span>
      <h2 class="home-section-title">Selected projects</h2>
    </div>
    {#if githubProjects === null}
      <LoadingSkeleton count={2} label="Loading pinned projects" />
    {:else if githubProjects && githubProjects.length > 0}
        <div class="project-grid content-reveal-list">
          {#each pinnedProjects as project}
            {#if project.url}
              <a href={project.url} target="_blank" rel="noopener" class="project-card project-card--link active-press">
                <strong class="project-name">{project.name}</strong>
                {#if project.description}
                  <p class="project-desc">{project.description}</p>
                {/if}
                <span class="project-card-meta">
                  {#if project.language}
                    <span class="project-language">
                      <span
                        class="project-language-dot"
                        style:background-color={project.languageColor ?? 'var(--color-text-400)'}
                        aria-hidden="true"
                      ></span>
                      {project.language}
                    </span>
                  {/if}
                  <span class="project-link">
                    GitHub <ExternalLink size={10} strokeWidth={2} />
                  </span>
                </span>
              </a>
            {:else}
              <div class="project-card">
                <strong class="project-name">{project.name}</strong>
                {#if project.description}
                  <p class="project-desc">{project.description}</p>
                {/if}
              </div>
            {/if}
          {/each}
        </div>
        <a href={`https://github.com/${githubUsername}?tab=repositories`} target="_blank" rel="noopener" class="section-link">All repositories <ArrowRight size={14} strokeWidth={2} /></a>
    {:else}
        <EmptyState
          title="Projects unavailable"
          description="Unable to load project data at the moment. The service may be temporarily unavailable."
        />
    {/if}
  </section>

  <!-- Publications -->
  <section class="home-section animate-in stagger-4" aria-busy={publications === null}>
    <div class="home-section-hd">
      <span class="home-section-num" aria-hidden="true">03</span>
      <h2 class="home-section-title">Publications</h2>
    </div>
    {#if publications === null}
      <LoadingSkeleton count={2} label="Loading publications" />
    {:else if publications && publications.length > 0}
        <ul class="post-list content-reveal-list">
          {#each publications.filter((p: any) => p.rkey !== PUBLIC_LEAFLET_BLOG_PUBLICATION) as pub}
            <li>
              <a href={pub.url} target="_blank" rel="noopener" class="post-row publication-row active-press">
                <span class="post-title">{pub.name}</span>
                <span class="row-meta publication-description">{pub.description}</span>
              </a>
            </li>
          {/each}
        </ul>
    {:else}
        <EmptyState
          title="Publications unavailable"
          description="Unable to load publications at the moment. Please try again later."
        />
    {/if}
  </section>

  <!-- Links -->
  <section class="home-section animate-in stagger-5" aria-busy={links === null}>
    <div class="home-section-hd">
      <span class="home-section-num" aria-hidden="true">04</span>
      <h2 class="home-section-title">Elsewhere</h2>
    </div>
    {#if links === null}
      <LoadingSkeleton count={2} label="Loading external links" />
    {:else if links && links.cards && links.cards.length > 0}
        <div class="link-grid content-reveal-list">
          {#each links.cards.slice(0, 8) as link}
            <a href={link.url} target="_blank" rel="noopener" class="link-chip active-press">
              <span class="link-label">
                {#if link.emoji}
                  <span class="link-emoji">{link.emoji}</span>
                {/if}
                <span class="link-text">{link.text}</span>
              </span>
              <span class="link-url">{link.url}</span>
              <ExternalLink size={10} strokeWidth={2} class="muted-icon" />
            </a>
          {/each}
        </div>
    {:else}
        <EmptyState
          title="Links unavailable"
          description="Unable to load links at the moment. Please try again later."
        />
    {/if}
  </section>
</main>
