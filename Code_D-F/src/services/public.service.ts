import api from "@/lib/api";

export const publicService = {
  getEvents: () => api.get("/public/events"),
  getAchievements: () => api.get("/public/achievements"),
};
