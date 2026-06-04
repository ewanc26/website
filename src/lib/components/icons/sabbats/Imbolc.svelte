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
  <path d="M9 21h6" />
  <path d="M12 21v-9a3 3 0 0 1 3-3" />
  <path d="M12 21v-9a3 3 0 0 0-3-3" />
  <path d="M12 7V3" />
</svg>
