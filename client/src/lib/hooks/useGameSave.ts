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
          // Calculate offline earnings from localStorage state BEFORE cloud load overwrites lastPlayTime
          useIdleGame.getState().calculateOfflineEarnings();
          await useSaveState.getState().loadGame();
        } catch (e) {
          console.error("Load failed, continuing to game:", e);
        } finally {
          // Always unblock the game, even if load throws
          setHasLoadedOnce(true);
        }
      };
      doLoad();
    }
  }, [isAuthenticated, hasLoadedOnce, setHasLoadedOnce]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      useSaveState.getState().saveGame();
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    saveGame: useSaveState.getState().saveGame,
    loadGame: useSaveState.getState().loadGame,
    isSaving,
    lastSaved,
  };
}
