<style>
  .post-card {
    backface-visibility: hidden;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .post-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .post-title {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--link-color);
  }

  .post-details {
    font-size: 0.875rem;
    color: var(--text-color);
    opacity: 0.8;
  }
</style>

<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  export let post: any;
  export let title: string = post?.title;
  export let monthIndex: number;
  export let postIndex: number;
  export let localeLoaded: boolean;
  
  export let formatDate: (date: Date) => string;
</script>

<div 
  class="post-card"
  in:fly={{ 
    y: 15, 
    x: 0, 
    delay: 150 + monthIndex * 30 + postIndex * 50, 
    duration: 300, 
    easing: quintOut 
  }}
>
  <a href={`/blog/${post.rkey}`}>
    <div class="flex flex-col justify-between">
      <p class="post-title" title={title}>{title}</p>
      <div class="post-details">
        <p>Last Updated:</p>
        <p>
          {#if localeLoaded}
            <span transition:fade>{formatDate(post.createdAt)}</span>
          {:else}
            <span class="opacity-50">Loading...</span>
          {/if}
        </p>
        <p>{post.wordCount} words • {Math.ceil(post.wordCount / 200)} min read</p>
      </div>
    </div>
  </a>
</div>