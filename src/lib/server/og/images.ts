import { dev } from '$app/environment';

async function loadFallbackSvg(fileName: string, baseUrl?: string): Promise<string> {
  if (dev) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(`static/fallback/${fileName}`);
    const svg = await fs.readFile(filePath, 'utf-8');
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  } else {
    const url = `${baseUrl || ''}/fallback/${fileName}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch fallback SVG: ${res.status} ${res.statusText}`);
    const svgText = await res.text();
    return `data:image/svg+xml;base64,${Buffer.from(svgText).toString('base64')}`;
  }
}

export async function resolveImageSrc(
  src: string | undefined | null,
  fallbackFileName: string,
  baseUrl?: string
): Promise<string> {
  if (!src) {
    return await loadFallbackSvg(fallbackFileName, baseUrl);
  }

  const trimmed = src.trim();
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  if (dev) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const rel = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    const filePath = path.resolve(`static/${rel}`);
    const svg = await fs.readFile(filePath);
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  } else {
    const url = `${baseUrl || ''}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image ${url}: ${res.status}`);
    const text = await res.text();
    return `data:image/svg+xml;base64,${Buffer.from(text).toString('base64')}`;
  }
}
