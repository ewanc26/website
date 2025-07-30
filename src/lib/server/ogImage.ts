import fs from 'fs/promises';
import path from 'path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Font paths (adjust if needed)
const fontRegularPath = path.resolve('static/fonts/ArrowType-Recursive-1.085/Recursive_Desktop/separate_statics/TTF/RecursiveSansCslSt-Regular.ttf');
const fontBoldPath = path.resolve('static/fonts/ArrowType-Recursive-1.085/Recursive_Desktop/separate_statics/TTF/RecursiveSansCslSt-Bold.ttf');
const fontItalicPath = path.resolve('static/fonts/ArrowType-Recursive-1.085/Recursive_Desktop/separate_statics/TTF/RecursiveSansCslSt-Italic.ttf');

// Preload fonts (cache in memory for performance)
let fontCache: { regular?: Buffer; bold?: Buffer; italic?: Buffer } = {};
async function loadFonts() {
  if (!fontCache.regular) fontCache.regular = await fs.readFile(fontRegularPath);
  if (!fontCache.bold) fontCache.bold = await fs.readFile(fontBoldPath);
  if (!fontCache.italic) fontCache.italic = await fs.readFile(fontItalicPath);
  // Defensive: throw if any font is missing
  if (!fontCache.regular || !fontCache.bold || !fontCache.italic) {
    throw new Error('Failed to load all required font files for OG image');
  }
  return fontCache as { regular: Buffer; bold: Buffer; italic: Buffer };
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
  const baseSize = 64; // Increased from 56px
  const charThreshold = 45; // Slightly lower threshold
  const minSize = 36; // Increased minimum size
  
  if (title.length <= charThreshold) {
    return baseSize;
  }
  
  // Scale down based on length
  const scaleFactor = Math.max(0.5, 1 - ((title.length - charThreshold) * 0.012));
  return Math.max(minSize, Math.floor(baseSize * scaleFactor));
}

/**
 * Calculate optimal subtitle font size
 */
function calculateSubtitleFontSize(subtitle: string, titleSize: number): number {
  const baseRatio = 0.57; // subtitle is ~57% of title size
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
  const titleLines = Math.ceil(options.title.length / 40); // Adjusted for larger font
  const titleHeight = titleLines * titleFontSize * 1.25 + 32; // line-height + margin
  
  let subtitleHeight = 0;
  if (options.subtitle) {
    const subtitleFontSize = calculateSubtitleFontSize(options.subtitle, titleFontSize);
    const subtitleLines = Math.ceil(options.subtitle.length / 60);
    subtitleHeight = subtitleLines * subtitleFontSize * 1.2 + 24;
  }
  
  let metaHeight = 0;
  if (options.metaLine || (options.extraMeta && options.extraMeta.length > 0)) {
    metaHeight = 32 + 24; // Adjusted for larger meta text
  }
  
  let authorHeight = options.author ? 120 : 28; // author section or decorative line
  
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
 * @returns Buffer (PNG)
 */
export async function generateOgImage(options: OgImageOptions): Promise<Buffer> {
  const fonts = await loadFonts();
  
  // Calculate optimal sizing
  const titleFontSize = calculateTitleFontSize(options.title);
  const subtitleFontSize = options.subtitle ? calculateSubtitleFontSize(options.subtitle, titleFontSize) : 0;
  
  // Estimate if content will fit and adjust if needed
  const contentEstimate = estimateContentHeight(options);
  const availableHeight = 630 - 96; // Total height minus padding
  
  let titleMarginBottom = 32;
  let subtitleMarginBottom = 24;
  let metaMarginBottom = 24;
  
  // If content is too tall, reduce margins more aggressively
  if (contentEstimate.totalContentHeight > availableHeight) {
    const compressionRatio = availableHeight / contentEstimate.totalContentHeight;
    titleMarginBottom = Math.max(8, Math.floor(titleMarginBottom * compressionRatio));
    subtitleMarginBottom = Math.max(6, Math.floor(subtitleMarginBottom * compressionRatio));
    metaMarginBottom = Math.max(8, Math.floor(metaMarginBottom * compressionRatio));
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
        textWrap: 'balance', // Better text wrapping
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

  // Meta line (e.g., reading time, word count)
  if (options.metaLine || (options.extraMeta && options.extraMeta.length > 0)) {
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: '24px', // Increased from 20px
          opacity: 0.75, // Slightly more visible
          margin: `0 0 ${metaMarginBottom}px 0`,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        },
        children: options.metaLine || options.extraMeta?.join(' • '),
      },
    });
  }

  // Custom children (for advanced layouts)
  if (options.customChildren) {
    children.push(options.customChildren);
  }

  // Decorative line (optional, for index pages) - only if no author
  if (!options.author && !options.customChildren) {
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
        padding: options.author ? '60px 0 48px 0' : '48px 0',
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
        // Author info at bottom
        options.author && {
          type: 'div',
          props: {
            style: {
              width: '100%',
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