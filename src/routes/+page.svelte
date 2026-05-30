<script lang="ts">
  import { SITE, PROJECTS } from '$lib/config';
  import ProjectList from '$lib/components/ProjectList.svelte';
</script>

<main>
    <header>
        <h1 style="font-size: var(--text-xl);">{SITE.title}</h1>
        <p>{SITE.description}</p>
    </header>
    <section>
        <h2 style="font-size: var(--text-lg);">Projects</h2>
        <ProjectList projects={PROJECTS} />
    </section>
</main>
