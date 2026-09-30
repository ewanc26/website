<script lang="ts">
  import SeoHead from "$lib/components/SeoHead.svelte";
  import Slab from "$lib/components/Slab.svelte";

  let { data } = $props();
  const cv = $derived(data.cv);
  const curl = "curl -fsSL ewancroft.uk/cv | bash";
  const facts = $derived<[string, string][]>([
    ["Name", cv.name],
    ["Headline", cv.headline],
    ["Location", cv.location],
    ["Skills", `${cv.skillGroups.reduce((n: number, g: any) => n + g.skills.length, 0)} across ${cv.skillGroups.length} categories`],
    ["Projects", `${cv.selectedProjects.length + cv.recordProjects.length} listed`],
    ["Languages", cv.languages.map((l: any) => l.name).join(", ")],
  ]);
  const sections: [string, string][] = [
    ["1", "Profile"],
    ["2", "Methodology"],
    ["3", "Skills"],
    ["4", "Selected projects"],
    ["5", "Projects"],
    ["6", "Experience"],
    ["7", "Education"],
    ["8", "Languages & links"],
    ["a", "All sections"],
    ["q", "Quit"],
  ];
</script>

<SeoHead
  title="CV"
  description="Interactive terminal CV for Ewan Croft — aggregate of live AT Protocol records, served as a bash script."
  ogSubtitle="Interactive terminal CV."
  ogType="CV"
  siteInfo={data.siteInfo}
/>

<main class="wrap">
  <Slab word="Terminal CV" long />
  <p class="lede">A CV that lives in the terminal. It aggregates the same AT Protocol records as the about page and ships as a self-contained bash script.</p>

  <div class="cols thunk" style="--i:1">
    <h2>Run it</h2>
    <div>
      <pre style="padding:var(--space-md);border:var(--edge) solid var(--ink);background:var(--paper-deep)"><code>$ {curl}</code></pre>
      <div class="btns"><button type="button" class="btn btn--a" data-copy={curl}>Copy command</button></div>
      <p class="note">Append <code>-s -- skills</code> to print a single section.</p>
    </div>
  </div>

  <div class="cols thunk" style="--i:2">
    <h2>The menu</h2>
    <dl class="dl">
      {#each sections as [k, label] (k)}
        <dt>[{k}]</dt>
        <dd>{label}</dd>
      {/each}
    </dl>
  </div>

  <div class="cols thunk" style="--i:3">
    <h2>At a glance</h2>
    <div>
      <dl class="dl">
        {#each facts as [k, v] (k)}
          <dt>{k}</dt>
          <dd>{v}</dd>
        {/each}
      </dl>
      <p class="note">Generated {cv.generatedAt} from live records.</p>
    </div>
  </div>
</main>
