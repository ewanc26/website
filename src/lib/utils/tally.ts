/**
 * Calculates the total read time for a given array of posts.
 * Assumes an average reading speed of 200 words per minute.
 * @param posts - An array of post objects, each with a 'wordCount' property.
 * @returns The total read time in minutes, rounded up.
 */
export function calculateTotalReadTime(posts: { wordCount: number }[]): number {
  return posts.reduce((total, post) => {
    return total + Math.ceil(post.wordCount / 200);
  }, 0);
}

/**
 * Calculates the total word count for a given array of posts.
 * @param posts - An array of post objects, each with a 'wordCount' property.
 * @returns The total word count.
 */
export function calculateTotalWordCount(posts: { wordCount: number }[]): number {
  return posts.reduce((total, post) => total + post.wordCount, 0);
}

/**
 * Formats a given number of minutes into a human-readable string (e.g., "2 hours", "3 days").
 * @param minutes - The total number of minutes.
 * @returns A formatted string representing the time.
 */
export function formatReadTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 60 * 24) {
    const hours = Math.round(minutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  } else if (minutes < 60 * 24 * 7) {
    const days = Math.round(minutes / (60 * 24));
    return `${days} day${days === 1 ? '' : 's'}`;
  } else {
    const weeks = Math.round(minutes / (60 * 24 * 7));
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }
}