/**
 * Formats a number according to the specified locale and options.
 * @param value The number to format.
 * @param locale The locale to use for formatting (e.g., 'en-GB', 'en-US'). Defaults to 'en-GB'.
 * @param options Options for number formatting, conforming to Intl.NumberFormatOptions.
 * @returns The formatted number string.
 */
export function formatNumber(value: number, locale: string = 'en-GB', options?: Intl.NumberFormatOptions): string {
  if (typeof value !== 'number') {
    return String(value); // Return as string if not a number
  }
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    console.error(`Error formatting number for locale ${locale}:`, error);
    return value.toLocaleString(locale); // Fallback to basic toLocaleString on error
  }
}