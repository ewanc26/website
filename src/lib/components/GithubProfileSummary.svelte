<script lang="ts">
  import type { GitHubProfileSummary, GitHubMetric } from "$lib/services/github";
  import ArrowUpRight from "$lib/components/icons/ArrowUpRight.svelte";

  interface Props {
    summary: GitHubProfileSummary | null;
  }

  let { summary }: Props = $props();

  const fmt = (n: number) => n.toLocaleString("en-GB");
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  const pct = (n: number) => (n < 1 ? "<1" : n.toFixed(n < 10 ? 1 : 0));

  const palette = [
    "var(--riso-a)",
    "var(--riso-b)",
    "var(--riso-c)",
    "var(--riso-d)",
    "var(--riso-e)",
    "var(--riso-f)",
  ];

  const colour = (item: GitHubMetric, index: number) =>
    item.color ?? palette[index % palette.length];

  const donutSegments = (items: GitHubMetric[]) => {
    let offset = 0;
    return items.map((item, index) => {
      const segment = { ...item, offset, color: colour(item, index) };
      offset += item.percent;
      return segment;
    });
  };

  const maxQuarter = (items: GitHubMetric[]) =>
    Math.max(...items.map((item) => item.value), 1);

  const quarterPoints = (items: GitHubMetric[]) => {
    const max = maxQuarter(items);
    return items
      .map((item, index) => {
        const x = items.length === 1 ? 50 : (index / (items.length - 1)) * 100;
        const y = 94 - (item.value / max) * 78;
        return { ...item, x, y };
      });
  };

  const languageUrl = (name: string) =>
    name === "Unknown" || name === "Other"
      ? `https://github.com/${summary?.user.login}?tab=repositories`
      : `https://github.com/${summary?.user.login}?tab=repositories&type=source&language=${encodeURIComponent(name)}`;

  const repoRows = (items: GitHubMetric[]) =>
    items.map((item) => ({
      ...item,
      percent: item.percent,
      color: item.color ?? "var(--riso-a)",
    }));
</script>

