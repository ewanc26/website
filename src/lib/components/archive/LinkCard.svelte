<script lang="ts">
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  export let title: string = "";
  export let url: string = "";
  export let value: string = "";
</script>

<div
  class="post-card"
  in:fly={{
    y: 15,
    x: 0,
    duration: 300,
    easing: quintOut,
  }}
>
  <a href={url}>
    <div class="flex flex-col h-[110px] justify-between">
      <p
        class="text-[var(--link-color)] leading-[1.5] pb-2 title-truncate font-medium"
        {title}
      >
        {title}
      </p>
      <div>
        <p class="text-[var(--text-color)] text-sm">{value}</p>
        <p class="object-bottom text-[var(--text-color)] text-sm">
          {url?.replace(/^https?:\/\//, "").split("/")[0]}
        </p>
      </div>
    </div>
  </a>
</div>
