import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GooglePlayState {
  isSignedIn: boolean;
  playerId: string | null;
  playerName: string | null;
  playerAvatar: string | null;
  accessToken: string | null;
  
  signIn: () => Promise<void>;
  signOut: () => void;
  syncProgress: (gameState: any) => Promise<void>;
  loadProgress: () => Promise<any>;
  submitScore: (score: number) => Promise<void>;
  getLeaderboard: () => Promise<any[]>;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const useGooglePlay = create<GooglePlayState>()(
  persist(
    (set, get) => ({
      isSignedIn: false,
      playerId: null,
      playerName: null,
      playerAvatar: null,
      accessToken: null,

      signIn: async () => {
        try {
          if (!GOOGLE_CLIENT_ID) {
            console.error("Google Client ID not configured");
            return;
          }

          const response = await new Promise<any>((resolve, reject) => {
            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;
            
            const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
            authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
            authUrl.searchParams.set("redirect_uri", `${window.location.origin}/auth/google/callback`);
            authUrl.searchParams.set("response_type", "code");
            authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/games");
            authUrl.searchParams.set("access_type", "offline");
            
            const popup = window.open(
              authUrl.toString(),
              "Google Sign In",
              `width=${width},height=${height},left=${left},top=${top}`
            );

            const checkPopup = setInterval(() => {
              try {
                if (popup?.closed) {
                  clearInterval(checkPopup);
                  reject(new Error("Sign-in cancelled"));
                }
              } catch (e) {
                console.error("Error checking popup:", e);
              }
            }, 1000);

            (window as any).handleGoogleCallback = (code: string) => {
              clearInterval(checkPopup);
              popup?.close();
              resolve({ code });
            };
          });

          const tokenResponse = await fetch("/api/google-play/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: response.code }),
          });

          if (!tokenResponse.ok) {
            throw new Error("Failed to authenticate");
          }

          const data = await tokenResponse.json();
          
          set({
            isSignedIn: true,
            playerId: data.playerId,
            playerName: data.playerName,
            playerAvatar: data.playerAvatar,
            accessToken: data.accessToken,
          });
        } catch (error) {
          console.error("Sign-in failed:", error);
          throw error;
        }
      },

      signOut: () => {
        set({
          isSignedIn: false,
          playerId: null,
          playerName: null,
          playerAvatar: null,
          accessToken: null,
        });
      },

      syncProgress: async (gameState: any) => {
        const { accessToken } = get();
        if (!accessToken) {
          console.warn("Not signed in to Google Play");
          return;
        }

        try {
          await fetch("/api/google-play/save", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ gameState }),
          });
        } catch (error) {
          console.error("Failed to sync progress:", error);
        }
      },

      loadProgress: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          console.warn("Not signed in to Google Play");
          return null;
        }

        try {
          const response = await fetch("/api/google-play/load", {
            headers: {
              "Authorization": `Bearer ${accessToken}`
            },
          });

          if (!response.ok) {
            throw new Error("Failed to load progress");
          }

          const data = await response.json();
          return data.gameState;
        } catch (error) {
          console.error("Failed to load progress:", error);
          return null;
        }
      },

      submitScore: async (score: number) => {
        const { accessToken, playerName } = get();
        if (!accessToken) {
          console.warn("Not signed in to Google Play");
          return;
        }

        try {
          await fetch("/api/google-play/leaderboard/submit", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ score, playerName }),
          });
        } catch (error) {
          console.error("Failed to submit score:", error);
        }
      },

      getLeaderboard: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          console.warn("Not signed in to Google Play");
          return [];
        }

        try {
          const response = await fetch("/api/google-play/leaderboard", {
            headers: {
              "Authorization": `Bearer ${accessToken}`
            },
          });

          if (!response.ok) {
            throw new Error("Failed to get leaderboard");
          }

          const data = await response.json();
          return data.entries || [];
        } catch (error) {
          console.error("Failed to get leaderboard:", error);
          return [];
        }
      },
    }),
    {
      name: "google-play-storage",
      partialize: (state) => ({
        isSignedIn: state.isSignedIn,
        playerId: state.playerId,
        playerName: state.playerName,
        playerAvatar: state.playerAvatar,
        accessToken: state.accessToken,
      }),
    }
  )
);
