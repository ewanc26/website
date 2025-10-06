import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { loadFonts } from './fonts';
import { resolveImageSrc } from './images';
import {
  calculateTitleFontSize,
  calculateSubtitleFontSize,
  estimateContentHeight,
  estimateTextWidth,
} from './text';
import type { OgImageOptions } from './types';

// In-memory cache for generated OG images
const imageCache = new Map<string, { data: Uint8Array; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

function getCacheKey(options: OgImageOptions): string {
  return JSON.stringify({
    title: options.title,
    subtitle: options.subtitle,
    metaLine: options.metaLine,
    author: options.author,
    extraMeta: options.extraMeta,
  });
}

export async function generateOgImage(options: OgImageOptions, baseUrl?: string): Promise<Uint8Array> {
  const startTime = Date.now();
  
  // Check cache first
  const cacheKey = getCacheKey(options);
  const cached = imageCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('Returning cached OG image');
    return cached.data;
  }

  // Set overall timeout for the entire generation process
  const timeoutDuration = 8000; // 8 seconds total timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('OG image generation timeout')), timeoutDuration);
  });

  try {
    const result = await Promise.race([
      generateImageInternal(options, baseUrl),
      timeoutPromise
    ]);

    const elapsedTime = Date.now() - startTime;
    console.log(`OG image generated in ${elapsedTime}ms`);

    // Cache the result
    imageCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // Clean up old cache entries (keep cache size manageable)
    if (imageCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of imageCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          imageCache.delete(key);
        }
      }
    }

    return result;
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`OG image generation failed after ${elapsedTime}ms:`, error);
    throw error;
  }
}

