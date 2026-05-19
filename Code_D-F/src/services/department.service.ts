import api from "@/lib/api";

export const departmentService = {
  // Events
  getAllEvents: () => api.get("/events"),
  createEvent: (data: any) => api.post("/events", data),
  archiveEvent: (id: string) => api.patch(`/events/${id}/archive`),

  // Achievements
  getAllAchievements: () => api.get("/achievements"),
  getFeaturedAchievements: () => api.get("/achievements/featured"),
  createAchievement: (data: any) => api.post("/achievements", data),
};
