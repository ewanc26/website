// Crawls the running site: every internal link must resolve, and each page is scanned with axe.
// Usage: node scripts/audit-site.mjs http://localhost:4321
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const base = (process.argv[2] ?? "http://localhost:4321").replace(/\/$/, "");
const seeds = [
  "/",
  "/about",
  "/blog",
  "/now",
  "/support",
  "/subscriptions",
  "/site/meta",
  "/site/design",
];
// Pages backed by a specific PDS record; they legitimately 404 under CI's placeholder DID.
const dataBacked = new Set(["/about/name"]);
const seen = new Map();
const queue = [...seeds];
const broken = [];
let postsChecked = 0;
const violations = [];

const browser = await chromium.launch(
  process.env.AUDIT_CHANNEL ? { channel: process.env.AUDIT_CHANNEL } : {},
);
const page = await (
  await browser.newContext({ reducedMotion: "reduce" })
).newPage();

while (queue.length && seen.size < 60) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  if (/^\/blog\/\d{4}\//.test(path) && postsChecked++ >= 3) continue;
  const probe = await page.request.get(base + path);
  seen.set(path, probe.status());
  if (probe.status() >= 400) {
    if (dataBacked.has(path)) continue;
    broken.push(`${path} -> ${probe.status()}`);
    continue;
  }
  if (!(probe.headers()["content-type"] ?? "").includes("text/html")) continue;
  await page.goto(base + path, { waitUntil: "networkidle" });
  let results;
  for (let attempt = 0; attempt < 3 && !results; attempt++) {
    try {
      results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
    } catch {
      await page.waitForLoadState("networkidle");
    }
  }
  if (!results) {
    broken.push(`${path} -> axe could not run`);
    continue;
  }
  for (const v of results.violations)
    violations.push(`${path}: ${v.id} (${v.impact}) x${v.nodes.length}`);

  const hrefs = await page.$$eval("a[href]", (as) =>
    as.map((a) => a.getAttribute("href")),
  );
  for (const h of hrefs) {
    if (!h || !h.startsWith("/") || h.startsWith("//")) continue;
    const clean = h.split("#")[0].split("?")[0];
    if (clean && !seen.has(clean) && !queue.includes(clean)) queue.push(clean);
  }
}
await browser.close();

console.log(`Checked ${seen.size} pages`);
if (broken.length)
  console.error("Broken internal links:\n" + broken.join("\n"));
if (violations.length)
  console.error("Accessibility violations:\n" + violations.join("\n"));
process.exit(broken.length || violations.length ? 1 : 0);