async function generateImageInternal(options: OgImageOptions, baseUrl?: string): Promise<Uint8Array> {
  // Load fonts and images in parallel with timeouts
  const [fonts, avatarDataUrl, bannerDataUrl] = await Promise.all([
    loadFonts(baseUrl).catch(err => {
      console.error('Font loading failed:', err);
      throw new Error('Failed to load fonts');
    }),
    resolveImageSrc(options.author?.avatar || null, 'profile.svg', baseUrl).catch(err => {
      console.warn('Avatar loading failed, using fallback:', err);
      return `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="32" fill="#2d4839"/></svg>').toString('base64')}`;
    }),
    resolveImageSrc(options.banner || null, 'banner.svg', baseUrl).catch(err => {
      console.warn('Banner loading failed, using fallback:', err);
      return `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#121c17"/></svg>').toString('base64')}`;
    })
  ]);

  const titleFontSize = calculateTitleFontSize(options.title);
  const subtitleFontSize = options.subtitle ? calculateSubtitleFontSize(options.subtitle, titleFontSize) : 0;

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

  let dateString: string | null = null;
  if (options.extraMeta && options.extraMeta.length > 0) {
    const raw = options.extraMeta[0];
    let dateObj: Date | null = null;

    if (typeof raw === 'string' || raw instanceof Date) {
      dateObj = new Date(raw);
    }

    if (dateObj && !isNaN(dateObj.getTime())) {
      dateString = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(dateObj);
    } else {
      dateString = String(raw);
    }
  }

  const children: any[] = [];
  children.push({
    type: 'h1',
    props: {
      style: {
        fontSize: `${titleFontSize}px`,
        fontWeight: 700,
        margin: `0 0 ${titleMarginBottom}px 0`,
        textAlign: 'center',
        lineHeight: 1.25,
        maxWidth: '1000px',
        paddingLeft: '48px',
        paddingRight: '48px',
      },
      children: options.title,
    },
  });

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
          paddingLeft: '48px',
          paddingRight: '48px',
        },
        children: options.subtitle,
      },
    });
  }

  if (options.metaLine) {
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: '24px',
          opacity: 0.75,
          margin: `0 0 ${metaMarginBottom}px 0`,
          display: 'flex',
          justifyContent: 'center',
        },
        children: options.metaLine,
      },
    });
  }

  if (options.customChildren) children.push(options.customChildren);

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
        },
      },
    });
  }

  const safeAuthor = options.author ?? { name: 'Anonymous' };
  if (options.author && !options.author.handle && !options.author.did) {
    throw new Error('OG image generation error: author is missing both handle and DID.');
  }

  let identifierNode: any = null;
  if (safeAuthor.handle) {
    identifierNode = {
      type: 'span',
      props: {
        style: {
          fontSize: '16px',
          color: '#8fd0a0',
          fontWeight: 400,
          fontStyle: 'italic',
        },
        children: '@' + safeAuthor.handle,
      },
    };
  } else if (safeAuthor.did) {
    const containerWidth = 1200;
    const paddingTotal = 48 + 48;
    const avatarWidth = 64;
    const avatarGap = 18;
    const nameFontSize = 22;
    const didFontSize = 15;
    const dateFontSize = 18;
    const safetyBuffer = 8;

    const nameText = safeAuthor.name || 'Anonymous';
    const nameWidth = estimateTextWidth(nameText, nameFontSize, 0.56);
    const leftBase = avatarWidth + avatarGap + Math.max(120, nameWidth);

    const dateBlockWidth = dateString
      ? estimateTextWidth(dateString, dateFontSize, 0.55) + estimateTextWidth('Published', 14, 0.55) + 24
      : 0;

    const monoCharFactor = 0.6;
    const didFullWidth = estimateTextWidth(safeAuthor.did, didFontSize, monoCharFactor);

    const availableForLeft = containerWidth - paddingTotal - dateBlockWidth - safetyBuffer;
    const leftNeededIfFull = leftBase + 12 + didFullWidth;

    let didToRender = safeAuthor.did;
    if (leftNeededIfFull > availableForLeft) {
      const allowedDidWidth = Math.max(24, availableForLeft - leftBase - 12);
      const avgCharPx = didFontSize * monoCharFactor;
      let allowedChars = Math.floor(allowedDidWidth / avgCharPx);

      if (allowedChars <= 6) {
        const head = safeAuthor.did.slice(0, 4);
        const tail = safeAuthor.did.slice(-1);
        didToRender = `${head}…${tail}`;
      } else {
        const headLen = Math.ceil((allowedChars - 1) / 2);
        const tailLen = Math.floor((allowedChars - 1) / 2);
        const head = safeAuthor.did.slice(0, headLen);
        const tail = safeAuthor.did.slice(-tailLen);
        didToRender = `${head}…${tail}`;
      }
    }

    identifierNode = {
      type: 'code',
      props: {
        style: {
          fontSize: `${didFontSize}px`,
          fontFamily: 'monospace',
          background: '#1e2c23',
          color: '#8fd0a0',
          padding: '2px 6px',
          borderRadius: '6px',
        },
        children: didToRender,
      },
    };
  }

  const footerContent =
    options.author || dateString
      ? {
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
              {
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
                    {
                      type: 'img',
                      props: {
                        src: avatarDataUrl,
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
                                lineHeight: 1.1,
                              },
                              children: safeAuthor.name || 'Anonymous',
                            },
                          },
                          identifierNode,
                        ].filter(Boolean),
                      },
                    },
                  ],
                },
              },
              dateString
                ? {
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
                  }
                : { type: 'div', props: {} },
            ],
          },
        }
      : null;

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
        footerContent,
      ].filter(Boolean),
    },
  };

  // Generate SVG with Satori
  const svg = await satori(mainContainer, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Recursive', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'Recursive', data: fonts.bold, weight: 700, style: 'normal' },
      { name: 'Recursive', data: fonts.italic, weight: 400, style: 'italic' },
    ],
  });

  // Convert SVG to PNG with Resvg
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    background: '#121c17',
  });
  
  const pngData = resvg.render();
  return pngData.asPng();
}

// Clear cache (useful for testing)
export function clearOgImageCache() {
  imageCache.clear();
}