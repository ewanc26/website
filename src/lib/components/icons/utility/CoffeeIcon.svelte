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
  <path d="M17 8h1a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4h-1" />
  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Z" />
  <line x1="6" y1="2" x2="6" y2="4" />
  <line x1="10" y1="2" x2="10" y2="4" />
  <line x1="14" y1="2" x2="14" y2="4" />
</svg>