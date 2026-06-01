<script lang="ts">
  /**
   * Render a Leaflet math block (LaTeX).
   * Displays the TeX source in a code block for now.
   * KaTeX/MathJax integration can be added later.
   */

  let { tex }: { tex: string } = $props();
</script>

<pre class="leaflet-math"><code class="language-math">{tex}</code></pre>
