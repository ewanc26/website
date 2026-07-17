<script lang="ts">
  import { onMount } from 'svelte';
  import SiteHead from '$lib/components/SiteHead.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';
  import VerificationBadge from '$lib/components/VerificationBadge.svelte';
  import Triskele from '$lib/components/icons/Triskele.svelte';
  import { ArrowRight, ExternalLink, Music } from '@lucide/svelte';
  import { normalizeSlug } from '$lib/utils/slugify';
  import type { ProfileData } from '@ewanc26/atproto';
  import { PUBLIC_LEAFLET_BLOG_PUBLICATION } from '$env/static/public';

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

  function getBlogUrl(post: any) {
    const date = new Date(post.createdAt);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const slug = normalizeSlug(post.title);
    return `/blog/${y}/${m}/${d}/${slug}`;
  }
</script>

<SiteHead ogType="HOME" />

<main class="shell-wide home-page">
  <!-- Hero -->
  <section class="page-hd hero-hd hero-reveal">
    {#if profile.avatar}
      <img src={profile.avatar} alt="" class="hero-avatar" />
    {/if}
    <div class="hero-text">
      <h1 class="page-title">
        {profile.displayName ?? profile.handle}
        <VerificationBadge verified={true} verifiers={data.verifications} />
      </h1>
      <p class="hero-bio">{profile.description}</p>
      <div class="hero-meta" aria-label="Profile metadata">
        <span>@{profile.handle}</span>
        <span>AT Protocol</span>
        <span>Personal web</span>
      </div>
    </div>
  </section>

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

  <div class="home-ornament" aria-hidden="true">
    <Triskele size={18} />
  </div>

  <!-- Writing -->
  <section class="home-section animate-in stagger-2" aria-busy={posts === null}>
    <div class="home-section-hd">
      <h2 class="home-section-title">Recent writing</h2>
    </div>
    {#if posts === null}
      <LoadingSkeleton count={3} label="Loading recent posts" />
    {:else if Array.isArray(posts) && posts.length > 0}
        <ul class="post-list home-post-list content-reveal-list">
          {#each posts.filter(p => p.publicationRkey === PUBLIC_LEAFLET_BLOG_PUBLICATION).slice(0, 5) as post, i}
            <li>
              <a href={getBlogUrl(post)} class="post-row hover-lift active-press">
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
      <h2 class="home-section-title">Selected projects</h2>
    </div>
    {#if githubProjects === null}
      <LoadingSkeleton count={2} label="Loading pinned projects" />
    {:else if githubProjects && githubProjects.length > 0}
        <div class="project-grid content-reveal-list">
          {#each pinnedProjects as project}
            {#if project.url}
              <a href={project.url} target="_blank" rel="noopener" class="project-card project-card--link hover-lift active-press">
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
      <h2 class="home-section-title">Publications</h2>
    </div>
    {#if publications === null}
      <LoadingSkeleton count={2} label="Loading publications" />
    {:else if publications && publications.length > 0}
        <ul class="post-list content-reveal-list">
          {#each publications.filter((p: any) => p.rkey !== PUBLIC_LEAFLET_BLOG_PUBLICATION) as pub}
            <li>
              <a href={pub.url} target="_blank" rel="noopener" class="post-row publication-row hover-lift active-press">
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
      <h2 class="home-section-title">Elsewhere</h2>
    </div>
    {#if links === null}
      <LoadingSkeleton count={2} label="Loading external links" />
    {:else if links && links.cards && links.cards.length > 0}
        <div class="link-grid content-reveal-list">
          {#each links.cards.slice(0, 8) as link}
            <a href={link.url} target="_blank" rel="noopener" class="link-chip hover-lift active-press">
              {#if link.emoji}
                <span class="link-emoji">{link.emoji}</span>
              {/if}
              <span class="link-text">{link.text}</span>
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
