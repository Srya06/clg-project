import { getDaysBetween } from '../../utils/helpers/dateHelpers';
import { clamp } from '../../utils/helpers/mathHelpers';

/**
 * Consistency Tracker Service
 */

interface StreakData {
  currentStreak: number;
  maxStreak: number;
}

/**
 * Calculates the current streak and max streak from a sorted date array.
 */
export const getStreakData = (dates: (Date | string)[] = []): StreakData => {
  if (!dates.length) return { currentStreak: 0, maxStreak: 0 };

  // Normalise to date-only strings "YYYY-MM-DD" and deduplicate
  const uniqueDays = [
    ...new Set(dates.map((d) => new Date(d).toISOString().split('T')[0])),
  ].sort();

  if (!uniqueDays.length) return { currentStreak: 0, maxStreak: 0 };

  // ── Calculate current streak ───────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const lastDay = uniqueDays[uniqueDays.length - 1];
  const gapFromToday = getDaysBetween(lastDay, today);

  let currentStreak = 0;
  if (gapFromToday <= 1) {
    currentStreak = 1;
    for (let i = uniqueDays.length - 1; i > 0; i--) {
      const gap = getDaysBetween(uniqueDays[i - 1], uniqueDays[i]);
      if (gap === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // ── Calculate max streak ───────────────────────────────────────────────────
  let maxStreak = 1;
  let runningStreak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const gap = getDaysBetween(uniqueDays[i - 1], uniqueDays[i]);
    if (gap === 1) {
      runningStreak++;
      if (runningStreak > maxStreak) maxStreak = runningStreak;
    } else {
      runningStreak = 1;
    }
  }

  return { currentStreak, maxStreak };
};

/**
 * Calculates a 0–100 consistency score based on activity density in the last 30 days.
 */
export const calculateConsistencyScore = (
  activityLog: (Date | string)[] = []
): number => {
  if (!activityLog.length) return 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeDays = new Set(
    activityLog
      .filter((d) => new Date(d) >= thirtyDaysAgo)
      .map((d) => new Date(d).toISOString().split('T')[0])
  ).size;

  return clamp(Math.round((activeDays / 30) * 100), 0, 100);
};
