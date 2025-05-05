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
