<script lang="ts">
  /**
   * Now — displays the author's current Kibun status.
   * Shows emoji + text + date in a subtle card. When no status
   * is set, collapses silently.
   */
  import type { KibunStatusData } from '$lib/services/atproto/types';

  let { kibunStatus }: { kibunStatus: KibunStatusData | null } = $props();
</script>

{#if kibunStatus}
    <div class="now-card">
        <div class="now-header">
            <span class="now-label">Current Status</span>
        </div>
        <div class="now-body">
            <div class="now-emoji">{kibunStatus.emoji}</div>
            <p class="now-text">{kibunStatus.text}</p>
        </div>
        <div class="now-date">
            {new Date(kibunStatus.createdAt).toLocaleDateString('en-gb', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
    </div>
{/if}
