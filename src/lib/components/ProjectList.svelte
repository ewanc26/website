<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte';

  interface Project {
    title: string;
    description: string;
    url: string;
  }

  let { projects } = $props<{ projects: Project[] }>();
</script>

{#if projects.length > 0}
  <ul class="project-list">
    {#each projects as project}
      <li>
        <a href={project.url} class="project-item">
          <h3 class="project-title">{project.title}</h3>
          <p class="project-desc">{project.description}</p>
        </a>
      </li>
    {/each}
  </ul>
{:else}
  <EmptyState
    title="No projects available"
    description="Projects will appear here once data is loaded."
    icon={false}
  />
{/if}
