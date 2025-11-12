import { create } from "zustand";

export interface User {
  id: number;
  username: string;
  googleId: string | null;
  replitUserId: string | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  loginWithReplit: () => Promise<void>;
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

  loginWithReplit: async () => {
    try {
      const response = await fetch("/auth/replit", { method: "POST" });
      
      if (response.ok) {
        const data = await response.json();
        set({ user: data.user, isAuthenticated: true });
        window.location.reload();
      } else {
        const error = await response.json();
        console.error("Replit Auth failed:", error.message);
      }
    } catch (error) {
      console.error("Error logging in with Replit:", error);
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      set({ user: null, isAuthenticated: false });
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },
}));
