import { dev } from '$app/environment';
import { createFileDebugger } from '../utils/debug.js';

const debug = createFileDebugger('ogImageImpl.ts');

// Font URLs for production (served from static folder)
const FONT_BASE_URL = '/fonts/ArrowType-Recursive-1.085/Recursive_Desktop/separate_statics/TTF';
const FONT_FILES = {
  regular: 'RecursiveSansCslSt-Regular.ttf',
  bold: 'RecursiveSansCslSt-Bold.ttf',
  italic: 'RecursiveSansCslSt-Italic.ttf'
};

// Preload fonts (cache in memory for performance)
let fontCache: { regular?: Buffer; bold?: Buffer; italic?: Buffer } = {};

async function loadSingleFont(fileName: string, baseUrl?: string): Promise<Buffer> {
  debug.enter('loadSingleFont', { fileName, baseUrl: baseUrl || 'none' });
  
  try {
    if (dev) {
      // In development, try to load from filesystem first
      debug.debug('Loading font from filesystem in development mode');
      const fs = await import('fs/promises');
      const path = await import('path');
      const fontPath = path.resolve(`static${FONT_BASE_URL}/${fileName}`);
      
      debug.debug('Font filesystem path resolved', { fontPath });
      console.log(`Loading font from filesystem: ${fontPath}`);
      
      const fontBuffer = await fs.readFile(fontPath);
      debug.debug('Font loaded successfully from filesystem', { 
        fileName, 
        bufferLength: fontBuffer.length 
      });
      
      debug.exit('loadSingleFont', { 
        success: true, 
        source: 'filesystem',
        bufferLength: fontBuffer.length 
      });
      
      return fontBuffer;
    } else {
      // In production, fetch from the served static files
      debug.debug('Loading font from URL in production mode');
      const fontUrl = `${baseUrl || ''}${FONT_BASE_URL}/${fileName}`;
      
      debug.debug('Font URL constructed', { fontUrl });
      console.log(`Fetching font from URL: ${fontUrl}`);
      
      const response = await fetch(fontUrl);
      if (!response.ok) {
        const error = new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
        debug.error('Font fetch failed', { 
          fileName, 
          fontUrl, 
          status: response.status, 
          statusText: response.statusText 
        });
        throw error;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const fontBuffer = Buffer.from(arrayBuffer);
      
      debug.debug('Font loaded successfully from URL', { 
        fileName, 
        fontUrl,
        arrayBufferLength: arrayBuffer.byteLength,
        bufferLength: fontBuffer.length 
      });
      
      debug.exit('loadSingleFont', { 
        success: true, 
        source: 'url',
        bufferLength: fontBuffer.length 
      });
      
      return fontBuffer;
    }
  } catch (error) {
    debug.errorWithContext(`Failed to load font ${fileName}`, error as Error, {
      function: 'loadSingleFont',
      fileName,
      baseUrl,
      dev
    });
    
    debug.exit('loadSingleFont', { 
      success: false, 
      fileName, 
      error: error 
    });
    
    throw error;
  }
}

async function loadFonts(baseUrl?: string) {
  debug.enter('loadFonts', { baseUrl: baseUrl || 'none' });
  const timer = debug.time('loadFonts');
  
  try {
    debug.info('Starting font loading process', {
      baseUrl,
      cacheStatus: {
        regular: !!fontCache.regular,
        bold: !!fontCache.bold,
        italic: !!fontCache.italic
      }
    });
    
    // Load fonts if not already cached
    if (!fontCache.regular) {
      debug.debug('Loading regular font');
      fontCache.regular = await loadSingleFont(FONT_FILES.regular, baseUrl);
    } else {
      debug.debug('Regular font already cached');
    }
    
    if (!fontCache.bold) {
      debug.debug('Loading bold font');
      fontCache.bold = await loadSingleFont(FONT_FILES.bold, baseUrl);
    } else {
      debug.debug('Bold font already cached');
    }
    
    if (!fontCache.italic) {
      debug.debug('Loading italic font');
      fontCache.italic = await loadSingleFont(FONT_FILES.italic, baseUrl);
    } else {
      debug.debug('Italic font already cached');
    }

    // Defensive: throw if any font is missing
    if (!fontCache.regular || !fontCache.bold || !fontCache.italic) {
      const error = new Error('Failed to load all required font files for OG image');
      debug.error('Font validation failed', {
        regular: !!fontCache.regular,
        bold: !!fontCache.bold,
        italic: !!fontCache.italic
      });
      throw error;
    }
    
    debug.info('All fonts loaded successfully', {
      regularLength: fontCache.regular?.length,
      boldLength: fontCache.bold?.length,
      italicLength: fontCache.italic?.length
    });
    
    timer();
    debug.exit('loadFonts', { 
      success: true, 
      fontCount: 3,
      totalSize: (fontCache.regular?.length || 0) + (fontCache.bold?.length || 0) + (fontCache.italic?.length || 0)
    });
    
    return fontCache as { regular: Buffer; bold: Buffer; italic: Buffer };
  } catch (error) {
    debug.errorWithContext('Font loading error', error as Error, {
      function: 'loadFonts',
      baseUrl
    });
    
    timer();
    debug.exit('loadFonts', { 
      success: false, 
      error: error 
    });
    
    throw error;
  }
}

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
 * Calculate optimal font size based on text length and available space
 */
function calculateTitleFontSize(title: string, maxWidth: number = 1000): number {
  debug.enter('calculateTitleFontSize', { titleLength: title.length, maxWidth });
  
  const baseSize = 64;
  const charThreshold = 45;
  const minSize = 36;
  
  let fontSize: number;
  
  if (title.length <= charThreshold) {
    fontSize = baseSize;
    debug.debug('Title within threshold, using base size', { 
      titleLength: title.length, 
      charThreshold, 
      fontSize 
    });
  } else {
    const scaleFactor = Math.max(0.5, 1 - ((title.length - charThreshold) * 0.012));
    fontSize = Math.max(minSize, Math.floor(baseSize * scaleFactor));
    debug.debug('Title exceeds threshold, calculating scaled size', { 
      titleLength: title.length, 
      charThreshold, 
      scaleFactor, 
      fontSize 
    });
  }
  
  debug.exit('calculateTitleFontSize', { 
    success: true, 
    titleLength: title.length,
    fontSize 
  });
  
  return fontSize;
}

/**
 * Calculate subtitle font size based on title size
 */
function calculateSubtitleFontSize(subtitle: string, titleSize: number): number {
  debug.enter('calculateSubtitleFontSize', { subtitleLength: subtitle.length, titleSize });
  
  const baseRatio = 0.6;
  const minSize = 24;
  const maxSize = 48;
  
  const calculatedSize = Math.floor(titleSize * baseRatio);
  const fontSize = Math.max(minSize, Math.min(maxSize, calculatedSize));
  
  debug.debug('Subtitle font size calculated', { 
    subtitleLength: subtitle.length,
    titleSize,
    baseRatio,
    calculatedSize,
    fontSize,
    constrained: fontSize !== calculatedSize
  });
  
  debug.exit('calculateSubtitleFontSize', { 
    success: true, 
    fontSize 
  });
  
  return fontSize;
}

/**
 * Estimate content height for proper vertical centering
 */
function estimateContentHeight(options: OgImageOptions): {
  titleHeight: number;
  subtitleHeight: number;
  metaHeight: number;
  authorHeight: number;
  totalContentHeight: number;
} {
  debug.enter('estimateContentHeight', { 
    title: options.title?.substring(0, 30),
    hasSubtitle: !!options.subtitle,
    hasMeta: !!(options.metaLine || options.extraMeta?.length),
    hasAuthor: !!options.author
  });
  
  const titleSize = calculateTitleFontSize(options.title);
  const titleHeight = titleSize * 1.2; // Line height factor
  
  let subtitleHeight = 0;
  if (options.subtitle) {
    const subtitleSize = calculateSubtitleFontSize(options.subtitle, titleSize);
    subtitleHeight = subtitleSize * 1.3 + 16; // Line height + margin
  }
  
  let metaHeight = 0;
  if (options.metaLine || options.extraMeta?.length) {
    metaHeight = 32 + 8; // Base height + margin
  }
  
  let authorHeight = 0;
  if (options.author) {
    authorHeight = 80 + 24; // Avatar + name + margins
  }
  
  const totalContentHeight = titleHeight + subtitleHeight + metaHeight + authorHeight;
  
  debug.debug('Content height estimation completed', {
    titleSize,
    titleHeight,
    subtitleHeight,
    metaHeight,
    authorHeight,
    totalContentHeight
  });
  
  debug.exit('estimateContentHeight', { 
    success: true, 
    totalContentHeight 
  });
  
  return {
    titleHeight,
    subtitleHeight,
    metaHeight,
    authorHeight,
    totalContentHeight
  };
}

/**
 * Generate OG image with dynamic sizing and layout
 * @param options OgImageOptions
 * @param baseUrl Optional base URL for font loading
 * @returns Promise<Buffer> PNG image buffer
 */
export async function generateOgImageImpl(options: OgImageOptions, baseUrl?: string): Promise<Buffer> {
  debug.enter('generateOgImageImpl', { 
    title: options.title?.substring(0, 50) + (options.title?.length > 50 ? '...' : ''),
    hasSubtitle: !!options.subtitle,
    hasAuthor: !!options.author,
    baseUrl: baseUrl || 'none'
  });
  
  const totalTimer = debug.time('generateOgImageImpl');
  
  try {
    debug.info('Starting OG image implementation', {
      titleLength: options.title?.length,
      subtitleLength: options.subtitle?.length,
      extraMetaCount: options.extraMeta?.length || 0
    });
    
    // Load dependencies only when this function is called
    debug.debug('Loading external dependencies');
    const depTimer = debug.time('loadDependencies');
    
    const [satori, { Resvg }] = await Promise.all([
      import('satori').then(module => {
        debug.debug('Satori module loaded', { hasDefault: !!module.default });
        return module.default;
      }),
      import('@resvg/resvg-js').then(module => {
        debug.debug('Resvg module loaded', { hasResvg: !!module.Resvg });
        return module;
      })
    ]);
    
    depTimer();
    debug.info('External dependencies loaded successfully');

    // Load fonts
    debug.debug('Loading fonts');
    const fonts = await loadFonts(baseUrl);
    
    // Calculate layout
    debug.debug('Calculating content layout');
    const contentHeight = estimateContentHeight(options);
    
    // Calculate vertical positioning for centering
    const totalHeight = 630;
    const startY = Math.max(80, (totalHeight - contentHeight.totalContentHeight) / 2);
    
    debug.debug('Layout calculations completed', {
      totalHeight,
      contentHeight: contentHeight.totalContentHeight,
      startY
    });
    
    // Build the main container with dynamic positioning
    debug.debug('Building SVG container structure');
    const mainContainer = {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f1a0f',
          color: '#e8f5e8',
          fontFamily: 'Recursive',
          padding: '80px',
          boxSizing: 'border-box',
          position: 'relative',
        },
        children: [
          // Title
          {
            type: 'h1',
            props: {
              style: {
                fontSize: `${calculateTitleFontSize(options.title)}px`,
                fontWeight: 700,
                lineHeight: 1.1,
                margin: '0 0 16px 0',
                textAlign: 'center',
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              },
              children: options.title,
            },
          },
          // Subtitle
          options.subtitle && {
            type: 'h2',
            props: {
              style: {
                fontSize: `${calculateSubtitleFontSize(options.subtitle, calculateTitleFontSize(options.title))}px`,
                fontWeight: 400,
                lineHeight: 1.3,
                margin: '0 0 24px 0',
                textAlign: 'center',
                color: '#8fd0a0',
                opacity: 0.9,
              },
              children: options.subtitle,
            },
          },
          // Meta information
          (options.metaLine || options.extraMeta?.length) && {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                margin: '0 0 32px 0',
                opacity: 0.8,
              },
              children: [
                options.metaLine && {
                  type: 'p',
                  props: {
                    style: {
                      fontSize: '18px',
                      margin: '0',
                      color: '#a8d5b8',
                      fontWeight: 500,
                    },
                    children: options.metaLine,
                  },
                },
                ...(options.extraMeta?.map(meta => ({
                  type: 'p',
                  props: {
                    style: {
                      fontSize: '16px',
                      margin: '0',
                      color: '#8fd0a0',
                      fontWeight: 400,
                    },
                    children: meta,
                  },
                })) || []),
              ].filter(Boolean),
            },
          },
          // Author section
          options.author && {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '18px',
                textAlign: 'center',
                opacity: 0.85,
                flexShrink: 0,
              },
              children: [
                options.author.avatar && {
                  type: 'img',
                  props: {
                    src: options.author.avatar,
                    width: 64,
                    height: 64,
                    style: {
                      borderRadius: '50%',
                      border: '3px solid #2d4839',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
                      background: '#1e2c23',
                      flexShrink: 0,
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '2px',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '22px',
                            fontWeight: 700,
                            fontStyle: 'normal',
                            lineHeight: 1.1,
                          },
                          children: options.author.name,
                        },
                      },
                      options.author.handle && {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '16px',
                            color: '#8fd0a0',
                            fontWeight: 400,
                            fontStyle: 'italic',
                          },
                          children: '@' + options.author.handle,
                        },
                      },
                    ].filter(Boolean),
                  },
                },
              ].filter(Boolean),
            },
          },
        ].filter(Boolean),
      },
    };

    debug.debug('SVG container structure built', {
      hasTitle: true,
      hasSubtitle: !!options.subtitle,
      hasMeta: !!(options.metaLine || options.extraMeta?.length),
      hasAuthor: !!options.author
    });

    // Compose SVG
    debug.debug('Composing SVG with Satori');
    const svgTimer = debug.time('satoriSvgComposition');
    
    const svg = await satori(mainContainer, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Recursive',
          data: fonts.regular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Recursive',
          data: fonts.bold,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Recursive',
          data: fonts.italic,
          weight: 400,
          style: 'italic',
        },
      ],
    });
    
    svgTimer();
    debug.debug('SVG composition completed', { svgLength: svg.length });

    // Convert SVG to PNG
    debug.debug('Converting SVG to PNG with Resvg');
    const pngTimer = debug.time('svgToPngConversion');
    
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const png = resvg.render();
    const pngBuffer = png.asPng();
    
    pngTimer();
    debug.debug('PNG conversion completed', { 
      pngBufferLength: pngBuffer.length,
      isBuffer: Buffer.isBuffer(pngBuffer)
    });

    totalTimer();
    debug.info('OG image generation completed successfully', {
      finalBufferLength: pngBuffer.length,
      isBuffer: Buffer.isBuffer(pngBuffer)
    });
    
    debug.exit('generateOgImageImpl', { 
      success: true, 
      resultType: typeof pngBuffer,
      resultLength: pngBuffer?.length 
    });
    
    return pngBuffer;
  } catch (error) {
    debug.errorWithContext('Failed to generate OG image', error as Error, {
      function: 'generateOgImageImpl',
      options: {
        title: options.title?.substring(0, 100),
        hasSubtitle: !!options.subtitle,
        hasAuthor: !!options.author
      }
    });
    
    totalTimer();
    debug.exit('generateOgImageImpl', { 
      success: false, 
      error: error 
    });
    
    throw error;
  }
}
