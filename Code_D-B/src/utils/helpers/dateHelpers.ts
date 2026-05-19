/**
 * Returns the number of whole days between two dates.
 */
export const getDaysBetween = (a: Date | string, b: Date | string): number =>
  Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));

/**
 * Returns true if the given date is within `days` days of today.
 */
export const isWithinDays = (date: Date | string, days: number): boolean =>
  getDaysBetween(date, new Date()) <= days;

/**
 * Returns the start and end Date objects for the current week (Mon–Sun).
 */
export const getCurrentWeekRange = (): { start: Date; end: Date } => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Formats a Date to ISO date string: "YYYY-MM-DD"
 */
export const toISODate = (date: Date = new Date()): string =>
  date.toISOString().split('T')[0];