{#if summary}
  <section class="profile">
    <div class="profile-head">
      <img
        src={summary.user.avatarUrl}
        alt=""
        width="88"
        height="88"
        loading="lazy"
        decoding="async"
      />
      <div class="profile-copy">
        <div class="eyebrow pix">GITHUB PROFILE</div>
        <div class="profile-name">{summary.user.name || summary.user.login}</div>
        <a class="profile-login pix" href={summary.user.htmlUrl} rel="noopener">
          @{summary.user.login} <ArrowUpRight />
        </a>
        <div class="profile-meta">
          <span>{fmt(summary.user.publicRepos)} public repos</span>
          <span>joined {fmtDate(summary.user.createdAt)}</span>
        </div>
      </div>
    </div>

    <div class="quarter">
      <div class="panel-head">
        <span class="pix">COMMITS PER QUARTER</span>
        <span class="pix">{fmt(summary.allTimeCommits)} total</span>
      </div>
      {#if summary.quarterCommits.length}
        {@const points = quarterPoints(summary.quarterCommits)}
        <div class="line-wrap">
          <svg viewBox="0 0 100 100" role="img" aria-label="Commits per quarter">
            <line x1="0" y1="94" x2="100" y2="94" class="axis" />
            <polyline
              points={points.map((point) => `${point.x},${point.y}`).join(" ")}
              class="line"
            />
            {#each points as point (point.name)}
              <circle cx={point.x} cy={point.y} r="1.6" class="point">
                <title>{point.name}: {fmt(point.value)} commits</title>
              </circle>
            {/each}
          </svg>
        </div>
        <div class="quarter-labels pix">
          {#each summary.quarterCommits as item (item.name)}
            <span>{item.name}</span>
          {/each}
        </div>
      {:else}
        <p class="empty">Quarterly commit history is unavailable.</p>
      {/if}
    </div>
  </section>

  <div class="chart-grid chart-grid--thirds">
    <MetricDonut title="Repos per language" items={summary.repoLanguage} />
    <MetricDonut title="Stars per language" items={summary.starLanguage} />
    <MetricDonut title="Commits per language" items={summary.commitLanguage} />
  </div>

  <div class="chart-grid chart-grid--halves">
    <MetricList title="Commits per repo" items={repoRows(summary.repoCommits)} note="top 10" />
    <MetricList title="Stars per repo" items={repoRows(summary.repoStars)} note="top 10" />
  </div>
{:else}
  <p class="empty">The extended GitHub profile summary could not be loaded just now.</p>
{/if}

{#snippet MetricDonut(title: string, items: GitHubMetric[])}
  {@const segments = donutSegments(items)}
  <section class="chart-panel thunk">
    <div class="panel-head">
      <span class="pix">{title}</span>
    </div>
    {#if items.length}
      <div class="donut-layout">
        <svg class="donut" viewBox="0 0 120 120" role="img" aria-label={title}>
          <circle cx="60" cy="60" r="42" class="donut-base" pathLength="100" />
          {#each segments as item, index (item.name)}
            <circle
              cx="60"
              cy="60"
              r="42"
              class="donut-segment"
              pathLength="100"
              stroke={item.color}
              stroke-dasharray={`${item.percent} ${100 - item.percent}`}
              stroke-dashoffset={-item.offset}
              transform="rotate(-90 60 60)"
            >
              <title>{item.name}: {pct(item.percent)}%</title>
            </circle>
          {/each}
          <text x="60" y="57" text-anchor="middle" class="donut-total">{fmt(items.reduce((n, item) => n + item.value, 0))}</text>
          <text x="60" y="69" text-anchor="middle" class="donut-sub">total</text>
        </svg>

        <ul class="chart-key">
          {#each items as item, index (item.name)}
            <li>
              <a href={languageUrl(item.name)} rel="noopener">
                <span class="key" style={`background:${colour(item, index)}`}></span>
                <span>{item.name}</span>
                <span class="key-value pix">{pct(item.percent)}%</span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {:else}
      <p class="empty">No data.</p>
    {/if}
  </section>
{/snippet}

{#snippet MetricList(title: string, items: GitHubMetric[], note: string)}
  <section class="chart-panel thunk">
    <div class="panel-head">
      <span class="pix">{title}</span>
      <span class="pix">({note})</span>
    </div>
    {#if items.length}
      <ol class="repo-list">
        {#each items as item, index (item.name)}
          <li>
            <a href={item.url} rel="noopener">
              <span class="repo-rank pix">{String(index + 1).padStart(2, "0")}</span>
              <span class="repo-copy">
                <span class="repo-name">{item.name}</span>
                {#if item.description}<span class="repo-description">{item.description}</span>{/if}
              </span>
              <span class="repo-value">
                <strong>{fmt(item.value)}</strong>
                <small class="pix">{pct(item.percent)}%</small>
              </span>
            </a>
          </li>
        {/each}
      </ol>
    {:else}
      <p class="empty">No data.</p>
    {/if}
  </section>
{/snippet}

<style>
  .profile {
    display: grid;
    grid-template-columns: minmax(14rem, 0.7fr) minmax(20rem, 1.3fr);
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
  }

  .profile-head,
  .quarter,
  .chart-panel {
    min-width: 0;
    border: var(--edge, 3px) solid var(--ink);
    background: var(--paper);
  }

  .profile-head {
    display: flex;
    gap: var(--space-md);
    align-items: center;
    padding: var(--space-md);
  }

  .profile-head img {
    width: 5.5rem;
    height: 5.5rem;
    flex: 0 0 auto;
    object-fit: cover;
    border: 3px solid var(--ink);
    border-radius: 0;
  }

  .profile-copy {
    min-width: 0;
  }

  .eyebrow,
  .panel-head {
    color: var(--ink-soft);
  }

  .eyebrow {
    font-size: var(--text-xs);
  }

  .profile-name {
    margin: 0.2rem 0;
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 3vw, 2.4rem);
    font-weight: 900;
    line-height: 0.95;
    overflow-wrap: anywhere;
  }

  .profile-login {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--ink);
    text-decoration: none;
    font-size: var(--text-xs);
  }

  .profile-login :global(svg) {
    width: 0.8rem;
    height: 0.8rem;
  }

  .profile-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 1rem;
    margin-top: var(--space-sm);
    color: var(--ink-soft);
    font-size: var(--text-xs);
  }

  .quarter {
    padding: var(--space-md);
  }

  .panel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-md);
    margin-bottom: var(--space-sm);
    font-size: var(--text-xs);
  }

  .line-wrap {
    height: 8rem;
  }

  .line-wrap svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .axis {
    stroke: var(--ink);
    stroke-width: 0.8;
    opacity: 0.22;
  }

  .line {
    fill: none;
    stroke: var(--riso-a);
    stroke-width: 2;
    vector-effect: non-scaling-stroke;
  }

  .point {
    fill: var(--paper);
    stroke: var(--riso-a);
    stroke-width: 1.2;
    vector-effect: non-scaling-stroke;
  }

  .quarter-labels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(4.5rem, 1fr));
    gap: 0.25rem;
    color: var(--ink-soft);
    font-size: 0.6rem;
  }

  .quarter-labels span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chart-grid {
    display: grid;
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
  }

  .chart-grid--thirds {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .chart-grid--halves {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-panel {
    padding: var(--space-md);
  }

  .donut-layout {
    display: grid;
    grid-template-columns: minmax(7rem, 9rem) minmax(0, 1fr);
    gap: var(--space-md);
    align-items: center;
  }

  .donut {
    width: 100%;
    max-width: 9rem;
    justify-self: center;
  }

  .donut-base,
  .donut-segment {
    fill: none;
    stroke-width: 15;
  }

  .donut-base {
    stroke: color-mix(in oklab, var(--ink) 10%, transparent);
  }

  .donut-segment {
    transition: opacity 120ms ease;
  }

  .donut-segment:hover {
    opacity: 0.7;
  }

  .donut-total {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 900;
    fill: var(--ink);
  }

  .donut-sub {
    font-family: var(--font-pixel);
    font-size: 5px;
    fill: var(--ink-soft);
    text-transform: uppercase;
  }

  .chart-key,
  .repo-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .chart-key {
    display: grid;
    gap: 0.45rem;
    min-width: 0;
  }

  .chart-key a {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.5rem;
    color: var(--ink);
    text-decoration: none;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 0.78rem;
  }

  .chart-key a:hover .key,
  .chart-key a:focus-visible .key {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }

  .key {
    width: 0.7rem;
    height: 0.7rem;
    border: 2px solid var(--ink);
    box-sizing: content-box;
    flex: 0 0 auto;
  }

  .key-value {
    color: var(--ink-soft);
    font-size: 0.62rem;
    white-space: nowrap;
  }

  .repo-list {
    display: grid;
  }

  .repo-list li + li {
    border-top: 2px solid color-mix(in oklab, var(--ink) 18%, transparent);
  }

  .repo-list a {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr) auto;
    gap: var(--space-sm);
    align-items: center;
    padding: 0.7rem 0;
    color: var(--ink);
    text-decoration: none;
  }

  .repo-list a:hover .repo-name,
  .repo-list a:focus-visible .repo-name {
    text-decoration: underline;
  }

  .repo-rank {
    color: var(--ink-soft);
    font-size: 0.65rem;
  }

  .repo-copy {
    display: grid;
    gap: 0.15rem;
    min-width: 0;
  }

  .repo-name {
    font-family: var(--font-display);
    font-size: 1rem;
    font-weight: 900;
    overflow-wrap: anywhere;
  }

  .repo-description {
    color: var(--ink-soft);
    font-size: 0.75rem;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .repo-value {
    display: grid;
    justify-items: end;
    gap: 0.1rem;
  }

  .repo-value strong {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 900;
  }

  .repo-value small {
    color: var(--ink-soft);
    font-size: 0.6rem;
  }

  .empty {
    margin: 0;
    color: var(--ink-soft);
  }

  @media (max-width: 58rem) {
    .profile {
      grid-template-columns: 1fr;
    }

    .chart-grid--thirds {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 40rem) {
    .chart-grid--thirds,
    .chart-grid--halves {
      grid-template-columns: 1fr;
    }

    .donut-layout {
      grid-template-columns: 8rem minmax(0, 1fr);
    }

    .profile-head {
      align-items: flex-start;
    }

    .profile-head img {
      width: 4.5rem;
      height: 4.5rem;
    }

    .repo-list a {
      grid-template-columns: 1.75rem minmax(0, 1fr) auto;
    }
  }
</style>
