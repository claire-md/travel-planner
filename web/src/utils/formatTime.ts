// `@db.Time` values arrive anchored to the Unix epoch in UTC, so they're
// formatted in UTC to stop local timezones from shifting the time of day.
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatTime(value: Date | string) {
  const time = new Date(value);

  return Number.isNaN(time.getTime()) ? "" : timeFormatter.format(time);
}
