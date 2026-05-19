export const ROLES = ['student', 'hod', 'admin'] as const;
export type Role = typeof ROLES[number];

export const SCORE_WEIGHTS = {
  coding:         30,
  projects:       30,
  problemSolving: 20,
  consistency:    20,
} as const;

export const PAGINATION = {
  PAGE:  1,
  LIMIT: 10,
} as const;

export const FILES = {
  MAX_SIZE: 5 * 1024 * 1024, // 5 MB in bytes
} as const;

export const ROADMAP_STATUS = {
  PENDING:     'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED:   'completed',
} as const;

export const NOTIFICATION_TYPES = {
  ALERT:    'alert',
  REMINDER: 'reminder',
  SYSTEM:   'system',
  MESSAGE:  'message',
} as const;
