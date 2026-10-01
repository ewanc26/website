<script lang="ts">
  import type { ContributionCalendar, LanguageShare } from "$lib/services/github";

  interface Props {
    username: string;
    contributions: ContributionCalendar | null;
    languages: LanguageShare[];
  }
  let { username, contributions, languages }: Props = $props();

  const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const label = (d: { date: string; count: number }) =>
    `${d.count === 0 ? "No" : d.count} contribution${d.count === 1 ? "" : "s"} on ${fmtDate(d.date)}`;
  const dow = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();
  const fmtPercent = (n: number) => (n < 1 ? "<1" : n.toFixed(n < 10 ? 1 : 0));

  const stats = $derived.by(() => {
    if (!contributions) return null;
    const days = contributions.weeks.flat();
    let longest = 0;
    let run = 0;
    for (const d of days) {
      run = d.count > 0 ? run + 1 : 0;
      longest = Math.max(longest, run);
    }
    const best = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
    return { total: contributions.total, active: days.filter((d) => d.count > 0).length, longest, best };
  });

  const months = $derived.by(() => {
    if (!contributions) return [];
    const out: { col: number; name: string }[] = [];
    let last = -1;
    contributions.weeks.forEach((week, i) => {
      const m = new Date(`${week[0].date}T00:00:00Z`).getUTCMonth();
      if (m !== last && (out.length === 0 || i + 1 - out[out.length - 1].col >= 3)) {
        out.push({ col: i + 1, name: new Date(Date.UTC(2000, m, 1)).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }) });
      }
      last = m;
    });
    return out;
  });

  const toEnd = (node: HTMLElement) => {
    node.scrollLeft = node.scrollWidth;
  };
</script>

