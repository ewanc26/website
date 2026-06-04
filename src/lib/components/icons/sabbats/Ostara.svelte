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
  <path d="M12 22C17.5 22 21 17 21 11C21 5 17.5 2 12 2C6.5 2 3 5 3 11C3 17 6.5 22 12 22Z" />
  <path d="M10 8c0-3-1-6 1-6s2 3 2 6" />
  <path d="M12 8c0-3-1-6 1-6s2 3 2 6" />
  <path d="M16 22l1-2" />
  <path d="M8 22l-1-2" />
</svg>
