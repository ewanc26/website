<script lang="ts">
  interface Project {
    title: string;
    description: string;
    url: string;
  }

  let { projects } = $props<{ projects: Project[] }>();
</script>

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

<style>
  .project-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .project-item {
    text-decoration: none;
    color: inherit;
    display: block;
    padding: var(--space-sm);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-lg);
  }

  .project-title {
    margin: 0;
    font-size: var(--text-md);
  }

  .project-desc {
    margin: var(--space-xs) 0 0 0;
    font-size: var(--text-sm);
    opacity: 0.8;
  }
</style>
