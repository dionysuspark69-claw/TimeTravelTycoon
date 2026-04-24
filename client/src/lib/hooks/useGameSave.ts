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
        // Hard cap: if both loads exceed this, unblock the game anyway
        const hardCap = setTimeout(() => {
          console.warn("doLoad hard cap hit - unblocking game");
          setHasLoadedOnce(true);
        }, 10000);

        try {
          useIdleGame.getState().calculateOfflineEarnings();
          await Promise.all([
            useSaveState.getState().loadGame(),
            useSaveState.getState().loadProfile(),
          ]);
        } catch (e) {
          console.error("Load failed, using localStorage:", e);
        } finally {
          clearTimeout(hardCap);
          setHasLoadedOnce(true);
        }
      };
      doLoad();
    }
  }, [isAuthenticated, hasLoadedOnce, setHasLoadedOnce]);

  useEffect(() => {
    if (!isAuthenticated || !hasLoadedOnce) return;

    // Save core game every 15s, profile every 60s — only after load completes
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
  }, [isAuthenticated, hasLoadedOnce]);

  return {
    saveGame: useSaveState.getState().saveGame,
    loadGame: useSaveState.getState().loadGame,
    isSaving,
    lastSaved,
  };
}