<div class="sheet thunk">
  <div class="sheet-hd pix">
    <span>SCORE SHEET</span>
    <a href={`https://github.com/${username}`} rel="noopener">@{username} ↗</a>
  </div>

  <div class="sheet-body">
    {#if contributions && stats}
      <dl class="stats">
        <div>
          <dt class="pix">Contributions</dt>
          <dd>{stats.total.toLocaleString("en-GB")}</dd>
        </div>
        <div>
          <dt class="pix">Days active</dt>
          <dd>{stats.active}</dd>
        </div>
        <div>
          <dt class="pix">Longest streak</dt>
          <dd>{stats.longest}<small>days</small></dd>
        </div>
        <div>
          <dt class="pix">Best day</dt>
          <dd>{stats.best.count}<small>{fmtDate(stats.best.date)}</small></dd>
        </div>
      </dl>

      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="graph-scroll" use:toEnd tabindex="0" role="region" aria-label="GitHub contribution graph, scrollable">
        <div class="graph" style={`--weeks:${contributions.weeks.length}`}>
          <div class="months pix" aria-hidden="true">
            {#each months as m (m.col)}<span style={`grid-column:${m.col}`}>{m.name}</span>{/each}
          </div>
          <div class="grid" role="img" aria-label={`${stats.total} GitHub contributions by @${username} in the last year`}>
            {#each contributions.weeks as week, w (w)}
              {#each week as day (day.date)}
                <span class="day" data-level={day.level} title={label(day)} style={`grid-column:${w + 1};grid-row:${dow(day.date) + 1}`}></span>
              {/each}
            {/each}
          </div>
        </div>
      </div>
      <div class="legend pix" aria-hidden="true">
        Less
        {#each [0, 1, 2, 3, 4] as l (l)}<span class="day" data-level={l}></span>{/each}
        More
      </div>
    {:else}
      <p class="empty">Contributions could not be loaded just now.</p>
    {/if}

    <div class="mix">
      <p class="pix mix-hd">Language mix</p>
      {#if languages.length}
        <div class="bar" role="img" aria-label={`Language breakdown: ${languages.map((l) => `${l.name} ${fmtPercent(l.percent)}%`).join(", ")}`}>
          {#each languages as l (l.name)}
            <span class="seg" style={`flex:${l.percent} 1 0;background:${l.color ?? "var(--ink-soft)"}`} title={`${l.name} ${fmtPercent(l.percent)}%`}></span>
          {/each}
        </div>
        <ul class="langs">
          {#each languages as l (l.name)}
            <li>
              <span class="key" style={`background:${l.color ?? "var(--ink-soft)"}`}></span>
              <span class="lang-name">{l.name}</span>
              <span class="lang-pct pix">{fmtPercent(l.percent)}%</span>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="empty">Languages could not be loaded just now.</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .sheet {
    --gh-0: #ebedf0;
    --gh-1: #9be9a8;
    --gh-2: #40c463;
    --gh-3: #30a14e;
    --gh-4: #216e39;
    min-width: 0;
    border: var(--edge, 3px) solid var(--ink);
    background: var(--paper);
    color: var(--ink);
  }
  @media (prefers-color-scheme: dark) {
    .sheet {
      --gh-0: #161b22;
      --gh-1: #0e4429;
      --gh-2: #006d32;
      --gh-3: #26a641;
      --gh-4: #39d353;
    }
  }
  .sheet-hd {
    display: flex;
    justify-content: space-between;
    gap: var(--space-md);
    padding: var(--space-xs) var(--space-md);
    background: var(--ink);
    color: var(--paper);
    font-size: var(--text-xs);
  }
  .sheet-hd a {
    color: inherit;
    text-decoration: none;
  }
  .sheet-hd a:hover,
  .sheet-hd a:focus-visible {
    text-decoration: underline;
  }
  .sheet-body {
    display: grid;
    gap: var(--space-lg);
    padding: var(--space-md);
    min-width: 0;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    margin: 0;
    border: 2px solid var(--ink);
  }
  .stats > div {
    display: grid;
    gap: 0.2rem;
    padding: var(--space-sm) var(--space-md);
    border-left: 2px solid var(--ink);
  }
  .stats > div:first-child {
    border-left: 0;
  }
  @media (max-width: 40rem) {
    .stats > div:nth-child(odd) {
      border-left: 0;
    }
    .stats > div:nth-child(n + 3) {
      border-top: 2px solid var(--ink);
    }
  }
  .stats dt {
    font-size: var(--text-xs);
    color: var(--ink-soft);
  }
  .stats dd {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: var(--text-lg);
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .stats small {
    margin-left: 0.4em;
    font-family: var(--font-pixel);
    font-weight: 400;
    font-size: var(--text-xs);
    letter-spacing: 0;
    color: var(--ink-soft);
  }

  .graph-scroll {
    overflow-x: auto;
    padding-bottom: var(--space-xs);
  }
  .graph {
    --cell: 0.8rem;
    --gap: 3px;
    min-width: calc(var(--weeks) * (var(--cell) + var(--gap)));
  }
  .months,
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--weeks), minmax(0, 1fr));
    gap: var(--gap);
  }
  .months {
    height: 1.4em;
    margin-bottom: var(--gap);
    font-size: var(--text-xs);
    color: var(--ink-soft);
  }
  .months span {
    white-space: nowrap;
  }
  .day {
    display: block;
    aspect-ratio: 1;
    background: var(--gh-0);
    outline: 1px solid color-mix(in oklab, var(--ink) 12%, transparent);
    outline-offset: -1px;
  }
  .day[data-level="1"] { background: var(--gh-1); }
  .day[data-level="2"] { background: var(--gh-2); }
  .day[data-level="3"] { background: var(--gh-3); }
  .day[data-level="4"] { background: var(--gh-4); }
  .grid .day:hover {
    outline: 2px solid var(--ink);
    outline-offset: 0;
  }
  .legend {
    display: flex;
    align-items: center;
    gap: 3px;
    justify-content: flex-end;
    font-size: var(--text-xs);
    color: var(--ink-soft);
  }
  .legend .day {
    width: 0.8rem;
  }
  .legend .day:first-of-type {
    margin-left: 0.4em;
  }
  .legend .day:last-of-type {
    margin-right: 0.4em;
  }

  .mix {
    padding-top: var(--space-md);
    border-top: 4px solid var(--ink);
    min-width: 0;
  }
  .mix-hd {
    margin: 0 0 var(--space-sm);
    font-size: var(--text-xs);
    color: var(--ink-soft);
  }
  .bar {
    display: flex;
    height: 1.75rem;
    border: 2px solid var(--ink);
  }
  .seg + .seg {
    border-left: 2px solid var(--ink);
  }
  .langs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
    gap: var(--space-xs) var(--space-md);
    margin: var(--space-md) 0 0;
    padding: 0;
    list-style: none;
  }
  .langs li {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--space-sm);
    align-items: center;
  }
  .key {
    width: 0.8rem;
    height: 0.8rem;
    border: 2px solid var(--ink);
    box-sizing: content-box;
  }
  .lang-name {
    font-family: var(--font-display);
    font-weight: 800;
    line-height: 1.1;
  }
  .lang-pct {
    font-size: var(--text-xs);
    color: var(--ink-soft);
  }
</style>
