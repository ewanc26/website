export function getUserLocale(): string {
	if (typeof navigator !== 'undefined') {
		return navigator.language || 'en-GB';
	}
	return 'en-GB';
}

export function formatLocalizedDate(dateString: string, locale?: string): string {
	const date = new Date(dateString);
	const userLocale = locale || getUserLocale();
	return date.toLocaleDateString(userLocale, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
}
