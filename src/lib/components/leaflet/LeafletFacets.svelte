<script lang="ts">
  import type { FacetSchema } from "#lib/providers/facets.js";
  import { renderFacets, type SerialisedFacet } from "#lib/utils/leafletFacets.js";

  interface Props {
    plaintext: string;
    facets?: SerialisedFacet[];
    schema: FacetSchema;
    footnoteNumbers?: Record<string, number>;
  }
  let { plaintext, facets, schema, footnoteNumbers = {} }: Props = $props();
  const html = $derived(renderFacets(plaintext, facets, schema, footnoteNumbers));
</script>

{@html html}

<style>
  :global(.leaflet-footnote-ref) {
    margin-inline: 0.08em;
    font-size: 0.72em;
    line-height: 0;
    vertical-align: super;
  }

  :global(.leaflet-footnote-ref a) {
    text-decoration: none;
  }
</style>
