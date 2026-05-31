<script lang="ts">
  import SiteHead from '$lib/components/SiteHead.svelte';

  let { data } = $props();
</script>

<SiteHead title="Subscriptions" description="Publications I read on Standard.site." />

<main class="shell-narrow spec-sheet">
  <!-- ── Spec Header ──────────────────────────────── -->
  <header class="spec-header">
    <div class="spec-meta">
      <span class="meta-tag">REGISTRY-002</span>
      <span class="meta-tag">EXTERNAL</span>
      <span class="meta-tag">INDEXED</span>
    </div>
    <div class="header-main">
      <h1 class="spec-title">Subscriptions</h1>
      <p class="spec-abstract">
        A technical index of publications and feeds actively tracked on <strong>Standard.site</strong>. This registry serves as a curated bibliography of external technical and creative influences.
      </p>
    </div>
  </header>

  <div class="spec-grid">
    <section class="spec-section registry" id="registry">
      <header class="section-hd">
        <span class="section-num">[01]</span>
        <h2 class="section-title">Active Index</h2>
      </header>
      <div class="section-content">
        {#if data.subscriptions.length === 0}
          <div class="empty-state">
            <span class="meta">NULL_SET</span>
            <p>No external subscriptions found in the current registry.</p>
          </div>
        {:else}
          <div class="registry-list">
            {#each data.subscriptions as sub, i}
              <article class="registry-item">
                <div class="item-meta">
                  <span class="item-index">#{String(i + 1).padStart(3, '0')}</span>
                  <span class="item-id">{sub.authorHandle}</span>
                </div>
                <div class="item-body">
                  <h3 class="item-name">
                    <a href={sub.url} target="_blank" rel="noopener">
                      {sub.name}
                    </a>
                  </h3>
                  <div class="item-author">
                    <span class="label">AUTHOR</span>
                    <span class="value">{sub.authorDisplayName ?? sub.authorHandle}</span>
                  </div>
                  {#if sub.description}
                    <p class="item-desc">{sub.description}</p>
                  {/if}
                </div>
              </article>
            {/each}
          </div>
        {/if}
      </div>
    </section>
  </div>
</main>

<style>
  .spec-sheet {
    padding-top: var(--space-xl);
    padding-bottom: var(--space-2xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  /* ── Spec Header ──────────────────────────────── */
  .spec-header {
    padding-bottom: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .spec-meta {
    display: flex;
    gap: var(--space-sm);
  }

  .meta-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--color-ink-500);
    background: var(--surface-raised);
    padding: 2px 6px;
    border: 1px solid var(--surface-color);
  }

  .spec-title {
    font-size: clamp(2.5rem, 8vw, 4rem);
    font-weight: 800;
    line-height: 0.9;
    letter-spacing: -0.04em;
    margin: 0;
    text-transform: uppercase;
  }

  .spec-abstract {
    margin: var(--space-md) 0 0;
    max-width: 60ch;
    font-size: var(--text-md);
    color: var(--color-ink-700);
    line-height: 1.5;
  }

  /* ── Spec Grid ────────────────────────────────── */
  .spec-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xl);
  }

  .spec-section {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: var(--space-xl);
    border-top: 1px solid var(--surface-color);
    padding-top: var(--space-lg);
  }

  @media (max-width: 700px) {
    .spec-section {
      grid-template-columns: 1fr;
      gap: var(--space-md);
    }
  }

  .section-hd {
    display: flex;
    flex-direction: column;
    gap: var(--space-2xs);
  }

  .section-num {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-primary-500);
    font-weight: 700;
  }

  .section-title {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 800;
    margin: 0;
    color: var(--color-ink-950);
  }

  /* ── Registry List ────────────────────────────── */
  .registry-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .registry-item {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: var(--space-lg);
    padding-bottom: var(--space-lg);
  }

  @media (max-width: 600px) {
    .registry-item {
      grid-template-columns: 1fr;
      gap: var(--space-xs);
    }
  }

  .item-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .item-index {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 800;
    color: var(--color-primary-500);
  }

  .item-id {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--color-ink-500);
    word-break: break-all;
  }

  .item-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .item-name {
    font-size: var(--text-md);
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }

  .item-name a {
    color: var(--color-ink-950);
    text-decoration-thickness: 1px;
  }

  .item-author {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
  }

  .item-author .label {
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 800;
    color: var(--color-ink-500);
    letter-spacing: 0.05em;
  }

  .item-author .value {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-ink-700);
  }

  .item-desc {
    font-size: var(--text-sm);
    color: var(--color-ink-700);
    margin: var(--space-xs) 0 0;
    line-height: 1.6;
    max-width: 60ch;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-2xl) 0;
    color: var(--color-ink-500);
    gap: var(--space-sm);
  }

  .empty-state .meta {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
  }
</style>
