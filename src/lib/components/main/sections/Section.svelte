<script lang="ts">
  const { title, children } = $props();
</script>

<div class="mb-12 ml-4">
  <h2 class="text-2xl font-bold mb-4 ml-2">{title}</h2>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr)_)] gap-x-4 gap-y-6 mx-2 my-6">
    {@render children()}
  </div>
</div>