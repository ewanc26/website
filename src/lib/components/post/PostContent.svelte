<script lang="ts">
  import type { Post } from "$lib/components/shared";

  export let post: Post;
</script>

<hr class="my-6 border-[var(--button-bg)]" />
<article class="prose dark:prose-invert mx-auto text-center">
  {@html post.content}
</article>
<hr class="my-6 border-[var(--button-bg)]" />
