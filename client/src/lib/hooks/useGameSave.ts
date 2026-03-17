import { useEffect } from "react";
import { useAuth } from "../stores/useAuth";
import { useSaveState } from "../stores/useSaveState";
import { useIdleGame } from "../stores/useIdleGame";

export function useGameSave() {
  const { isAuthenticated } = useAuth();
  const { isSaving, lastSaved, hasLoadedOnce, setHasLoadedOnce } = useSaveState();

  useEffect(() => {
    if (isAuthenticated && !hasLoadedOnce) {
      const doLoad = async () => {
        try {
          // Calculate offline earnings from localStorage BEFORE cloud load overwrites lastPlayTime
          useIdleGame.getState().calculateOfflineEarnings();
          // Both run before game shows - no active subscribers, no freeze
          await Promise.all([
            useSaveState.getState().loadGame(),
            useSaveState.getState().loadProfile(),
          ]);
        } catch (e) {
          console.error("Load failed, continuing:", e);
        } finally {
          setHasLoadedOnce(true);
        }
      };
      doLoad();
    }
  }, [isAuthenticated, hasLoadedOnce, setHasLoadedOnce]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Save core game every 15s, profile every 60s
    const coreInterval = setInterval(() => {
      useSaveState.getState().saveGame();
    }, 15000);

    const profileInterval = setInterval(() => {
      useSaveState.getState().saveProfile();
    }, 60000);

    return () => {
      clearInterval(coreInterval);
      clearInterval(profileInterval);
    };
  }, [isAuthenticated]);

  return {
    saveGame: useSaveState.getState().saveGame,
    loadGame: useSaveState.getState().loadGame,
    isSaving,
    lastSaved,
  };
}
