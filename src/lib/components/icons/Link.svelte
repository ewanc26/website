<script lang="ts">
  import { Link2 } from "@lucide/svelte";

  interface Props {
    size?: number | string;
    class?: string;
  }
  let { size = "1em", class: className = "" }: Props = $props();
</script>

<Link2 {size} class={`ui-icon ${className}`.trim()} aria-hidden="true" />
