<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { wolfMode } from "$lib/stores/wolfMode";
  import FooterToggleButton from "./FooterToggleButton.svelte";

  afterNavigate(() => {
    if (wolfMode.get()) wolfMode.enable();
  });

  const label = $derived($wolfMode ? "Disable wolf mode" : "Enable wolf mode");
  const text = $derived($wolfMode ? "normal" : "awoo");
</script>

<FooterToggleButton {label} pressed={$wolfMode} onClick={() => wolfMode.toggle()} {text} />
