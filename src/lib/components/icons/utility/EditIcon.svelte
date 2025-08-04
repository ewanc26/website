<script>
  export let size = "20";
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
  <path d="m18 2 4 4-12 12-6 2 2-6L18 2z" />
  <path d="m15 5 4 4" />
</svg>