const MS_PER_DAY = 24 * 60 * 60 * 1000;

// `@db.Date` columns are hydrated as UTC midnight. Comparing in UTC keeps the
// difference an exact number of days across daylight saving boundaries.
const toUtcMidnight = (date: Date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

/**
 * Works out which day of a trip a date falls on, counting the trip's start date
 * as day 1. Dates before the trip return zero or a negative number.
 */
export const calculateDay = (date: Date, startDate: Date) => {
  const diff = toUtcMidnight(date) - toUtcMidnight(startDate);

  return Math.round(diff / MS_PER_DAY) + 1;
};
