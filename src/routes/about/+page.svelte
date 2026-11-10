<script lang="ts">
  import ArrowUpRight from "$lib/components/icons/ArrowUpRight.svelte";
  import SeoHead from "$lib/components/SeoHead.svelte";
  import Slab from "$lib/components/Slab.svelte";
  import SigilBand from "$lib/components/SigilBand.svelte";
  import Barcode from "$lib/components/Barcode.svelte";

  let { data } = $props();
  const { profile, links, sifa, skills, education, languages, professional, projects, pds } = $derived(data);

  /** True when the ATProto profile fetch failed and the server passed the
      empty fallback — a real profile always carries a handle. */
  const profileDown = $derived(!profile.handle);

  const CATEGORY: Record<string, string> = {
    "id.sifa.defs#technical": "Technical",
    "id.sifa.defs#creative": "Creative",
    "id.sifa.defs#industry": "Industry",
    "id.sifa.defs#soft": "Soft skills",
  };
  const PROFICIENCY: Record<string, string> = {
    "id.sifa.defs#native": "Native",
    "id.sifa.defs#fluent": "Fluent",
    "id.sifa.defs#limitedWorking": "Limited working",
    "id.sifa.defs#elementary": "Elementary",
  };
  const grouped = $derived.by(() => {
    const m = new Map<string, any[]>();
    for (const s of skills as any[]) {
      const c = CATEGORY[s.category] ?? s.category.split("#")[1] ?? "Other";
      m.set(c, [...(m.get(c) ?? []), s]);
    }
    return m;
  });
  const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmt = (d?: string) => {
    if (!d) return "—";
    const [y, m] = d.split("-");
    return `${MONTHS[parseInt(m)] ?? "Jan"} ${y}`;
  };
  const PGP = "C918 A4FC C656 BEBF 0EB7  AE01 4CB2 0882 06DB 0B7D";
</script>

<SeoHead title="About" description={profile.description} ogType="ABOUT" siteInfo={data.siteInfo} />

