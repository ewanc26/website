<script lang="ts">
  let { size = 24, strokeWidth = 2, ...props } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  {size}
  {size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  {strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  {...props}
>
  <path d="M12 22V2" />
  <path d="M12 6l4-2M12 6l-4-2" />
  <path d="M12 10l4-2M12 10l-4-2" />
  <path d="M12 14l4-2M12 14l-4-2" />
</svg>
