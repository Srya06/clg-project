export const USER_ROLE = {
  STUDENT: 'student',
  HOD:     'hod',
  ADMIN:   'admin',
} as const;
export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

export const STATUS = {
  ACTIVE:   'active',
  INACTIVE: 'inactive',
  PENDING:  'pending',
} as const;
export type Status = typeof STATUS[keyof typeof STATUS];

export const SYNC_TYPE = {
  GITHUB:   'github',
  LEETCODE: 'leetcode',
  LINKEDIN: 'linkedin',
} as const;
export type SyncType = typeof SYNC_TYPE[keyof typeof SYNC_TYPE];

export const GRADE = {
  A_PLUS: 'A+',
  A:      'A',
  B_PLUS: 'B+',
  B:      'B',
  C:      'C',
  F:      'F',
} as const;
export type Grade = typeof GRADE[keyof typeof GRADE];

export const ROADMAP_STATUS = {
  PENDING:     'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED:   'completed',
} as const;
export type RoadmapStatus = typeof ROADMAP_STATUS[keyof typeof ROADMAP_STATUS];

export const NOTIFICATION_TYPE = {
  ALERT:    'alert',
  REMINDER: 'reminder',
  SYSTEM:   'system',
  MESSAGE:  'message',
} as const;
export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];
