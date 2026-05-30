<script lang="ts">
  import ProjectList from '$lib/components/ProjectList.svelte';

  const projects = [
    { title: 'Project A', description: 'A systematic design study.', url: '#' },
    { title: 'Project B', description: 'Exploring data structures.', url: '#' }
  ];
</script>

<main>
    <header>
        <h1 style="font-size: var(--text-xl);">Website Redesign</h1>
        <p>A minimalist, systematic redesign.</p>
    </header>
    <section>
        <h2 style="font-size: var(--text-lg);">Projects</h2>
        <ProjectList {projects} />
    </section>
</main>
