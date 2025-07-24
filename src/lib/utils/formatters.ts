/**
 * Returns the ordinal suffix for a given number (e.g., "st", "nd", "rd", "th").
 * @param num The number to get the ordinal suffix for.
 * @returns The ordinal suffix.
 */
export function getOrdinalSuffix(num: number): string {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return 'th';
  }

  switch (lastDigit) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function formatDate(
  date: Date | string,
  locale: string = typeof window !== "undefined"
    ? window.navigator.language
    : "en-GB"
): string {
  const dateObj = new Date(date);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formattedDate = new Intl.DateTimeFormat(locale, options).format(
    dateObj
  );

  // Only add ordinal suffix for English locales
  if (locale.startsWith("en")) {
    const day = dateObj.getDate();
    return formattedDate.replace(/(\d+)/, `$1${getOrdinalSuffix(day)}`);
  }

  return formattedDate;
}

export function formatMonthYear(
  date: Date | string,
  locale: string = typeof window !== "undefined"
    ? window.navigator.language
    : "en-GB"
): string {
  const dateObj = new Date(date);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
  };

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

// Function to format a date relative to the current time (e.g., '2 hours ago')
export function formatRelativeTime(
  date: Date | string,
  locale: string = typeof window !== "undefined"
    ? window.navigator.language
    : "en-GB"
): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.round((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    if (Math.abs(diffInSeconds) >= seconds) {
      const value = Math.round(diffInSeconds / seconds);
      return rtf.format(-value, unit);
    }
  }

  return rtf.format(0, "second"); // Should ideally not happen if date is in the past
}

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