import { create } from "zustand";

let saveErrorToastShown = false;
import { useIdleGame } from "./useIdleGame";
import { useManagers } from "./useManagers";
import { useAchievements } from "./useAchievements";
import { useArtifacts } from "./useArtifacts";
import { useMissions } from "./useMissions";
import { usePrestigePerks } from "./usePrestigePerks";
import { useManagerPerks } from "./useManagerPerks";
import { toast } from "sonner";
import { saveDebugLog, getSaveDebugLog, downloadSaveDebugLog } from "../logging/logger";
import { validateAndSanitizeGameState, validateAndSanitizeProfileState, type GameStateSchema } from "../savevalidation";

interface SaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasLoadedOnce: boolean;
  setIsSaving: (isSaving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
  setHasLoadedOnce: (hasLoaded: boolean) => void;
  saveGame: () => Promise<void>;
  saveProfile: () => Promise<void>;
  loadGame: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const useSaveState = create<SaveState>((set, get) => ({
  isSaving: false,
  lastSaved: null,
  hasLoadedOnce: false,
  setIsSaving: (isSaving) => set({ isSaving }),
  setLastSaved: (date) => set({ lastSaved: date }),
  setHasLoadedOnce: (hasLoaded) => set({ hasLoadedOnce: hasLoaded }),

  saveGame: async () => {
    try {
      set({ isSaving: true });
      const state = useIdleGame.getState();

      const gameState = {
        chronocoins: state.chronocoins,
        totalEarned: state.totalEarned,
        totalTripsCompleted: state.totalTripsCompleted,
        totalManagerUpgrades: state.totalManagerUpgrades,
        totalCustomersServed: state.totalCustomersServed,
        timeMachineLevel: state.timeMachineLevel,
        timeMachineCapacity: state.timeMachineCapacity,
        timeMachineSpeed: state.timeMachineSpeed,
        timeMachineCount: state.timeMachineCount,
        customerGenerationRate: state.customerGenerationRate,
        queueSize: state.queueSize,
        boardingSpeed: state.boardingSpeed,
        vipChance: state.vipChance,
        turnaroundTime: state.turnaroundTime,
        artifactScanner: state.artifactScanner,
        offlineInfra: state.offlineInfra,
        autoDispatch: state.autoDispatch,
        eraExpertise: state.eraExpertise,
        waitingCustomers: state.waitingCustomers,
        processingCustomers: state.processingCustomers,
        nextCustomerId: state.nextCustomerId,
        unlockedDestinations: state.unlockedDestinations,
        currentDestination: state.currentDestination,
        prestigeLevel: state.prestigeLevel,
        prestigePoints: state.prestigePoints,
        tutorialShown: state.tutorialShown,
        lastPlayTime: state.lastPlayTime,
        coinsPerSecond: state.coinsPerSecond,
      };

      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ gameState }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save game");
      }

      set({ lastSaved: new Date() });
    } catch (error) {
      console.error("Error saving game:", error);
      if (!saveErrorToastShown) {
        saveErrorToastShown = true;
        toast.error("Auto-save failed. Progress may not be saved.", {
          duration: 8000,
          onDismiss: () => { saveErrorToastShown = false; },
          onAutoClose: () => { saveErrorToastShown = false; },
        });
      }
    } finally {
      set({ isSaving: false });
    }
  },

  saveProfile: async () => {
    try {
      const managers = useManagers.getState();
      const achievements = useAchievements.getState();
      const artifacts = useArtifacts.getState();
      const missions = useMissions.getState();
      const prestigePerks = usePrestigePerks.getState();
      const managerPerks = useManagerPerks.getState();

      const profileState = {
        managers: managers.managers,
        compoundInterestBonus: managers.compoundInterestBonus,
        unlockedAchievements: achievements.unlockedAchievements,
        claimedAchievements: achievements.claimedAchievements,
        artifactDiscoveries: artifacts.discoveries,
        artifactTotalDrops: artifacts.totalDrops,
        missions: missions.missions,
        completedMissionIds: missions.completedMissionIds,
        nextMissionId: missions.nextMissionId,
        missionStreak: missions.missionStreak,
        lastMissionCompletedAt: missions.lastMissionCompletedAt,
        rerollsAvailable: missions.rerollsAvailable,
        prestigePerkChoices: prestigePerks.chosenPerks,
        managerPerkChoices: managerPerks.choices,
      };

      await fetch("/api/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ profileState }),
      });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  },

  // Loads game state from server. Returns true if server data was applied.
  // Pass localLastPlayTime to skip overwriting if local state is already newer.
  loadGame: async (localLastPlayTime = 0): Promise<boolean> => {
    try {
      saveDebugLog("Starting loadGame()", "INFO");
      const controller = new AbortController();
      const loadTimeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch("/api/load", {
        credentials: "include",
        signal: controller.signal,
      });

      saveDebugLog(`Load response status: ${response.status}`, "DEBUG");

      if (!response.ok) {
        clearTimeout(loadTimeout);
        if (response.status === 404) {
          saveDebugLog("No save found on server (404)", "INFO");
        } else {
          saveDebugLog(`Load HTTP error: ${response.status}`, "WARN");
        }
        return false;
      }

      const data = await response.json();
      clearTimeout(loadTimeout);

      if (!data?.gameState) {
        saveDebugLog("Malformed response: missing gameState", "WARN");
        return false;
      }

      const serverLastPlay: number = data.gameState.lastPlayTime || 0;
      if (localLastPlayTime > 0 && serverLastPlay <= localLastPlayTime) {
        saveDebugLog(`Server save (${serverLastPlay}) not newer than local (${localLastPlayTime}), keeping local state`, "INFO");
        return false;
      }

      const validated = validateAndSanitizeGameState(data.gameState);
      if ((validated as any)._validationIssues) {
        saveDebugLog("Validation issues:", "WARN", (validated as any)._validationIssues);
      }

      const gs = validated as GameStateSchema;
      useIdleGame.setState({
        chronocoins: gs.chronocoins,
        totalEarned: gs.totalEarned,
        totalTripsCompleted: gs.totalTripsCompleted,
        totalManagerUpgrades: gs.totalManagerUpgrades,
        totalCustomersServed: gs.totalCustomersServed,
        timeMachineLevel: gs.timeMachineLevel,
        timeMachineCapacity: gs.timeMachineCapacity,
        timeMachineSpeed: gs.timeMachineSpeed,
        timeMachineCount: gs.timeMachineCount,
        customerGenerationRate: gs.customerGenerationRate,
        queueSize: gs.queueSize,
        boardingSpeed: gs.boardingSpeed,
        vipChance: gs.vipChance,
        turnaroundTime: gs.turnaroundTime,
        artifactScanner: gs.artifactScanner,
        offlineInfra: gs.offlineInfra,
        autoDispatch: gs.autoDispatch,
        eraExpertise: gs.eraExpertise,
        waitingCustomers: 0,
        processingCustomers: 0,
        tripEndTime: null,
        customerEntities: [],
        nextCustomerId: gs.nextCustomerId,
        unlockedDestinations: gs.unlockedDestinations,
        currentDestination: gs.currentDestination ?? undefined,
        prestigeLevel: gs.prestigeLevel,
        prestigePoints: gs.prestigePoints,
        tutorialShown: gs.tutorialShown || useIdleGame.getState().tutorialShown,
        lastPlayTime: gs.lastPlayTime || Date.now(),
        coinsPerSecond: gs.coinsPerSecond,
      });

      saveDebugLog("loadGame() applied server state", "INFO");
      return true;
    } catch (error) {
      saveDebugLog(`loadGame() failed: ${error instanceof Error ? error.message : String(error)}`, "ERROR");
      // On any error, keep current state — do not overwrite with defaults.
      return false;
    }
  },

  // Loads profile state from server and applies it.
  loadProfile: async (): Promise<void> => {
    try {
      saveDebugLog("Starting loadProfile()", "INFO");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch("/api/load-profile", {
        credentials: "include",
        signal: controller.signal,
      });

      if (!response.ok) {
        clearTimeout(timeout);
        saveDebugLog(`Load profile HTTP ${response.status}`, response.status === 404 ? "INFO" : "WARN");
        return;
      }

      const data = await response.json();
      clearTimeout(timeout);
      if (!data?.profileState) {
        saveDebugLog("Profile payload missing profileState", "WARN");
        return;
      }

      const validated = validateAndSanitizeProfileState(data.profileState);
      if ((validated as any)._validationIssues) {
        saveDebugLog("Profile validation issues:", "WARN", (validated as any)._validationIssues);
      }

      const ps = validated;
      if (Object.keys(ps.managers).length > 0) {
        useManagers.setState({ managers: ps.managers, compoundInterestBonus: ps.compoundInterestBonus || 0 });
      }
      if (ps.unlockedAchievements?.length > 0 || ps.claimedAchievements?.length > 0) {
        useAchievements.setState({ unlockedAchievements: ps.unlockedAchievements || [], claimedAchievements: ps.claimedAchievements || [] });
      }
      if (ps.artifactDiscoveries?.length > 0) {
        useArtifacts.setState({ discoveries: ps.artifactDiscoveries, totalDrops: ps.artifactTotalDrops || 0 });
      }
      if (ps.missions?.length > 0) {
        useMissions.setState({
          missions: ps.missions,
          completedMissionIds: ps.completedMissionIds || [],
          nextMissionId: ps.nextMissionId || 0,
          missionStreak: ps.missionStreak || 0,
          lastMissionCompletedAt: ps.lastMissionCompletedAt || 0,
          rerollsAvailable: ps.rerollsAvailable ?? 1,
        });
      }
      if (ps.prestigePerkChoices && Object.keys(ps.prestigePerkChoices).length > 0) {
        usePrestigePerks.setState({ chosenPerks: ps.prestigePerkChoices });
      }
      if (ps.managerPerkChoices && Object.keys(ps.managerPerkChoices).length > 0) {
        useManagerPerks.setState({ choices: ps.managerPerkChoices });
      }
      saveDebugLog("loadProfile() applied server profile", "INFO");
    } catch (error) {
      saveDebugLog(`loadProfile() failed: ${error instanceof Error ? error.message : String(error)}`, "ERROR");
      // On error, keep current state — do not overwrite.
    }
  },
}));

// Expose debug utilities on window for dev/debugging
if (typeof window !== "undefined") {
  (window as any).getSaveDebugLog = getSaveDebugLog;
  (window as any).clearSaveDebugLog = () => { /* clearSaveDebugLog removed */ };
  (window as any).downloadSaveDebugLog = downloadSaveDebugLog;
}