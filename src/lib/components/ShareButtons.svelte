<script lang="ts">
  import { Link2, Check, Mail } from "@lucide/svelte";
  import Bluesky from "$lib/components/icons/Bluesky.svelte";
  import { pulseAmbiance } from "$lib/stores/ambiance";

  interface Props {
    url: string;
    title: string;
  }
  let { url, title }: Props = $props();

  const emailSubject = $derived(`Check out this post: ${title}`);
  const emailBody = $derived(`I thought you might find this interesting:

Title: ${title}
URL: ${url}

---
Sent from my website.`);
  const mailtoLink = $derived(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  const bskyLink = $derived(`https://bsky.app/intent/compose?text=${encodeURIComponent(`${title}\n\n${url}`)}`);

  let copied = $state(false);
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  async function handleCopy() {
    // navigator.clipboard is undefined outside secure contexts and writeText() rejects on denial.
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      return;
    }
    copied = true;
    pulseAmbiance();
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => (copied = false), 2000);
  }
</script>

<div class="share-bar">
  <a href={bskyLink} target="_blank" rel="noopener" class="share-link">
    <Bluesky size={16} /> Bluesky
  </a>
  <button type="button" class="share-btn" class:share-btn--copied={copied} aria-live="polite" onclick={handleCopy}>
    {#if !copied}
      <span class="share-idle"><Link2 size={16} /> Copy link</span>
    {:else}
      <span class="share-done"><Check size={16} /> Copied</span>
    {/if}
  </button>
  <a href={mailtoLink} class="share-link">
    <Mail size={16} /> Email
  </a>
</div>

<style>
  .share-idle,
  .share-done {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
