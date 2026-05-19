import api from "@/lib/api";

export const authService = {
  login: (credentials: Record<string, unknown>) => api.post("/auth/login", credentials),
  register: (data: Record<string, unknown>) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.get("/auth/refresh"),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => api.post(`/auth/reset-password/${token}`, { password }),
  updatePassword: (oldPassword: string, newPassword: string) => api.patch("/auth/update-password", { oldPassword, newPassword }),
};
