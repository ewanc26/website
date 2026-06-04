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
  <circle cx="12" cy="12" r="4" />
  <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
  <path d="m19.07 4.93-1.41 1.41M19.07 19.07-1.41-1.41M4.93 19.07 1.41-1.41M4.93 4.93 1.41-1.41" />
</svg>
