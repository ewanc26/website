import { dev } from '$app/environment';

const FONT_BASE_URL = '/fonts/ArrowType-Recursive-1.085/Recursive_Desktop/separate_statics/TTF';
const FONT_FILES = {
  regular: 'RecursiveSansCslSt-Regular.ttf',
  bold: 'RecursiveSansCslSt-Bold.ttf',
  italic: 'RecursiveSansCslSt-Italic.ttf',
};

let fontCache: { regular?: Buffer; bold?: Buffer; italic?: Buffer } = {};

async function loadSingleFont(fileName: string, baseUrl?: string): Promise<Buffer> {
  if (dev) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const fontPath = path.resolve(`static${FONT_BASE_URL}/${fileName}`);
    return await fs.readFile(fontPath);
  } else {
    const fontUrl = `${baseUrl || ''}${FONT_BASE_URL}/${fileName}`;
    const res = await fetch(fontUrl);
    if (!res.ok) throw new Error(`Failed to fetch font: ${res.status} ${res.statusText}`);
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  }
}

export async function loadFonts(baseUrl?: string) {
  if (!fontCache.regular) fontCache.regular = await loadSingleFont(FONT_FILES.regular, baseUrl);
  if (!fontCache.bold) fontCache.bold = await loadSingleFont(FONT_FILES.bold, baseUrl);
  if (!fontCache.italic) fontCache.italic = await loadSingleFont(FONT_FILES.italic, baseUrl);

  if (!fontCache.regular || !fontCache.bold || !fontCache.italic) {
    throw new Error('Failed to load required fonts');
  }
  return fontCache as { regular: Buffer; bold: Buffer; italic: Buffer };
}
