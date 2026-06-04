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
  <path d="M12 2C7.03 2 3 6.03 3 11c0 3.28 2.05 6.13 5 7.42V20c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-1.58c2.95-1.29 5-4.14 5-7.42 0-4.97-4.03-9-9-9Z" />
  <path d="M9 14h.01M15 14h.01" />
</svg>
