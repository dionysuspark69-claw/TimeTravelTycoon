import { useEffect } from "react";
import { useAuth } from "../stores/useAuth";
import { useSaveState } from "../stores/useSaveState";

export function useGameSave() {
  const { isAuthenticated } = useAuth();
  const { isSaving, lastSaved, hasLoadedOnce, setHasLoadedOnce } = useSaveState();

  useEffect(() => {
    if (isAuthenticated && !hasLoadedOnce) {
      const doLoad = async () => {
        await useSaveState.getState().loadGame();
        setHasLoadedOnce(true);
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
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    saveGame: useSaveState.getState().saveGame,
    loadGame: useSaveState.getState().loadGame,
    isSaving,
    lastSaved,
  };
}
