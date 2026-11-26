import assert from "node:assert/strict";
import test from "node:test";
import { blobRefCid } from "./blobRef.ts";

const CID = "bafkreia4dccvtbb5txj3rxtwyrgpgvovrx4znldd2ciqpt6lwjqm23tgpq";

test("reads every blob reference shape", () => {
  const instance = { toString: () => CID };
  for (const ref of [CID, { $link: CID }, { "/": CID }, instance]) {
    assert.equal(blobRefCid(ref), CID);
    assert.equal(blobRefCid({ $type: "blob", ref, mimeType: "image/png" }), CID);
  }
});

test("returns null rather than a stringified object", () => {
  for (const ref of [null, undefined, "", {}, { ref: {} }]) {
    assert.equal(blobRefCid(ref), null);
  }
});
