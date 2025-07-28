<script lang="ts">
  import Navigation from "./Navigation.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";

  export let isHomePage: boolean;
  export let isBlogIndex: boolean;
</script>

<header class="flex items-center justify-between box-border my-6">
  <Navigation {isHomePage} {isBlogIndex} />
  <ThemeToggle />
</header>