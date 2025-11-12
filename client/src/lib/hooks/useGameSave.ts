import { useEffect } from "react";
import { useAuth } from "../stores/useAuth";
import { useSaveState } from "../stores/useSaveState";

export function useGameSave() {
  const { isAuthenticated } = useAuth();
  const { saveGame, loadGame, isSaving, lastSaved, hasLoadedOnce, setHasLoadedOnce } = useSaveState();

  useEffect(() => {
    if (isAuthenticated && !hasLoadedOnce) {
      const doLoad = async () => {
        await loadGame();
        setHasLoadedOnce(true);
      };
      doLoad();
    }
  }, [isAuthenticated, hasLoadedOnce]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      saveGame();
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return {
    saveGame,
    loadGame,
    isSaving,
    lastSaved,
  };
}
