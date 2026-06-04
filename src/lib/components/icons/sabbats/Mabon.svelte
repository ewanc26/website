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
  <path d="M12 22V19" />
  <path d="M12 19c3-1 5-4 5-8 0-4-3-7-5-9-2 2-5 5-5 9 0 4 2 7 5 8Z" />
  <path d="M12 15l2-2M12 12l2-2M12 9l2-2" />
  <path d="M12 15l-2-2M12 12l-2-2M12 9l-2-2" />
</svg>
