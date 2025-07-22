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
  <path d="M20.71 4.04a1 1 0 0 1 .02 1.39l-9.6 9.6c-.1.1-.21.18-.33.24l-3.76 1.25a1 1 0 0 1-1.27-1.27l1.25-3.76c.06-.12.14-.23.24-.33l9.6-9.6a1 1 0 0 1 1.41.02z" />
  <path d="M14 7l3 3" />
  <path d="M5 16l-2 4 4-2z" />
</svg>