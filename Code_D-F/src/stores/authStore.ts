import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: Record<string, unknown> | null;
  setUser: (user: Record<string, unknown>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);
