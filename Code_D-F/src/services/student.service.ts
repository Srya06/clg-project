import api from "@/lib/api";

export const studentService = {
  getProfile: () => api.get("/student/profile"),
  getRoadmap: () => api.get("/student/roadmap"),
  getProgress: () => api.get("/student/progress"),
  getScore: () => api.get("/student/score"),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile: (data: any) => api.put("/student/profile", data),
  uploadResume: (formData: FormData) => api.post("/student/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  analyzeResume: () => api.get("/student/resume/analyze"),
  generateRoadmap: (data: any) => api.post("/student/roadmap/generate", data),
  updateProgress: (data: any) => api.put("/student/progress", data),
  getRecommendations: () => api.get("/student/recommendations"),
  getAnnouncements: () => api.get("/student/announcements"),
  uploadCertificate: (formData: FormData) => api.post("/student/certificate", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  respondAnnouncement: (id: string, data: any) => api.post(`/student/announcements/${id}/respond`, data),
};
