/**
 * Dynamic KaTeX CSS loader for math content
 * Only loads KaTeX styles when needed, improving initial page load performance
 */

let katexLoaded = false;

export async function loadKaTeX(): Promise<void> {
  if (katexLoaded) return;
  
  try {
    // Check if KaTeX CSS is already loaded
    if (document.querySelector('link[href*="katex"]')) {
      katexLoaded = true;
      return;
    }
    
    // Dynamically load KaTeX CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
    link.crossOrigin = 'anonymous';
    
    // Add loading promise
    const loadPromise = new Promise<void>((resolve, reject) => {
      link.onload = () => {
        katexLoaded = true;
        resolve();
      };
      link.onerror = () => reject(new Error('Failed to load KaTeX CSS'));
    });
    
    // Append to head
    document.head.appendChild(link);
    
    // Wait for load to complete
    await loadPromise;
  } catch (error) {
    console.warn('Failed to load KaTeX CSS:', error);
    // Fallback: try to load from a different CDN or local file
  }
}

export function isKaTeXLoaded(): boolean {
  return katexLoaded;
}

/**
 * Check if content contains math expressions and load KaTeX if needed
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
    await loadKaTeX();
  }
}
