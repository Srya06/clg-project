import api from "@/lib/api";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const hodService = {
  // ── HOD Authentication ─────────────────────────────────────────────────────
  /**
   * Direct HOD login (bypasses NextAuth for programmatic use).
   * Prefer using signIn("credentials") from NextAuth in components.
   */
  hodLogin: (email: string, password: string) =>
    axios.post(`${API_BASE}/hod/auth/login`, { email, password }),

  hodChangePassword: (
    data: { currentPassword: string; newPassword: string; confirmPassword: string },
    accessToken: string
  ) =>
    api.post("/hod/auth/change-password", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  hodForgotPassword: (email: string) =>
    axios.post(`${API_BASE}/hod/auth/forgot-password`, { email }),

  hodVerifyResetOtp: (data: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }) => axios.post(`${API_BASE}/hod/auth/verify-reset-otp`, data),

  // ── HOD Dashboard ──────────────────────────────────────────────────────────
  getStudents: () => api.get("/hod/students"),
  getStudentById: (id: string) => api.get(`/hod/students/${id}`),
  messageStudent: (id: string, data: { title?: string; message: string }) => 
    api.post(`/hod/students/${id}/message`, data),
  triggerIntervention: (id: string, reason?: string) => 
    api.post(`/hod/students/${id}/intervention`, { reason }),
  getRankings: (params?: any) => api.get("/hod/rankings", { params }),
  getAnalytics: () => api.get("/hod/analytics"),
  getAlerts: () => api.get("/hod/alerts"),
  getTopPerformers: () => api.get("/hod/top-performers"),
  getLowPerformers: () => api.get("/hod/low-performers"),
  getAnnouncements: () => api.get("/hod/announcements"),
  sendAnnouncement: (data: Record<string, unknown>) => api.post("/hod/announcements", data),
  deleteAnnouncement: (id: string) => api.delete(`/hod/announcements/${id}`),

  // Events
  getEvents: () => api.get("/hod/events"),
  createEvent: (data: any) => api.post("/hod/events", data),
  updateEvent: (id: string, data: any) => api.put(`/hod/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/hod/events/${id}`),

  // Achievements
  getAchievements: () => api.get("/hod/achievements"),
  createAchievement: (data: any) => api.post("/hod/achievements", data),
  updateAchievement: (id: string, data: any) => api.put(`/hod/achievements/${id}`, data),
  deleteAchievement: (id: string) => api.delete(`/hod/achievements/${id}`),
};
