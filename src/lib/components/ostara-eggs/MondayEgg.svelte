<script lang="ts">
  // Easter egg #4 — Mōnandæg (Moon's day). On Mondays, <body> gets `is-moon-day`
  // so the nav triskele goes silver. Local timezone; re-applied after each
  // client-side navigation since SvelteKit swaps page content, not <body> itself
  // — but this stays correct regardless since it only depends on the date.
  import { afterNavigate } from "$app/navigation";

  function apply() {
    document.body.classList.toggle("is-moon-day", new Date().getDay() === 1);
  }

  // afterNavigate also fires once on initial mount, covering first load.
  afterNavigate(apply);
</script>

<style>
  /*
   * Monday: Mōnandæg — Moon's day.
   * The nav triskele shifts to silver. Subtle. For those who notice.
   * "She's there — look up."
   */
  :global(body.is-moon-day .nav-brand) {
    color: oklch(72% 0.025 245);
    transition: color 1.5s ease;
  }

  :global(body.is-moon-day .nav-brand svg) {
    filter: drop-shadow(0 0 5px oklch(80% 0.035 245 / 0.5));
    transition: filter 1.5s ease;
  }
</style>
