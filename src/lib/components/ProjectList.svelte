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
