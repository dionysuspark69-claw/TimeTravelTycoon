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
  loginWithUsername: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithReplit: () => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    try {
      set({ loading: true });
      // 7s timeout - gives auth enough time on cold Render starts before the 8s hard fallback fires
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const response = await fetch("/api/auth/user", { signal: controller.signal });
      clearTimeout(timeout);
      
      if (response.ok) {
        const user = await response.json();
        set({ user, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (error) {
      // AbortError (timeout) or network failure - either way, unblock the game
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  loginWithUsername: async (username: string, password: string) => {
    try {
      const response = await fetch("/auth/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        set({ user: data.user, isAuthenticated: true });
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error("Error logging in with username:", error);
      return { success: false, error: "Failed to connect to server" };
    }
  },

  loginWithReplit: async () => {
    try {
      const replitAuthButton = document.querySelector('#replit-auth-container button');
      if (replitAuthButton) {
        (replitAuthButton as HTMLButtonElement).click();
      } else {
        console.error("Replit Auth button not found");
      }
    } catch (error) {
      console.error("Error triggering Replit Auth:", error);
    }
  },

  loginWithGoogle: () => {
    window.location.href = "/auth/google";
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
