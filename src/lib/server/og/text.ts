import type { OgImageOptions } from './types';

export function calculateTitleFontSize(title: string, maxWidth = 1000) {
  const baseSize = 64;
  const charThreshold = 45;
  const minSize = 36;
  if (title.length <= charThreshold) return baseSize;
  const scaleFactor = Math.max(0.5, 1 - ((title.length - charThreshold) * 0.012));
  return Math.max(minSize, Math.floor(baseSize * scaleFactor));
}

export function calculateSubtitleFontSize(subtitle: string, titleSize: number) {
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

export function estimateContentHeight(options: OgImageOptions) {
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

export function estimateTextWidth(text: string, fontSize: number, charWidthFactor = 0.55) {
  return Math.ceil(text.length * fontSize * charWidthFactor);
}
