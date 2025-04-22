<script lang="ts">
  import { CommentSection } from "bluesky-comments-svelte";
  import { PUBLIC_HANDLE } from "$env/static/public";
  import type { Post } from "$lib/parser.ts";

  export let post: Post;
</script>

<hr class="my-6 border-[var(--button-bg)]" />
<article class="prose dark:prose-invert mx-auto text-center">
  {@html post.content}
</article>
<hr class="my-6 border-[var(--button-bg)]" />
<div class="comments-section">
  <CommentSection author={PUBLIC_HANDLE} />
</div>