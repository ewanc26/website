<script lang="ts">
  /**
   * Render a Leaflet code block.
   */

  let { plaintext, language }: {
    plaintext: string;
    language?: string;
  } = $props();
</script>

<pre class="leaflet-code"><code class={language ? `language-${language}` : undefined}>{plaintext}</code></pre>
