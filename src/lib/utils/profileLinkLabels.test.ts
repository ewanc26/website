import assert from "node:assert/strict";
import test from "node:test";
import { profileLinkLabels } from "./profileLinkLabels.ts";

test("unique hosts label as bare domains", () => {
  assert.deepEqual(
    profileLinkLabels([
      "https://ewancroft.uk",
      "https://blog.ewancroft.uk/",
      "https://signal.me/#p=ewancroft.01",
      "https://liberapay.com/ewanc26?ref=site",
    ]),
    ["ewancroft.uk", "blog.ewancroft.uk", "signal.me", "liberapay.com"],
  );
});

test("the site's own github pair disambiguates on the first segment", () => {
  assert.deepEqual(
    profileLinkLabels([
      "https://github.com/sponsors/ewanc26",
      "https://github.com/ewanc26",
    ]),
    ["github.com/sponsors", "github.com/ewanc26"],
  );
});

test("same-host collisions grow the path prefix only as far as needed", () => {
  assert.deepEqual(
    profileLinkLabels([
      "https://example.com/projects/wolfkind",
      "https://example.com/projects/wolfkind/play",
      "https://example.com/journal",
    ]),
    [
      "example.com/projects/wolfkind",
      "example.com/projects/wolfkind/play",
      "example.com/journal",
    ],
  );
});

test("disambiguation ignores trailing slashes and query strings", () => {
  assert.deepEqual(
    profileLinkLabels([
      "https://music.apple.com/profile/ewancroft/",
      "https://music.apple.com/library",
    ]),
    ["music.apple.com/profile", "music.apple.com/library"],
  );
});

test("links with the same host and path cannot be told apart", () => {
  // Degenerate but honest: identical destinations label identically.
  assert.deepEqual(
    profileLinkLabels([
      "https://ko-fi.com/ewancroft?t=one",
      "https://ko-fi.com/ewancroft",
    ]),
    ["ko-fi.com/ewancroft", "ko-fi.com/ewancroft"],
  );
});
