export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'hod' | 'admin';
  branch?: string;
  department?: string;
  year?: number;
  profileImage?: string;
  score?: number;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  week: number;
}

export interface Roadmap {
  id: string;
  title: string;
  steps: RoadmapStep[];
  completionPercentage: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}
