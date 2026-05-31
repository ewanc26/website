<script lang="ts">
  interface Project {
    title: string;
    description: string;
    url: string;
  }

  let { projects } = $props<{ projects: Project[] }>();
</script>

<ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-md);">
  {#each projects as project}
    <li>
      <a href={project.url} style="text-decoration: none; color: inherit; display: block; padding: var(--space-sm); border: 1px solid var(--surface-color); border-radius: 8px;">
        <h3 style="margin: 0; font-size: var(--text-md);">{project.title}</h3>
        <p style="margin: var(--space-xs) 0 0 0; font-size: var(--text-sm); opacity: 0.8;">{project.description}</p>
      </a>
    </li>
  {/each}
</ul>
