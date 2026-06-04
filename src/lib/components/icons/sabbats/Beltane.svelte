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
  <path d="M12 2v20" />
  <path d="M12 5l7 3" />
  <path d="M12 5l-7 3" />
  <path d="M12 10l7 3" />
  <path d="M12 10l-7 3" />
  <path d="M12 15l7 3" />
  <path d="M12 15l-7 3" />
</svg>