<main class="wrap">
  <Slab word="About" sigils={false} />

  <div class="idcard-row">
    <div class="idcard thunk">
      <div class="idcard-hd"><span>ID CARD</span><span>{sifa?.headline ?? "Software developer"}</span></div>
      <div class="photo">
        {#if profile.avatar}
          <img src={profile.avatar} alt={`Portrait of ${profile.displayName ?? profile.handle}`} />
        {:else}
          <!-- The "no photo" treatment: a silhouette in the ink frame. -->
          <svg class="photo-silhouette" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4.4" />
            <path d="M2.5 24a9.5 9.5 0 0 1 19 0z" />
          </svg>
          <span class="sr-only">No photo available.</span>
        {/if}
      </div>
      <div>
        {#if profileDown}
          <!-- Profile fetch failed: keep the card's fixed identity on show
               and say so, instead of rendering hollow fields. -->
          <p class="idcard-name"><span lang="gd">eòghann</span></p>
          <p class="tape tape--a" style="margin-top:.6rem">Profile offline</p>
          <p class="note" style="margin-top:.75rem">The ID service isn't answering right now — try again in a bit.</p>
        {:else}
          <p class="idcard-name">{profile.displayName ?? profile.handle}<br /><span lang="gd" style="font-size:0.55em">eòghann</span></p>
          {#if profile.pronouns}<p class="chip" style="width:fit-content;margin-top:.5rem">{profile.pronouns}</p>{/if}
          <p class="lede" style="margin-top:1rem;font-size:1.1rem">{profile.description}</p>
        {/if}
      </div>
      <div style="grid-column:1/-1"><Barcode value={profile.did} /></div>
    </div>
    <SigilBand side />
  </div>

  <div class="cols thunk" style="--i:1">
    <h2>Skills</h2>
    <div>
      {#if grouped.size === 0}<p class="empty">Skills could not be loaded just now.</p>{/if}
      {#each [...grouped.entries()] as [cat, list] (cat)}
        <div style="margin-bottom:1.5rem">
          <p class="pix" style="margin-bottom:.5rem;color:var(--riso-a-text)">{cat}</p>
          <ul class="chips">
            {#each list as s (s.name)}<li class="chip">{s.name}</li>{/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>

  <div class="cols thunk" style="--i:2">
    <h2>Education</h2>
    {#if education.length === 0}
      <p class="empty">Education could not be loaded just now.</p>
    {:else}
      <ul class="shelf">
        {#each education as e (e.institution + e.degree)}
          <li class="shelf-item">
            <span class="shelf-name">{e.degree}</span>
            <span class="shelf-meta">{fmt(e.startedAt)} – {e.endedAt ? fmt(e.endedAt) : "Present"}</span>
            <p class="shelf-note">{e.institution}</p>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="cols thunk" style="--i:3">
    <h2>Works</h2>
    {#if projects.length === 0}
      <p class="empty">Projects could not be loaded just now.</p>
    {:else}
      <ul class="shelf">
        {#each projects as p (p.url)}
          <li>
            <a href={p.url} rel="noopener">
              <span class="shelf-name">{p.name}</span><span class="shelf-meta">{p.language ?? ""}<ArrowUpRight /></span>
              {#if p.description}<p class="shelf-note">{p.description}</p>{/if}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="cols thunk" style="--i:4">
    <h2>Tongues</h2>
    {#if languages.length === 0}
      <p class="empty">Languages could not be loaded just now.</p>
    {:else}
      <ul class="shelf">
        {#each languages as l (l.name)}
          <li class="shelf-item"><span class="shelf-name">{l.name}</span><span class="shelf-meta">{PROFICIENCY[l.proficiency] ?? l.proficiency}</span></li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="cols thunk" style="--i:5">
    <h2>Links</h2>
    <ul class="shelf">
      {#each links?.cards ?? [] as c (c.url)}
        <li><a href={c.url} rel="noopener"><span class="shelf-name">{c.emoji} {c.text}</span><span class="shelf-meta"><ArrowUpRight /></span></a></li>
      {/each}
    </ul>
  </div>

  <div class="cols thunk" style="--i:6">
    <h2>Professional</h2>
    <ul class="shelf">
      {#each professional.filter((a: any) => a.label && a.url) as a (a.url)}
        <li><a href={a.url} rel="noopener"><span class="shelf-name">{a.label}</span><span class="shelf-meta"><ArrowUpRight /></span></a></li>
      {/each}
    </ul>
  </div>

  <div class="cols thunk" style="--i:7">
    <h2>Identity</h2>
    <dl class="dl">
      <dt>DID</dt>
      <dd><code>{profile.did}</code> <button type="button" class="btn btn--small" data-copy={profile.did}>Copy</button></dd>
      <dt>Handle</dt>
      <dd><code>{profile.handle || "—"}</code></dd>
      <dt>PDS</dt>
      <dd><code>{pds ?? "Unknown"}</code></dd>
      <dt>PGP</dt>
      <dd>
        <code>{PGP}</code> <button type="button" class="btn btn--small" data-copy={PGP.replace(/\s/g, "")}>Copy</button>
        <a href="/pgp-key.asc" class="btn btn--small">Key ↓</a>
      </dd>
      <dt>More</dt>
      <dd><a href="/about/name">About my name →</a> · <a href="/about/cv">Terminal CV →</a></dd>
    </dl>
  </div>
</main>

<style>
  .idcard-row {
    display: flex;
    gap: var(--space-xl, 3rem);
    align-items: stretch;
  }
  .idcard-row > :global(.idcard) {
    flex: 0 1 44rem;
    min-width: 0;
  }
  /* "No photo" silhouette for the ink frame when no avatar is available.
     Paper-on-ink, so it inverts correctly in both schemes. */
  .photo-silhouette {
    position: absolute;
    left: 50%;
    top: 46%;
    width: 62%;
    aspect-ratio: 1;
    translate: -50% -50%;
    fill: var(--paper);
    opacity: 0.9;
  }
</style>
