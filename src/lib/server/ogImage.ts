import { dev } from '$app/environment';
import { createFileDebugger } from '../utils/debug.js';

const debug = createFileDebugger('ogImage.ts');

export interface OgImageOptions {
  title: string;
  subtitle?: string;
  metaLine?: string;
  author?: {
    name: string;
    handle?: string;
    avatar?: string;
  };
  // For blog posts: wordCount, readingTime, date, etc.
  extraMeta?: string[];
  // For custom layouts
  customChildren?: any;
}

/**
 * Generate OG image with dynamic sizing and layout
 * @param options OgImageOptions
 * @param baseUrl Optional base URL for font loading
 * @returns Promise<Buffer> PNG image buffer
 */
export async function generateOgImage(options: OgImageOptions, baseUrl?: string): Promise<Buffer> {
  debug.enter('generateOgImage', { 
    title: options.title?.substring(0, 50) + (options.title?.length > 50 ? '...' : ''),
    hasSubtitle: !!options.subtitle,
    hasAuthor: !!options.author,
    hasExtraMeta: !!options.extraMeta?.length,
    baseUrl: baseUrl || 'none'
  });
  
  const timer = debug.time('generateOgImage');
  
  try {
    debug.info('Starting OG image generation', {
      titleLength: options.title?.length,
      subtitleLength: options.subtitle?.length,
      authorName: options.author?.name,
      extraMetaCount: options.extraMeta?.length || 0
    });

    // Dynamically import the actual implementation to avoid build-time analysis
    debug.debug('Attempting to import OG image implementation');
    const { generateOgImageImpl } = await import('./ogImageImpl');
    
    debug.info('Successfully imported OG image implementation, calling main function');
    const result = await generateOgImageImpl(options, baseUrl);
    
    debug.info('OG image generation completed successfully', {
      resultType: typeof result,
      resultLength: result?.length,
      resultIsBuffer: Buffer.isBuffer(result)
    });
    
    timer();
    debug.exit('generateOgImage', { 
      success: true, 
      resultType: typeof result,
      resultLength: result?.length 
    });
    
    return result;
  } catch (error) {
    debug.errorWithContext('Failed to generate OG image with main implementation', error as Error, {
      function: 'generateOgImage',
      options: {
        title: options.title?.substring(0, 100),
        hasSubtitle: !!options.subtitle,
        hasAuthor: !!options.author
      }
    });
    
    debug.info('Falling back to SVG-based OG image generation');
    
    try {
      // Fallback: create a simple SVG-based OG image without external dependencies
      const fallbackSvg = createFallbackSvg(options);
      const svgBuffer = Buffer.from(fallbackSvg, 'utf-8');
      
      debug.info('Fallback SVG generation successful', {
        svgLength: fallbackSvg.length,
        bufferLength: svgBuffer.length,
        fallbackType: 'svg'
      });
      
      timer();
      debug.exit('generateOgImage', { 
        success: true, 
        fallback: true,
        resultType: 'svg',
        resultLength: svgBuffer.length 
      });
      
      // For now, return SVG as-is. In production, you might want to convert this to PNG
      // or handle the error differently
      return svgBuffer;
    } catch (fallbackError) {
      debug.errorWithContext('Fallback SVG generation also failed', fallbackError as Error, {
        function: 'generateOgImage',
        fallback: true
      });
      
      timer();
      debug.exit('generateOgImage', { 
        success: false, 
        fallback: true,
        error: fallbackError 
      });
      
      throw fallbackError;
    }
  }
}

/**
 * Create a fallback SVG-based OG image when the main generator fails
 */
function createFallbackSvg(options: OgImageOptions): string {
  debug.enter('createFallbackSvg', { 
    title: options.title?.substring(0, 30),
    hasSubtitle: !!options.subtitle 
  });
  
  try {
    const title = options.title || 'OG Image';
    const subtitle = options.subtitle || '';
    
    debug.debug('Creating fallback SVG', {
      title,
      subtitle,
      titleLength: title.length,
      subtitleLength: subtitle.length
    });
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .title { font-family: Arial, sans-serif; font-size: 48px; font-weight: bold; fill: #ffffff; }
      .subtitle { font-family: Arial, sans-serif; font-size: 24px; fill: #8fd0a0; }
    </style>
  </defs>
  <rect width="1200" height="630" fill="#0f1a0f"/>
  <text x="600" y="300" text-anchor="middle" class="title">${title}</text>
  ${subtitle ? `<text x="600" y="350" text-anchor="middle" class="subtitle">${subtitle}</text>` : ''}
</svg>`;
    
    debug.debug('Fallback SVG created successfully', {
      svgLength: svg.length,
      hasSubtitle: !!subtitle
    });
    
    debug.exit('createFallbackSvg', { 
      success: true, 
      svgLength: svg.length 
    });
    
    return svg;
  } catch (error) {
    debug.errorWithContext('Failed to create fallback SVG', error as Error, {
      function: 'createFallbackSvg'
    });
    
    debug.exit('createFallbackSvg', { 
      success: false, 
      error: error 
    });
    
    // Return a minimal error SVG if even the fallback fails
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#ff0000"/>
  <text x="600" y="315" text-anchor="middle" font-family="Arial" font-size="24" fill="white">OG Image Generation Failed</text>
</svg>`;
  }
}