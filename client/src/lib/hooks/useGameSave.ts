import { useEffect, useRef } from "react";
import { useAuth } from "../stores/useAuth";
import { useSaveState } from "../stores/useSaveState";
import { useIdleGame } from "../stores/useIdleGame";

// Returns true if the browser has a persisted game save in localStorage.
// Checked synchronously so we can decide before the first render.
export function hasLocalSave(): boolean {
  try {
    const raw = localStorage.getItem("chronotransit-idle-game");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    // A real save has a numeric timeMachineLevel stored under .state
    return typeof parsed?.state?.timeMachineLevel === "number";
  } catch {
    return false;
  }
}

export function useGameSave() {
  const { isAuthenticated } = useAuth();
  const { isSaving, lastSaved, hasLoadedOnce, setHasLoadedOnce } = useSaveState();
  const hasSynced = useRef(false);

  // If there's already a local save, unblock autosave immediately — no need to
  // wait for network before the player's progress can be preserved.
  useEffect(() => {
    if (hasLocalSave() && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Background server sync: runs once after authentication resolves.
  // Applies server save only when it's newer than the current local state.
  useEffect(() => {
    if (!isAuthenticated || hasSynced.current) return;
    hasSynced.current = true;

    const doSync = async () => {
      // Snapshot local lastPlayTime before the async fetch so we compare against
      // the state that was actually in memory when sync started.
      const localLastPlayTime = useIdleGame.getState().lastPlayTime || 0;

      const hardCap = setTimeout(() => {
        console.warn("Server sync hard cap hit");
        setHasLoadedOnce(true);
      }, 10000);

      try {
        useIdleGame.getState().calculateOfflineEarnings();
        const gameApplied = await useSaveState.getState().loadGame(localLastPlayTime);
        // Only sync profile when the game state came from the server — keeps
        // game + profile in the same logical snapshot.
        if (gameApplied) {
          await useSaveState.getState().loadProfile();
        }
      } catch (e) {
        console.error("Server sync failed:", e);
      } finally {
        clearTimeout(hardCap);
        setHasLoadedOnce(true);
      }
    };

    doSync();
  }, [isAuthenticated, setHasLoadedOnce]);

  // Periodic autosave — only starts once hasLoadedOnce is true.
  useEffect(() => {
    if (!isAuthenticated || !hasLoadedOnce) return;

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
