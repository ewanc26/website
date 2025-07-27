import { defaultSchema } from "rehype-sanitize";
import type { Schema } from "./types";

// WhiteWind's own custom schema:
// https://github.com/whtwnd/whitewind-blog/blob/7eb8d4623eea617fd562b93d66a0e235323a2f9a/frontend/src/services/DocProvider.tsx#L122
export const customSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    font: [...(defaultSchema.attributes?.font ?? []), "color"],
    blockquote: [
      ...(defaultSchema.attributes?.blockquote ?? []),
      // bluesky
      "className",
      "dataBlueskyUri",
      "dataBlueskyCid",
      // instagram
      "dataInstgrmCaptioned",
      "dataInstgrmPermalink",
      "dataInstgrmVersion",
    ],
    iframe: [
      "width",
      "height",
      "title",
      "frameborder",
      "allow",
      "referrerpolicy",
      "allowfullscreen",
      "style",
      "seamless",
      ["src", /https:\/\/(www.youtube.com|bandcamp.com)\/.*/],
    ],
    section: ["dataFootnotes", "className"],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "font",
    "mark",
    "iframe",
    "section",
  ],
};