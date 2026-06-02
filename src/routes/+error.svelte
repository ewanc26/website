<script lang="ts">
  import { page } from '$app/stores';
  import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
</script>

<main class="shell-wide">
  <ErrorDisplay
    status={$page.status}
    title={$page.error?.message}
    message={$page.error?.message}
    details={$page.error?.stack}
  />
</main>

<style>
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 120px);
  }
</style>
