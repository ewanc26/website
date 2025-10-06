import { dev } from '$app/environment';

// Cache for loaded images
const imageCache = new Map<string, string>();

async function loadFallbackSvg(fileName: string, baseUrl?: string): Promise<string> {
  const cacheKey = `fallback:${fileName}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  const timeout = 2000; // 2 second timeout
  
  if (dev) {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.resolve(`static/fallback/${fileName}`);
    const svg = await fs.readFile(filePath, 'utf-8');
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    imageCache.set(cacheKey, dataUrl);
    return dataUrl;
  } else {
    const url = `${baseUrl || ''}/fallback/${fileName}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`Failed to fetch fallback SVG: ${res.status} ${res.statusText}`);
      const svgText = await res.text();
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svgText).toString('base64')}`;
      imageCache.set(cacheKey, dataUrl);
      return dataUrl;
    } catch (error) {
      clearTimeout(timeoutId);
      // Return a simple fallback SVG on error
      const simpleFallback = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#2d4839"/></svg>').toString('base64')}`;
      imageCache.set(cacheKey, simpleFallback);
      return simpleFallback;
    }
  }
}

export async function resolveImageSrc(
  src: string | undefined | null,
  fallbackFileName: string,
  baseUrl?: string
): Promise<string> {
  // Use cache key for external images too
  const cacheKey = src || `fallback:${fallbackFileName}`;
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  if (!src) {
    return await loadFallbackSvg(fallbackFileName, baseUrl);
  }

  const trimmed = src.trim();
  
  // Data URLs are ready to use
  if (trimmed.startsWith('data:')) {
    imageCache.set(cacheKey, trimmed);
    return trimmed;
  }
  
  // For external HTTP(S) URLs, return them directly
  // Satori will handle fetching them, but we add timeout protection
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Don't fetch external images server-side - let Satori handle it
    // Just return the URL and cache it
    imageCache.set(cacheKey, trimmed);
    return trimmed;
  }

  const timeout = 2000; // 2 second timeout

  if (dev) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const rel = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
      const filePath = path.resolve(`static/${rel}`);
      const svg = await fs.readFile(filePath);
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      imageCache.set(cacheKey, dataUrl);
      return dataUrl;
    } catch (error) {
      console.warn(`Failed to load image ${trimmed}, using fallback`, error);
      return await loadFallbackSvg(fallbackFileName, baseUrl);
    }
  } else {
    const url = `${baseUrl || ''}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`Failed to fetch image ${url}: ${res.status}`);
      const text = await res.text();
      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(text).toString('base64')}`;
      imageCache.set(cacheKey, dataUrl);
      return dataUrl;
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn(`Failed to load image ${url}, using fallback`, error);
      return await loadFallbackSvg(fallbackFileName, baseUrl);
    }
  }
}

// Clear cache (useful for testing)
export function clearImageCache() {
  imageCache.clear();
}
