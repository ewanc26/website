<script lang="ts">
  // Import the Lucide icon component
  import { ExternalLink } from '@lucide/svelte';

  interface Props {
    url: string;
    title: string;
    emoji?: string;
    description?: string;
    badges?: { text: string; color?: 'mint' | 'sage' }[];
    variant?: 'default' | 'button';
  }

  let { url, title, emoji, description, badges, variant = 'default' }: Props = $props();

  function getDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  const displayDescription = description || getDomain(url);
</script>

<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  class="
    {variant === 'button'
      ? 'inline-flex items-center justify-center gap-2 rounded-lg bg-canvas-200 px-4 py-3 font-medium text-ink-900 transition-colors duration-200 hover:bg-canvas-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600 dark:bg-canvas-800 dark:text-ink-50 dark:hover:bg-canvas-700'
      : 'flex items-center gap-2 rounded-lg bg-canvas-200 p-3 transition-colors hover:bg-canvas-300 dark:bg-canvas-800 dark:hover:bg-canvas-700'}
  "
>
  {#if variant === 'button'}
    <span class="font-medium">{title}</span>
    <ExternalLink class="h-4 w-4 flex-shrink-0" aria-hidden="true" />
  {:else}
  <div class="flex-1">
    <div class="flex items-center gap-2">
      {#if emoji}
        <span class="text-lg leading-none">{emoji}</span>
      {/if}
      {#if badges && badges.length > 0}
        {#each badges as badge}
          {#if badge.color === 'mint'}
            <span class="rounded bg-mint-100 px-2 py-0.5 text-xs font-medium text-mint-800 dark:bg-mint-900 dark:text-mint-200">
              {badge.text}
            </span>
          {:else if badge.color === 'sage'}
            <span class="rounded bg-sage-100 px-2 py-0.5 text-xs font-medium text-sage-800 dark:bg-sage-900 dark:text-sage-200">
              {badge.text}
            </span>
          {:else}
            <span class="text-xs font-semibold uppercase text-ink-800 dark:text-ink-100">
              {badge.text}
            </span>
          {/if}
        {/each}
      {/if}
      <span class="font-medium text-ink-900 dark:text-ink-50">{title}</span>
    </div>
    {#if displayDescription}
      <p class="mt-1 text-sm font-medium text-ink-700 dark:text-ink-200">{displayDescription}</p>
    {/if}
  </div>
  <ExternalLink class="h-4 w-4 flex-shrink-0 text-ink-700 dark:text-ink-200" aria-hidden="true" />
  {/if}
</a>