/**
 * Number formatting utilities
 */

/**
 * Determines the effective locale, preferring system locale with fallback to 'en-GB'.
 */
function getLocale(locale?: string): string {
	return (
		locale ||
		(typeof navigator !== 'undefined' && navigator.language) ||
		'en-GB'
	);
}

/**
 * Formats large numbers into a compact, human-readable format.
 * Automatically adapts to the given or system locale.
 * Numbers are rounded DOWN to ensure stats don't appear inflated.
 * @param num - The number to format
 * @param locale - Optional locale string (defaults to system or 'en-GB')
 * @returns Formatted string (e.g., "1.2K", "3.4M")
 */
export function formatCompactNumber(num?: number, locale?: string): string {
	if (num === undefined || num === null) return '0';
	const effectiveLocale = getLocale(locale);

	// For numbers >= 1000, round down to one decimal place for the compact format
	if (num >= 1000) {
		// Determine the divisor (1000 for K, 1000000 for M, etc.)
		const divisor = num >= 1000000000 ? 1000000000 : num >= 1000000 ? 1000000 : 1000;
		// Floor to one decimal place: floor(num / divisor * 10) / 10
		const roundedDown = Math.floor((num / divisor) * 10) / 10;
		// Re-multiply to get the actual number to format
		const adjustedNum = roundedDown * divisor;
		
		return new Intl.NumberFormat(effectiveLocale, {
			notation: 'compact',
			compactDisplay: 'short',
			maximumFractionDigits: 1
		}).format(adjustedNum);
	}

	// For numbers < 1000, just return as-is
	return new Intl.NumberFormat(effectiveLocale, {
		notation: 'compact',
		compactDisplay: 'short',
		maximumFractionDigits: 1
	}).format(num);
}

/**
 * Formats a number with thousand separators.
 * Automatically adapts to the given or system locale.
 * @param num - The number to format
 * @param locale - Optional locale string (defaults to system or 'en-GB')
 * @returns Formatted string (e.g., "1,234,567")
 */
export function formatNumber(num: number, locale?: string): string {
	const effectiveLocale = getLocale(locale);
	return new Intl.NumberFormat(effectiveLocale).format(num);
}