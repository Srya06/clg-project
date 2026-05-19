import api from "@/lib/api";

export const integrationService = {
  getStatus: () => api.get("/integrations/status"),
  getResources: (topic?: string) => api.get(`/integrations/resources${topic ? `?topic=${topic}` : ''}`),
  githubConnect: (userId: string) => api.get(`/integrations/github/connect?userId=${userId}`),
  githubCallback: (code: string) => api.get(`/integrations/github/callback?code=${code}`),
  githubSync: () => api.post("/integrations/github/sync"),
  leetcodeSync: (username?: string) => api.post("/integrations/leetcode/sync", { username }),
};
