import assert from "node:assert/strict";
import test from "node:test";
import { firstContentImageCid } from "./coverImage.ts";

const blob = (cid: string) => ({
  $type: "blob",
  ref: { $link: cid },
  mimeType: "image/jpeg",
  size: 1,
});

test("returns the first image block in reading order", () => {
  const content = {
    $type: "pub.leaflet.content",
    pages: [
      {
        blocks: [
          { block: { $type: "pub.leaflet.blocks.text", plaintext: "Hello" } },
          {
            block: {
              $type: "pub.leaflet.blocks.website",
              previewImage: blob("bafypreview"),
            },
          },
          { block: { $type: "pub.leaflet.blocks.image", image: blob("bafyfirst") } },
          { block: { $type: "pub.leaflet.blocks.image", image: blob("bafysecond") } },
        ],
      },
    ],
  };
  assert.equal(firstContentImageCid(content), "bafyfirst");
});

test("finds images inside galleries and nested pages", () => {
  const content = {
    pages: [
      { blocks: [{ block: { $type: "pub.leaflet.blocks.text", plaintext: "x" } }] },
      {
        blocks: [
          {
            block: {
              $type: "pub.leaflet.blocks.imageGallery",
              images: [{ image: blob("bafygallery") }],
            },
          },
        ],
      },
    ],
  };
  assert.equal(firstContentImageCid(content), "bafygallery");
});

test("skips non-image blobs, blob-backed pages and missing content", () => {
  assert.equal(
    firstContentImageCid({
      pages: [{ blocks: [{ block: { image: { ...blob("bafyvideo"), mimeType: "video/mp4" } } }] }],
    }),
    null,
  );
  assert.equal(
    firstContentImageCid({ blobPages: blob("bafypages"), pages: [{ blocks: [] }] }),
    null,
  );
  assert.equal(firstContentImageCid(undefined), null);
  assert.equal(firstContentImageCid({ pages: [] }), null);
});
