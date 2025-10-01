/**
 * Extracts plain text from HTML content and limits by word count.
 *
 * @param html - The HTML string to strip down
 * @param maxWords - Maximum number of words in the result
 * @returns Clean plain text excerpt
 */
export function extractTextFromHTML(html: string, maxWords: number = 200): string {
  if (!html) return '';

  // SSR fallback: regex-based stripping
  if (typeof document === 'undefined') {
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = text.split(/\s+/);
    if (words.length <= maxWords) {
      return text;
    }
    return words.slice(0, maxWords).join(' ') + '...';
  }

  // Browser environment: use DOM parsing
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove script and style elements
  const scripts = temp.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());

  // Get text content
  let text = temp.textContent || temp.innerText || '';

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Split into words and truncate
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }

  return words.slice(0, maxWords).join(' ') + '...';
}

