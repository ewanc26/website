<script lang="ts">
  import Section from "./Section.svelte";
  import LinkCard from "../../archive/LinkCard.svelte";
  import links from "../links.json";

  export let sectionKey: keyof typeof links.sections;
</script>

<Section title={links.sections[sectionKey].title}>
  {#each links.sections[sectionKey].links as link}
    <LinkCard title={link.title} value={link.value} url={link.url} />
  {/each}
</Section>
