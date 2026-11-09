<script lang="ts">
  /**
   * A call-to-action card for supporting the work.
   * Designed to fit the risograph zine aesthetic with two-ink styling.
   */
  import { Heart } from "@lucide/svelte";
  import ArrowUpRight from "$lib/components/icons/ArrowUpRight.svelte";

  interface Props {
    compact?: boolean;
  }

  let { compact = false }: Props = $props();

  const supportLinks = [
    {
      name: "Ko-fi",
      url: "https://ko-fi.com/ewancroft",
      description: "one-time or monthly",
    },
    {
      name: "GitHub Sponsors",
      url: "https://github.com/sponsors/ewanc26",
      description: "one-time or monthly",
    },
  ];
</script>

<div class="support-cta" class:support-cta--compact={compact}>
  <div class="support-cta-header">
    <Heart size="1.5em" aria-hidden="true" />
    <h2 class="support-cta-title">
      {compact ? "Support my work" : "Support this work"}
    </h2>
  </div>
  
  {#if !compact}
    <p class="support-cta-text">
      Everything I build is free and open-source. Your support keeps servers running, 
      projects maintained, and new tools getting built.
    </p>
  {/if}

  <ul class="support-cta-links">
    {#each supportLinks as link (link.url)}
      <li>
        <a href={link.url} rel="noopener noreferrer">
          <span class="support-link-name">{link.name}</span>
          {#if link.description}
            <span class="support-link-meta">{link.description}<ArrowUpRight /></span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</div>

<style>
  .support-cta {
    position: relative;
    background: var(--paper);
    border: var(--edge) solid var(--ink);
    padding: var(--space-lg);
    margin-block: var(--space-lg);
  }

  .support-cta--compact {
    padding: var(--space-md);
    margin-block: var(--space-md);
  }

  .support-cta-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
  }

  .support-cta-title {
    font-size: var(--text-xl);
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }

  .support-cta-text {
    margin: 0 0 var(--space-md);
    color: var(--ink);
    font-size: var(--text-md);
    line-height: 1.6;
  }

  .support-cta-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
  }

  .support-cta-links a {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    background: var(--riso-a);
    color: var(--on-ink);
    padding: var(--space-xs) var(--space-sm);
    border-radius: 0;
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: 500;
    transition: background-color var(--ease) var(--fast);
  }

  .support-cta-links a:hover {
    background: var(--riso-b);
  }

  .support-link-name {
    font-weight: 600;
  }

  .support-link-meta {
    font-size: 0.85em;
    opacity: 0.85;
    display: inline-flex;
    align-items: center;
    gap: 0.25ch;
  }

  @media (max-width: 40rem) {
    .support-cta-links {
      flex-direction: column;
      gap: var(--space-sm);
    }

    .support-cta-links a {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
