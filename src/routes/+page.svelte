<script lang="ts">
  import { SITE, PROJECTS } from '$lib/config';
  import ProjectList from '$lib/components/ProjectList.svelte';
  import Now from '$lib/components/Now.svelte';
</script>

<main>
    <header>
        <h1 style="font-size: var(--text-xl); font-weight: 800;">{SITE.title}</h1>
        <p>{SITE.description}</p>
    </header>
    <Now />
    <section>
        <h2 style="font-size: var(--text-lg); font-weight: 700;">Projects</h2>
        <ProjectList projects={PROJECTS} />
    </section>
</main>
