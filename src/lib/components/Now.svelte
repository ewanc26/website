<script lang="ts">
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
            {new Date(kibunStatus.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
    </div>
{/if}
