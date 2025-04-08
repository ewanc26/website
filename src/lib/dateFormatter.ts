// src/lib/dateFormatter.ts
export function formatDate(date: Date | string, locale: string = 'en-GB'): string {
  const dateObj = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  };

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

export function formatMonthYear(date: Date | string, locale: string = 'en-GB'): string {
  const dateObj = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long"
  };

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}
