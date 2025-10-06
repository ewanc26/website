import { dev } from '$app/environment';

const FONT_BASE_URL = '/fonts/ArrowType-Recursive-1.085/Recursive_Desktop/separate_statics/TTF';
const FONT_FILES = {
  regular: 'RecursiveSansCslSt-Regular.ttf',
  bold: 'RecursiveSansCslSt-Bold.ttf',
  italic: 'RecursiveSansCslSt-Italic.ttf',
};

// Global cache that persists across requests
let fontCache: { regular?: Buffer; bold?: Buffer; italic?: Buffer } = {};
let fontLoadPromise: Promise<{ regular: Buffer; bold: Buffer; italic: Buffer }> | null = null;

async function loadSingleFont(fileName: string, baseUrl?: string): Promise<Buffer> {
  const timeout = 3000; // 3 second timeout per font
  
  if (dev) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const fontPath = path.resolve(`static${FONT_BASE_URL}/${fileName}`);
    return await fs.readFile(fontPath);
  } else {
    const fontUrl = `${baseUrl || ''}${FONT_BASE_URL}/${fileName}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const res = await fetch(fontUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`Failed to fetch font: ${res.status} ${res.statusText}`);
      const ab = await res.arrayBuffer();
      return Buffer.from(ab);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Font fetch timeout: ${fileName}`);
      }
      throw error;
    }
  }
}

export async function loadFonts(baseUrl?: string) {
  // Return cached fonts if available
  if (fontCache.regular && fontCache.bold && fontCache.italic) {
    return fontCache as { regular: Buffer; bold: Buffer; italic: Buffer };
  }

  // If already loading, wait for that promise
  if (fontLoadPromise) {
    return fontLoadPromise;
  }

  // Start loading fonts in parallel
  fontLoadPromise = (async () => {
    try {
      const [regular, bold, italic] = await Promise.all([
        loadSingleFont(FONT_FILES.regular, baseUrl),
        loadSingleFont(FONT_FILES.bold, baseUrl),
        loadSingleFont(FONT_FILES.italic, baseUrl),
      ]);

      // Cache the fonts
      fontCache = { regular, bold, italic };

      return { regular, bold, italic };
    } catch (error) {
      // Clear the promise on error so we can retry
      fontLoadPromise = null;
      throw error;
    }
  })();

  return fontLoadPromise;
}

// Clear cache (useful for testing)
export function clearFontCache() {
  fontCache = {};
  fontLoadPromise = null;
}
