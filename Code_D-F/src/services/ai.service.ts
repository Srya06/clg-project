import api from "@/lib/api";

export const aiService = {
  chat: (message: string) => api.post("/ai/chat", { message }),
  generateRoadmap: (goal: string) => api.post("/ai/generate-roadmap", { goal }),
  analyzeResume: (formData: FormData) => api.post("/ai/analyze-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  recommend: (topic: string) => api.get(`/ai/recommend?topic=${topic}`),
};
