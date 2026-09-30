<script lang="ts">
  import { usePoller } from "$lib/utils/polling.svelte";

  const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

  async function fetchThemeCss(): Promise<string> {
    const response = await fetch("/api/theme", { cache: "no-store", headers: { accept: "text/css" } });
    if (!response.ok) throw new Error(String(response.status));
    return response.text();
  }

  const poller = usePoller(fetchThemeCss, REFRESH_INTERVAL_MS);

  $effect(() => {
    // Keep the last server-rendered palette if a background refresh fails.
    if (poller.data === undefined) return;
    let style = document.querySelector<HTMLStyleElement>("#sabbat-dynamic-theme");
    if (!style) {
      style = document.createElement("style");
      style.id = "sabbat-dynamic-theme";
      document.head.append(style);
    }
    style.textContent = poller.data;
  });
</script>
