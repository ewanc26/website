import { writable } from "svelte/store";

/**
 * Extra backlink targets (e.g. a blog post's own AT-URI and canonical URL)
 * that a page wants added to the root layout's BacklinkAvatars beyond the
 * page's own ewancroft.uk URL. The Astro version passed this as a
 * backlinkTargets prop straight into Base.astro; a root layout can't
 * receive props from the page it wraps, so pages instead set this store
 * (and clear it again in their effect's cleanup) for the layout to read.
 */
export const extraBacklinkTargets = writable<string[]>([]);
