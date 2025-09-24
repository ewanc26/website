import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { dev } from '$app/environment';

const FONT_BASE_URL = '/fonts/ArrowType-Recursive-1.085/Recursive_Desktop/separate_statics/TTF';
const FONT_FILES = {
  regular: 'RecursiveSansCslSt-Regular.ttf',
  bold: 'RecursiveSansCslSt-Bold.ttf',
  italic: 'RecursiveSansCslSt-Italic.ttf',
};

let fontCache: { regular?: Buffer; bold?: Buffer; italic?: Buffer } = {};

/**
 * Load a single font file. Dev: read from fs (static folder). Prod: fetch from baseUrl + path.
 */
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

/**
 * Load all fonts (cached).
 */
async function loadFonts(baseUrl?: string) {
  if (!fontCache.regular) fontCache.regular = await loadSingleFont(FONT_FILES.regular, baseUrl);
  if (!fontCache.bold) fontCache.bold = await loadSingleFont(FONT_FILES.bold, baseUrl);
  if (!fontCache.italic) fontCache.italic = await loadSingleFont(FONT_FILES.italic, baseUrl);

  if (!fontCache.regular || !fontCache.bold || !fontCache.italic) {
    throw new Error('Failed to load required fonts');
  }
  return fontCache as { regular: Buffer; bold: Buffer; italic: Buffer };
}

/**
 * Load a fallback SVG (dev: read from static/fallback/, prod: fetch from baseUrl + /fallback/).
 * Returns a data URL string (data:image/svg+xml;base64,...), which Satori accepts.
 */
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

/**
 * Resolve an arbitrary image src (author.avatar or banner) into a Satori-friendly absolute/data URL.
 * - If src is falsy => return fallback data URL loaded via loadFallbackSvg
 * - If src starts with 'data:' => pass through
 * - If src is absolute (http/https) => pass through
 * - If src is a relative path (starts with '/') => in dev we read and base64 it, in prod we fetch baseUrl+path and base64 it
 */
