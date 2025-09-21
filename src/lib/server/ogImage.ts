import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { dev } from '$app/environment';

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
  try {
    if (dev) {
      // In development, try to load from filesystem first
      const fs = await import('fs/promises');
      const path = await import('path');
      const fontPath = path.resolve(`static${FONT_BASE_URL}/${fileName}`);
      console.log(`Loading font from filesystem: ${fontPath}`);
      return await fs.readFile(fontPath);
    } else {
      // In production, fetch from the served static files
      const fontUrl = `${baseUrl || ''}${FONT_BASE_URL}/${fileName}`;
      console.log(`Fetching font from URL: ${fontUrl}`);
      
      const response = await fetch(fontUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch (error) {
    console.error(`Failed to load font ${fileName}:`, error);
    throw error;
  }
}

async function loadFonts(baseUrl?: string) {
  try {
    // Load fonts if not already cached
    if (!fontCache.regular) {
      fontCache.regular = await loadSingleFont(FONT_FILES.regular, baseUrl);
    }
    if (!fontCache.bold) {
      fontCache.bold = await loadSingleFont(FONT_FILES.bold, baseUrl);
    }
    if (!fontCache.italic) {
      fontCache.italic = await loadSingleFont(FONT_FILES.italic, baseUrl);
    }

    // Defensive: throw if any font is missing
    if (!fontCache.regular || !fontCache.bold || !fontCache.italic) {
      throw new Error('Failed to load all required font files for OG image');
    }
    
    return fontCache as { regular: Buffer; bold: Buffer; italic: Buffer };
  } catch (error) {
    console.error('Font loading error:', error);
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
  const baseSize = 64;
  const charThreshold = 45;
  const minSize = 36;
  
  if (title.length <= charThreshold) {
    return baseSize;
  }
  
  const scaleFactor = Math.max(0.5, 1 - ((title.length - charThreshold) * 0.012));
  return Math.max(minSize, Math.floor(baseSize * scaleFactor));
}

/**
 * Calculate optimal subtitle font size
 */
function calculateSubtitleFontSize(subtitle: string, titleSize: number): number {
  const baseRatio = 0.57;
  const charThreshold = 80;
  const minSize = 20;
  
  let size = Math.floor(titleSize * baseRatio);
  
  if (subtitle.length > charThreshold) {
    const scaleFactor = Math.max(0.7, 1 - ((subtitle.length - charThreshold) * 0.01));
    size = Math.floor(size * scaleFactor);
  }
  
  return Math.max(minSize, size);
}

/**
 * Estimate content height to ensure it fits
 */
function estimateContentHeight(options: OgImageOptions): {
  titleHeight: number;
  subtitleHeight: number;
  metaHeight: number;
  authorHeight: number;
  totalContentHeight: number;
} {
  const titleFontSize = calculateTitleFontSize(options.title);
  const titleLines = Math.ceil(options.title.length / 40);
  const titleHeight = titleLines * titleFontSize * 1.25 + 32;
  
  let subtitleHeight = 0;
  if (options.subtitle) {
    const subtitleFontSize = calculateSubtitleFontSize(options.subtitle, titleFontSize);
    const subtitleLines = Math.ceil(options.subtitle.length / 60);
    subtitleHeight = subtitleLines * subtitleFontSize * 1.2 + 24;
  }
  
  let metaHeight = 0;
  if (options.metaLine || (options.extraMeta && options.extraMeta.length > 0)) {
    metaHeight = 32 + 24;
  }
  
  let authorHeight = options.author ? 120 : 28;
  
  return {
    titleHeight,
    subtitleHeight,
    metaHeight,
    authorHeight,
    totalContentHeight: titleHeight + subtitleHeight + metaHeight + authorHeight
  };
}

/**
 * Generates a PNG buffer for an OG image with unified styling.
 * @param options OgImageOptions
 * @param baseUrl Base URL for fetching fonts in production (e.g., 'https://ewancroft.uk')
 * @returns Buffer (PNG)
 */
export async function generateOgImage(options: OgImageOptions, baseUrl?: string): Promise<Buffer> {
  const fonts = await loadFonts(baseUrl);
  
  // Calculate optimal sizing
  const titleFontSize = calculateTitleFontSize(options.title);
  const subtitleFontSize = options.subtitle ? calculateSubtitleFontSize(options.subtitle, titleFontSize) : 0;
  
  // Estimate if content will fit and adjust if needed
  const contentEstimate = estimateContentHeight(options);
  const availableHeight = 630 - 96;
  
  let titleMarginBottom = 32;
  let subtitleMarginBottom = 24;
  let metaMarginBottom = 24;
  
  if (contentEstimate.totalContentHeight > availableHeight) {
    const compressionRatio = availableHeight / contentEstimate.totalContentHeight;
    titleMarginBottom = Math.max(8, Math.floor(titleMarginBottom * compressionRatio));
    subtitleMarginBottom = Math.max(6, Math.floor(subtitleMarginBottom * compressionRatio));
    metaMarginBottom = Math.max(8, Math.floor(metaMarginBottom * compressionRatio));
  }

  // Extract and format date for UK timezone
  let dateString: string | null = null;
  if (options.extraMeta && options.extraMeta.length > 0) {
    try {
      const utcDate = new Date(options.extraMeta[0]); // parse UTC string
      // Format in UK timezone
      dateString = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/London',
        hour12: false
      }).format(utcDate);
    } catch (err) {
      console.warn('Failed to parse date for OG image:', err);
      dateString = options.extraMeta[0]; // fallback
    }
  }

  // Layout children
  let children: any[] = [];

  // Title with dynamic sizing
  children.push({
    type: 'h1',
    props: {
      style: {
        fontSize: `${titleFontSize}px`,
        fontWeight: 700,
        fontStyle: 'normal',
        margin: `0 0 ${titleMarginBottom}px 0`,
        textAlign: 'center',
        lineHeight: 1.25,
        maxWidth: '1000px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textWrap: 'balance',
        hyphens: 'auto',
        paddingLeft: '48px',
        paddingRight: '48px',
      },
      children: options.title,
    },
  });

  // Subtitle/description with dynamic sizing
  if (options.subtitle) {
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: `${subtitleFontSize}px`,
          fontWeight: 400,
          margin: `0 0 ${subtitleMarginBottom}px 0`,
          textAlign: 'center',
          opacity: 0.8,
          maxWidth: '900px',
          lineHeight: 1.3,
          textWrap: 'balance',
          paddingLeft: '48px',
          paddingRight: '48px',
        },
        children: options.subtitle,
      },
    });
  }

  // Meta line (e.g., reading time, word count) - exclude date from this
  if (options.metaLine) {
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: '24px',
          opacity: 0.75,
          margin: `0 0 ${metaMarginBottom}px 0`,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        },
        children: options.metaLine,
      },
    });
  }

  // Custom children (for advanced layouts)
  if (options.customChildren) {
    children.push(options.customChildren);
  }

  // Decorative line (optional, for index pages) - only if no author and no date
  if (!options.author && !dateString && !options.customChildren) {
    children.push({
      type: 'div',
      props: {
        style: {
          width: '120px',
          height: '4px',
          background: '#2d4839',
          borderRadius: '2px',
          margin: '0 auto',
          flexShrink: 0,
        },
      },
    });
  }

  // Create footer with split layout (author left, date right)
  let footerContent = null;
  if (options.author || dateString) {
    footerContent = {
      type: 'div',
      props: {
        style: {
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '48px',
          paddingRight: '48px',
          opacity: 0.85,
          flexShrink: 0,
        },
        children: [
          // Author info - left side
          options.author ? {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '18px',
                textAlign: 'left',
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
          } : {
            type: 'div', // Empty placeholder for left side
            props: { style: {} },
          },
          
          // Date info - right side
          dateString ? {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                textAlign: 'right',
                gap: '4px',
              },
              children: [
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '18px',
                      fontWeight: 600,
                      fontStyle: 'normal',
                      color: '#d8e8d8',
                      lineHeight: 1.2,
                    },
                    children: dateString,
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '14px',
                      color: '#8fd0a0',
                      fontWeight: 400,
                      fontStyle: 'italic',
                      opacity: 0.8,
                    },
                    children: 'Published',
                  },
                },
              ],
            },
          } : {
            type: 'div', // Empty placeholder for right side
            props: { style: {} },
          },
        ],
      },
    };
  }

  // Create main container with efficient spacing
  const mainContainer = {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#121c17',
        color: '#d8e8d8',
        fontFamily: 'Recursive',
        position: 'relative',
        padding: footerContent ? '60px 0 48px 0' : '48px 0',
        boxSizing: 'border-box',
      },
      children: [
        // Main content container - takes up most space
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              flex: '1',
            },
            children,
          },
        },
        
        // Footer with split layout
        footerContent,
      ].filter(Boolean),
    },
  };

  // Compose SVG
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

  // Convert SVG to PNG
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render();
  return png.asPng();
}