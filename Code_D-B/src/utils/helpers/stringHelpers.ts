/** Capitalizes the first letter of a string. */
export const capitalize = (str = ''): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

/** Converts a string to a URL-safe slug. e.g. "Hello World!" → "hello-world" */
export const slugify = (str = ''): string =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

/** Truncates a string to `len` characters, appending "..." if cut. */
export const truncate = (str = '', len = 100): string =>
  str.length > len ? str.slice(0, len) + '...' : str;

/**
 * Strips leading/trailing whitespace and collapses internal spaces.
 * Useful for sanitising user-input text before sending to AI.
 */
export const sanitize = (str = ''): string =>
  str.trim().replace(/\s+/g, ' ');
