<script>
  export let size = "14";
  export let fill = "none";
  export let stroke = "currentColor";
  export let strokeWidth = "2";
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  {fill}
  {stroke}
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <circle cx="12" cy="12" r="10" />
  <polyline points="12,6 12,12 16,14" />
</svg>