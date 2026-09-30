<script lang="ts">
  interface Props {
    plaintext: string;
    language?: string;
  }
  let { plaintext, language }: Props = $props();
</script>

<pre class="leaflet-code"><code class={language ? `language-${language}` : undefined}>{plaintext}</code></pre>
