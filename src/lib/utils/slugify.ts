export function normalizeSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphen
        .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
}
