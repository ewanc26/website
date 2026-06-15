<script lang="ts">
  import { getPlaceholderAvatar } from '$lib/utils/avatar';

  interface Props {
    did: string;
    name: string;
    avatarUrl?: string;
    date: string;
    handle?: string;
  }
  let { did, name, avatarUrl, date, handle }: Props = $props();
</script>

<div class="verifier-card">
  <div class="avatar">
    <img src={avatarUrl || getPlaceholderAvatar(did)} alt={name} />
  </div>
  <div class="verifier-info">
    <span class="name">{name}</span>
    {#if handle}
      <span class="handle">@{handle}</span>
    {/if}
  </div>
</div>

<style>
  .verifier-card {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    border: 1px solid var(--surface-color);
    border-radius: var(--radius-md);
  }
  .avatar, .avatar img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }
  .verifier-info {
    display: flex;
    flex-direction: column;
  }
  .name {
    font-weight: 600;
    font-size: var(--text-sm);
  }
  .handle {
    font-size: var(--text-xs);
    color: var(--color-text-600);
  }
</style>
