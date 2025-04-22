<script lang="ts">
  const { title, subtitle, value, url } = $props();
</script>

<div class="post-card">
  <a href={url} target="_blank">
    <div class="flex flex-col h-[110px] justify-between">
      <p class="text-link leading-[1.5] pb-2 title-truncate font-medium">{title}</p>
      <div>
        <p class="text-muted text-sm">{subtitle}:</p>
        <p class="object-bottom text-primary">{value}</p>
      </div>
    </div>
  </a>
</div>