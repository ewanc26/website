<script lang="ts">
  import SiteHead from "$lib/components/SiteHead.svelte";
  import EmptyState from "$lib/components/EmptyState.svelte";

  let { data } = $props();

  type ProjectSummary = {
    title: string;
    description: string;
    path?: string;
    publishedAt: string;
  };
  let projects: ProjectSummary[] = $state([]);
  let hasMore = $state(false);
  let loading = $state(false);

  $effect.pre(() => {
    projects = data.projects;
    hasMore = data.hasMore;
  });

  function formatMonth(month: number) {
    return new Date(2000, month - 1, 1).toLocaleDateString("en-GB", {
      month: "long",
    });
  }

  function groupProjects(items: ProjectSummary[]) {
    const grouped = new Map<number, Map<number, ProjectSummary[]>>();
    for (const item of items) {
      const date = new Date(item.publishedAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      if (!grouped.has(year)) grouped.set(year, new Map());
      const yearMap = Number.isNaN(year) ? null : grouped.get(year);
      if (!yearMap) continue;
      if (!yearMap.has(month)) yearMap.set(month, []);
      yearMap.get(month)!.push(item);
    }
    return grouped;
  }

  async function loadMore() {
    if (loading || !hasMore) return;
    loading = true;
    try {
      const res = await fetch(
        `/api/projects?offset=${projects.length}&limit=${data.pageSize}`,
      );
      const result = await res.json();
      projects = [...projects, ...result.projects];
      hasMore = projects.length < result.total;
    } catch {
      // Safe fallback
    } finally {
      loading = false;
    }
  }
</script>

<SiteHead
  title={data.publication?.title ?? "Projects"}
  description={data.publication?.description}
  ogType="PROJECTS"
/>

<main class="shell-wide">
  <header class="page-hd">
    <h1 class="page-title">{data.publication?.title ?? "Projects"}</h1>
    {#if data.publication?.description}
      <p class="page-desc">{data.publication.description}</p>
    {/if}
  </header>

  {#if projects.length > 0}
    {#each groupProjects(projects) as [year, months]}
      <div class="year-head">{year}</div>
      {#each months as [month, monthProjects]}
        <div class="month-label">{formatMonth(month)}</div>
        <ul class="post-list">
          {#each monthProjects as project}
            <li>
              <a href="/projects/{project.path}" class="post-row">
                <span class="post-title">{project.title}</span>
                <time class="post-date"
                  >{new Date(project.publishedAt).toLocaleDateString()}</time
                >
              </a>
            </li>
          {/each}
        </ul>
      {/each}
    {/each}

    {#if hasMore}
      <div class="load-more">
        <button onclick={loadMore} disabled={loading} type="button">
          {loading ? "Loading..." : "Load more"}
        </button>
      </div>
    {/if}
  {:else}
    <EmptyState
      title="No projects available"
      description="Unable to load projects at the moment. Please try again later."
    />
  {/if}
</main>
