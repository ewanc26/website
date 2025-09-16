/**
 * KaTeX CSS is already loaded via main CSS import
 * This utility just provides helper functions for math detection
 */

export async function loadKaTeX(): Promise<void> {
  // KaTeX CSS is already loaded via CSS import, so this is a no-op
  return Promise.resolve();
}

export function isKaTeXLoaded(): boolean {
  // Always return true since KaTeX CSS is loaded with the main stylesheet
  return true;
}

/**
 * Check if content contains math expressions
 * (KaTeX CSS is already loaded, so this is mainly for analytics/debugging)
 */
export async function loadKaTeXIfNeeded(content: string): Promise<void> {
  // Simple regex to detect potential math content
  const mathPatterns = [
    /\$\$[\s\S]*?\$\$/, // Display math
    /\$[^$\n]*\$/, // Inline math
    /\\\([\s\S]*?\\\)/, // LaTeX inline
    /\\\[[\s\S]*?\\\]/, // LaTeX display
    /\\begin\{.*?\}[\s\S]*?\\end\{.*?\}/, // LaTeX environments
  ];
  
  const hasMath = mathPatterns.some(pattern => pattern.test(content));
  
  if (hasMath) {
    // CSS is already loaded, but you could add analytics here
    console.debug('Math content detected');
  }
  
  return Promise.resolve();
}

/**
 * Utility function to detect if content contains math expressions
 */
export function containsMath(content: string): boolean {
  const mathPatterns = [
    /\$\$[\s\S]*?\$\$/, // Display math
    /\$[^$\n]*\$/, // Inline math
    /\\\([\s\S]*?\\\)/, // LaTeX inline
    /\\\[[\s\S]*?\\\]/, // LaTeX display
    /\\begin\{.*?\}[\s\S]*?\\end\{.*?\}/, // LaTeX environments
  ];
  
  return mathPatterns.some(pattern => pattern.test(content));
}