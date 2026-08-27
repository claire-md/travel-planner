const TIME_PATTERN = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Turns an `HH:MM` or `HH:MM:SS` string, such as the value of a native time
 * input, into a Date that Prisma accepts for a `@db.Time` column. Those columns
 * only keep the time of day, so the date is anchored to the Unix epoch in UTC
 * and every value stays comparable. Returns null for anything that isn't a
 * valid time.
 */
export const parseTime = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const match = TIME_PATTERN.exec(value.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? "0");

  // Checked explicitly because Date happily rolls "24:00" over to the next day
  // rather than rejecting it.
  if (hours > 23 || minutes > 59 || seconds > 59) {
    return null;
  }

  return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
};
