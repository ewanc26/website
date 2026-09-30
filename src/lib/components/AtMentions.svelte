<script lang="ts">
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import LoadingSkeleton from "$lib/components/LoadingSkeleton.svelte";

  interface Props {
    url: string;
    aturi?: string;
    variant?: "default" | "minimal" | "full" | "mentions";
    class?: string;
  }
  let { url, aturi, variant = "default", class: className = "" }: Props = $props();

  let host: HTMLDivElement | undefined = $state();
  let mounted = false;

  async function mount() {
    if (mounted || !host) return;
    mounted = true;
    try {
      // Import registers the <atmentions-reactions> custom element.
      await import("atmentions");
    } catch {
      host.replaceChildren();
      return;
    }
    const el = document.createElement("atmentions-reactions");
    el.className = "content-reveal";
    el.setAttribute("data-url", url);
    if (aturi) el.setAttribute("data-aturi", aturi);
    el.setAttribute("variant", variant);
    host.replaceChildren(el);
  }

  onMount(mount);
  afterNavigate(() => {
    mounted = false;
    mount();
  });
</script>

<div
  bind:this={host}
  class={`atmentions-wrapper ${className}`}
  style="--atmo-fg:var(--color-ink-800);--atmo-accent:var(--color-primary-500);--atmo-muted:var(--color-ink-600)"
>
  <LoadingSkeleton label="Loading reactions" />
</div>
