<script lang="ts">
  import svg from '$lib/assets/pagan/wheel/samhain.svg?raw';
  let { size = 24, strokeWidth = 2, ...props } = $props();
</script>

<div 
  style="width: {size}px; height: {size}px; display: inline-flex;"
  class="icon-wrapper"
  {...props}
>
  {@html svg.replace('<svg', `<svg width="${size}" height="${size}" stroke-width="${strokeWidth}"`)}
</div>
