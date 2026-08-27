// Trip dates are date-only values stored at UTC midnight, so they're formatted
// in UTC to stop local timezones from shifting them to the previous day.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(value: Date | string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "UTC",
});

export function formatWeekday(value: Date | string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : weekdayFormatter.format(date);
}

export function formatDateRange(start: Date | string, end: Date | string) {
  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);

  if (!formattedStart || !formattedEnd) {
    return formattedStart || formattedEnd;
  }

  return `${formattedStart} – ${formattedEnd}`;
}

export function formatDateForUrl(value: Date | string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}
