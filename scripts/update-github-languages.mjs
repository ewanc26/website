// Writes src/lib/data/github-languages.json: exact language bytes across the
// user's non-fork repositories (GraphQL, paginated). Needs GITHUB_TOKEN, which
// Actions provides automatically.
import { writeFile } from "node:fs/promises";
import { fetchGitHubLanguages } from "../src/lib/services/github.ts";

const username = process.env.GITHUB_USERNAME || "ewanc26";
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error("GITHUB_TOKEN is required");

const languages = await fetchGitHubLanguages(username, fetch, token);
if (languages.length === 0) throw new Error("No languages returned; leaving snapshot untouched");

const out = new URL("../src/lib/data/github-languages.json", import.meta.url);
await writeFile(out, JSON.stringify({ username, updatedAt: new Date().toISOString().slice(0, 10), languages }, null, 2) + "\n");
console.log(`Wrote ${languages.length} languages for ${username}`);
