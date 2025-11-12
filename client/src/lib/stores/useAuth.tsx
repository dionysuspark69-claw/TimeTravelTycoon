import { create } from "zustand";

export interface User {
  id: number;
  username: string;
  replitUserId: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    try {
      set({ loading: true });
      const response = await fetch("/api/auth/user");
      
      if (response.ok) {
        const user = await response.json();
        set({ user, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },
}));
