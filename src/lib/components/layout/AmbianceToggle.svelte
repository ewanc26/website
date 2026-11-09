<script lang="ts">
  import { Volume2, VolumeX } from "@lucide/svelte";
  import { ambianceEnabled } from "$lib/stores/ambiance";
  import FooterToggleButton from "./FooterToggleButton.svelte";

  const label = $derived($ambianceEnabled ? "Mute background ambiance" : "Play background ambiance");
  const icon = $derived($ambianceEnabled ? Volume2 : VolumeX);
</script>

<FooterToggleButton {label} pressed={$ambianceEnabled} onClick={() => ambianceEnabled.toggle()} icon={icon} />

<style>
  .footer-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
</style>