async function resolveImageSrc(src: string | undefined | null, fallbackFileName: string, baseUrl?: string): Promise<string> {
  if (!src) {
    return await loadFallbackSvg(fallbackFileName, baseUrl);
  }

  const trimmed = src.trim();
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  // relative path -> load as data URL
  if (dev) {
    const fs = await import('fs/promises');
    const path = await import('path');
    // allow both /fallback/foo.svg and fallback/foo.svg
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

/**
 * Type definitions
 */
export interface OgImageOptions {
  title: string;
  subtitle?: string;
  metaLine?: string;
  author?: {
    name?: string;
    handle?: string;
    did?: string;
    avatar?: string;
  };
  extraMeta?: (string | Date)[];
  banner?: string;
  customChildren?: any;
}

/**
 * Helpers to calculate font sizes and estimate heights
 */
function calculateTitleFontSize(title: string, maxWidth = 1000) {
  const baseSize = 64;
  const charThreshold = 45;
  const minSize = 36;
  if (title.length <= charThreshold) return baseSize;
  const scaleFactor = Math.max(0.5, 1 - ((title.length - charThreshold) * 0.012));
  return Math.max(minSize, Math.floor(baseSize * scaleFactor));
}

function calculateSubtitleFontSize(subtitle: string, titleSize: number) {
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

function estimateContentHeight(options: OgImageOptions) {
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

  const authorHeight = options.author ? 120 : 28;

  return {
    titleHeight,
    subtitleHeight,
    metaHeight,
    authorHeight,
    totalContentHeight: titleHeight + subtitleHeight + metaHeight + authorHeight,
  };
}

/**
 * Utility: estimate text width (px) without DOM.
 * charWidthFactor: average char width relative to fontSize (0.5-0.7).
 */
function estimateTextWidth(text: string, fontSize: number, charWidthFactor = 0.55) {
  return Math.ceil(text.length * fontSize * charWidthFactor);
}

/**
 * Main: generates PNG as Uint8Array
 */
export async function generateOgImage(options: OgImageOptions, baseUrl?: string): Promise<Uint8Array> {
  // load fonts
  const fonts = await loadFonts(baseUrl);

  // Resolve fallback images to data URLs (if needed)
  const avatarDataUrl = await resolveImageSrc(options.author?.avatar || null, 'profile.svg', baseUrl);
  const bannerDataUrl = await resolveImageSrc(options.banner || null, 'banner.svg', baseUrl);

  // sizes
  const titleFontSize = calculateTitleFontSize(options.title);
  const subtitleFontSize = options.subtitle ? calculateSubtitleFontSize(options.subtitle, titleFontSize) : 0;

  // height estimate
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

  // Date
  let dateString: string | null = null;
  if (options.extraMeta && options.extraMeta.length > 0) {
    const raw = options.extraMeta[0];

    if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
      // ISO-like string
      const dateObj = new Date(raw);
      if (!isNaN(dateObj.getTime())) {
        dateString = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/London',
          hour12: false,
        }).format(dateObj);
      }
    } else if (raw instanceof Date) {
      // Direct Date object
      dateString = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/London',
        hour12: false,
      }).format(raw);
    }

    // If not a valid Date/ISO, treat as preformatted string
    if (!dateString) {
      dateString = String(raw);
    }
  }

  // Build children (title/subtitle/meta/custom)
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

  // Build footer (author + date) with fallbacks and DID collision check
  const safeAuthor = options.author ?? { name: 'Anonymous' };

  // If author was supplied but missing both handle & did -> throw (you asked for this)
  if (options.author && !options.author.handle && !options.author.did) {
    throw new Error('OG image generation error: author is missing both handle and DID.');
  }

  // Resolve identifier node: handle -> did (code) -> null
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
    // decide whether to truncate DID based on estimated collision with date block
    const containerWidth = 1200;
    const paddingTotal = 48 + 48; // left + right padding in container
    const avatarWidth = 64;
    const avatarGap = 18;
    const nameFontSize = 22;
    const didFontSize = 15;
    const dateFontSize = 18;
    const safetyBuffer = 8;

    const nameText = safeAuthor.name || 'Anonymous';
    const nameWidth = estimateTextWidth(nameText, nameFontSize, 0.56);
    const leftBase = avatarWidth + avatarGap + Math.max(120, nameWidth); // baseline left width

    const dateBlockWidth = dateString
      ? estimateTextWidth(dateString, dateFontSize, 0.55) + estimateTextWidth('Published', 14, 0.55) + 24
      : 0;

    const monoCharFactor = 0.6;
    const didFullWidth = estimateTextWidth(safeAuthor.did, didFontSize, monoCharFactor);

    const availableForLeft = containerWidth - paddingTotal - dateBlockWidth - safetyBuffer;
    const leftNeededIfFull = leftBase + 12 + didFullWidth; // 12 for code padding

    let didToRender = safeAuthor.did;
    if (leftNeededIfFull > availableForLeft) {
      // truncation logic (head … tail)
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

  // Ensure avatarDataUrl exists (we already pre-resolved above)
  const avatarSrc = avatarDataUrl;

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
                      src: avatarSrc,
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

  // Main container (use bannerDataUrl in backgroundImage)
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
        backgroundImage: `url(${bannerDataUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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

  // Render SVG via Satori
  const svg = await satori(mainContainer, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Recursive', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'Recursive', data: fonts.bold, weight: 700, style: 'normal' },
      { name: 'Recursive', data: fonts.italic, weight: 400, style: 'italic' },
    ],
  });

  // Convert SVG to PNG with resvg
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const pngRender = resvg.render();
  const pngBuffer = pngRender.asPng(); // Buffer-like
  // Return a Uint8Array for portability
  return Uint8Array.from(pngBuffer);
}