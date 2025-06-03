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
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";
    return formattedDate.replace(/(\d+)/, `$1${suffix}`);
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