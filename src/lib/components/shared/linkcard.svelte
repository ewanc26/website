<script lang="ts">
  export let title: string;
  export let subtitle: string;
  export let value: string;
  export let url: string;
</script>

<div class="link-card p-4 rounded-[1em] m-2 hover:shadow-lg transition-shadow">
  <h4>{title}</h4>
  <h6 class="text-sm opacity-75">{subtitle}</h6>
  <p class="text-lg font-medium">{value}</p>
  <a href={url} class="text-link hover:underline" target="_blank" rel="noopener noreferrer">
    Visit
  </a>
</div>