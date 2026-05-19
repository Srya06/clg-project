/** Clamps a number between min and max (inclusive). */
export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max);

/** Rounds to 2 decimal places. */
export const roundToTwo = (num: number): number =>
  Math.round(num * 100) / 100;

/**
 * Calculates a weighted score from an array of { value, weight } items.
 * Weights are treated as percentages (e.g. 30 = 30%).
 */
export const weightedScore = (
  items: { value: number; weight: number }[]
): number =>
  roundToTwo(
    items.reduce((sum, item) => sum + (item.value * item.weight) / 100, 0)
  );

/**
 * Converts a raw score (0–100) to a percentage string.
 * e.g. toPercentage(75) → "75%"
 */
export const toPercentage = (score: number, total = 100): string =>
  `${roundToTwo((score / total) * 100)}%`;
