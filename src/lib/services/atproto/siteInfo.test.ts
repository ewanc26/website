import assert from "node:assert/strict";
import test from "node:test";
import { normalizeSiteInfo } from "./siteInfo.ts";

test("normalizes the original nested additionalInfo record shape", () => {
  const info = normalizeSiteInfo({
    additionalInfo: {
      analytics: { services: [], cookiePolicy: "No analytics." },
      properties: {
        purpose: "A personal website.",
        websiteBirthYear: 2023,
        sectionLicense: [
          {
            section: "blog",
            name: "CC BY 4.0",
            url: "https://creativecommons.org/licenses/by/4.0/",
          },
        ],
      },
    },
  });

  assert.equal(info?.additionalInfo?.purpose, "A personal website.");
  assert.equal(info?.additionalInfo?.websiteBirthYear, 2023);
  assert.equal(info?.additionalInfo?.sectionLicense[0]?.section, "blog");
  assert.equal(info?.additionalInfo?.analytics?.cookiePolicy, "No analytics.");
});

test("accepts flattened additionalInfo fields", () => {
  const info = normalizeSiteInfo({
    additionalInfo: {
      purpose: "A standards-based website.",
      websiteBirthYear: 2023,
    },
  });

  assert.equal(info?.additionalInfo?.purpose, "A standards-based website.");
  assert.equal(info?.additionalInfo?.websiteBirthYear, 2023);
});

test("drops unsafe record URLs before they reach link attributes", () => {
  const info = normalizeSiteInfo({
    openSourceInfo: {
      license: { name: "Unsafe", url: "javascript:alert(1)" },
      repositories: [
        { url: "javascript:alert(1)", type: "primary" },
        { url: "https://git.croft.click/ewan/website", type: "mirror" },
      ],
    },
  });

  assert.equal(info?.openSourceInfo?.license?.url, undefined);
  assert.deepEqual(
    info?.openSourceInfo?.repositories.map((repository) => repository.url),
    ["https://git.croft.click/ewan/website"],
  );
});
