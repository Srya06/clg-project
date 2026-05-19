import api from "@/lib/api";

export const notificationService = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id: string) => api.put(`/notifications/${id}`),
  markAllAsRead: () => api.put("/notifications/mark-all"),
};
