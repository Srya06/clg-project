import { Document, Types } from 'mongoose';

// ─── User ─────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'hod' | 'admin';
  credits: number;
  academicRankScore?: number;
  isVerified: boolean;
  forcePasswordChange?: boolean;
  lastPasswordChange?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  // GitHub
  githubConnected?: boolean;
  githubUsername?: string;
  githubProfileUrl?: string;
  githubAvatar?: string;
  followers?: number;
  following?: number;
  publicRepos?: number;
  repoCount?: number;
  lastGithubSync?: Date;
  // Academic
  cgpa?: number;
  branch?: string;
  year?: number;
  bio?: string;
  skills?: string[];
  linkedinUrl?: string;
  resumeUrl?: string;
  resumeOriginalName?: string;
  resumeUploadedAt?: Date;
  resumeAnalysis?: Record<string, unknown>;
  careerGoal?: string;
  currentLevel?: string;
  roadmap?: unknown[];
  // LeetCode
  leetcodeUsername?: string;
  leetcodeSolved?: number;
  leetcodeEasy?: number;
  leetcodeMedium?: number;
  leetcodeHard?: number;
  lastLeetcodeSync?: Date;
  department?: string;
  // Virtuals
  fullName: string;
  // Methods
  comparePassword(candidatePassword: string, userPassword: string): Promise<boolean>;
}

export interface IRoadmap extends Document {
  studentId: Types.ObjectId;
  title: string;
  targetRole: string;
  weeks: Array<{
    weekNumber: number;
    theme?: string;
    careerInsight?: string;
    tasks: Array<{
      title: string;
      description?: string;
      isCompleted: boolean;
      video?: {
        videoId: string;
        title: string;
        thumbnail: string;
      };
    }>;
    resources: string[];
  }>;
  status: 'active' | 'completed' | 'archived';
  currentWeek: number;
  completionPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export interface INotification extends Document {
  userId: Types.ObjectId;
  type: 'alert' | 'reminder' | 'system' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// ─── Announcement ─────────────────────────────────────────────────────────────
export interface IAnnouncement extends Document {
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high';
  targetBranch?: string;
  targetYear?: number;
  isArchived: boolean;
  createdBy: Types.ObjectId;
  expiresAt?: Date;
  acknowledgements: Array<{
    studentId: Types.ObjectId;
    response?: string;
    readAt: Date;
  }>;
  createdAt: Date;
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export interface IProgress extends Document {
  studentId: Types.ObjectId;
  roadmapId: Types.ObjectId;
  taskId: string;
  completedAt: Date;
  notes?: string;
}

// ─── Resource ─────────────────────────────────────────────────────────────────
export interface IResource extends Document {
  title: string;
  url: string;
  type?: string;
  tags?: string[];
  createdBy: Types.ObjectId;
}

// ─── Integration ──────────────────────────────────────────────────────────────
export interface IIntegration extends Document {
  studentId: Types.ObjectId;
  githubToken?: string;
  githubSyncedAt?: Date;
  leetcodeUsername?: string;
  lastSyncedAt?: Date;
}
