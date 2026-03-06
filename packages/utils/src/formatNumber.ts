/**
 * Number formatting utilities
 */

function getLocale(locale?: string): string {
	return locale || (typeof navigator !== 'undefined' && navigator.language) || 'en-GB';
}

export function formatCompactNumber(num?: number, locale?: string): string {
	if (num === undefined || num === null) return '0';
	const effectiveLocale = getLocale(locale);

	if (num >= 1000) {
		const divisor = num >= 1000000000 ? 1000000000 : num >= 1000000 ? 1000000 : 1000;
		const roundedDown = Math.floor((num / divisor) * 10) / 10;
		const adjustedNum = roundedDown * divisor;

		return new Intl.NumberFormat(effectiveLocale, {
			notation: 'compact',
			compactDisplay: 'short',
			maximumFractionDigits: 1
		}).format(adjustedNum);
	}

	return new Intl.NumberFormat(effectiveLocale, {
		notation: 'compact',
		compactDisplay: 'short',
		maximumFractionDigits: 1
	}).format(num);
}

export function formatNumber(num: number, locale?: string): string {
	const effectiveLocale = getLocale(locale);
	return new Intl.NumberFormat(effectiveLocale).format(num);
}
