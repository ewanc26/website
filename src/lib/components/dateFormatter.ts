// src/lib/dateFormatter.ts
export function formatDate(date: Date, loaded: boolean = true): string {
  if (!loaded) {
    return "Loading...";
  }

  // Use the system locale with zero-padding for numeric values
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit", // Use 2-digit for zero-padded months
    day: "2-digit", // Use 2-digit for zero-padded days
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit", // Already zero-padded
    minute: "2-digit", // Already zero-padded
  };

  // Format according to the system locale with zero-padding
  return (
    date.toLocaleDateString(undefined, dateOptions) +
    " at " +
    date.toLocaleTimeString(undefined, timeOptions)
  );
}
