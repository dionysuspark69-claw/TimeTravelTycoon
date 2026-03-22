import { create } from "zustand";
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
      toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Loads core game state - runs BEFORE game shows, so no subscribers exist yet
  loadGame: async () => {
    try {
      saveDebugLog("Starting loadGame()", "INFO");
      const controller = new AbortController();
      const loadTimeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch("/api/load", {
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(loadTimeout);

      saveDebugLog(`Load response status: ${response.status}`, "DEBUG");

      if (!response.ok) {
        if (response.status === 404) {
          saveDebugLog("No save found (404)", "INFO");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load game");
      }

      const rawText = await response.clone().text();
      saveDebugLog("Raw save payload:", "DEBUG", rawText);

      const data = await response.json();
      if (!data || !data.gameState) {
        throw new Error("Malformed response: missing gameState");
      }

      saveDebugLog("Validating gameState schema", "DEBUG");
      const validated = validateAndSanitizeGameState(data.gameState);

      if ((validated as any)._validationIssues) {
        saveDebugLog("Validation issues detected:", "WARN", (validated as any)._validationIssues);
        toast.warn("Save file had issues; some data may have been reset");
      }

      const gs = validated as GameStateSchema;
      const now = Date.now();

      // Log assignments
      saveDebugLog("Applying gameState to store", "DEBUG", gs);

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
        currentDestination: gs.currentDestination,
        prestigeLevel: gs.prestigeLevel,
        prestigePoints: gs.prestigePoints,
        tutorialShown: gs.tutorialShown || useIdleGame.getState().tutorialShown,
        lastPlayTime: gs.lastPlayTime || now,
        coinsPerSecond: gs.coinsPerSecond,
      });

      saveDebugLog("loadGame() completed successfully", "INFO");
    } catch (error) {
      console.error("Error loading game:", error);
      saveDebugLog(`loadGame() failed: ${error instanceof Error ? error.message : String(error)}`, "ERROR");
      // Still set hasLoadedOnce via finally in doLoad, but we want a clean default state
      // Apply default state now to ensure consistency
      const defaults = validateAndSanitizeGameState(null);
      useIdleGame.setState({
        ...defaults,
        lastPlayTime: Date.now(),
        waitingCustomers: 0,
        processingCustomers: 0,
        tripEndTime: null,
        customerEntities: [],
      });
    }
  },

  // Loads profile state - also runs BEFORE game shows, so no subscribers exist yet
  loadProfile: async () => {
    try {
      saveDebugLog("Starting loadProfile()", "INFO");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch("/api/load-profile", {
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      saveDebugLog(`Load profile response status: ${response.status}`, "DEBUG");

      if (!response.ok) {
        // 404 is okay; no profile saved yet
        if (response.status === 404) {
          saveDebugLog("No profile saved (404)", "INFO");
        } else {
          saveDebugLog(`Load profile HTTP error: ${response.status}`, "WARN");
        }
        return;
      }

      const rawText = await response.clone().text();
      saveDebugLog("Raw profile payload:", "DEBUG", rawText);

      const data = await response.json();
      if (!data || !data.profileState) {
        saveDebugLog("Profile payload missing profileState", "WARN");
        return;
      }

      saveDebugLog("Validating profileState schema", "DEBUG");
      const validated = validateAndSanitizeProfileState(data.profileState);

      if ((validated as any)._validationIssues) {
        saveDebugLog("Profile validation issues:", "WARN", (validated as any)._validationIssues);
        toast.warn("Profile had issues; some data may have been reset");
      }

      const ps = validated;

      // All of these run before the game renders - no active subscribers
      saveDebugLog("Applying profile state to stores", "DEBUG", ps);
      if (Object.keys(ps.managers).length > 0) {
        useManagers.setState({ managers: ps.managers, compoundInterestBonus: ps.compoundInterestBonus || 0 });
        saveDebugLog("Managers loaded", "DEBUG", ps.managers);
      }
      if (ps.unlockedAchievements?.length > 0 || ps.claimedAchievements?.length > 0) {
        useAchievements.setState({ unlockedAchievements: ps.unlockedAchievements || [], claimedAchievements: ps.claimedAchievements || [] });
        saveDebugLog("Achievements loaded", "DEBUG", { unlocked: ps.unlockedAchievements, claimed: ps.claimedAchievements });
      }
      if (ps.artifactDiscoveries?.length > 0) {
        useArtifacts.setState({ discoveries: ps.artifactDiscoveries, totalDrops: ps.artifactTotalDrops || 0 });
        saveDebugLog("Artifacts loaded", "DEBUG", ps.artifactDiscoveries);
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
        saveDebugLog("Missions loaded", "DEBUG", ps.missions);
      }
      if (ps.prestigePerkChoices && Object.keys(ps.prestigePerkChoices).length > 0) {
        usePrestigePerks.setState({ chosenPerks: ps.prestigePerkChoices });
        saveDebugLog("Prestige perks loaded", "DEBUG", ps.prestigePerkChoices);
      }
      if (ps.managerPerkChoices && Object.keys(ps.managerPerkChoices).length > 0) {
        useManagerPerks.setState({ choices: ps.managerPerkChoices });
        saveDebugLog("Manager perks loaded", "DEBUG", ps.managerPerkChoices);
      }

      saveDebugLog("loadProfile() completed successfully", "INFO");
    } catch (error) {
      console.log("Profile load failed:", error);
      saveDebugLog(`loadProfile() failed: ${error instanceof Error ? error.message : String(error)}`, "ERROR");
      // Log full error details to debug log
      console.error("Profile load exception:", error);
    }
  },
}));

// Expose debug utilities on window for dev/debugging
if (typeof window !== "undefined") {
  (window as any).getSaveDebugLog = getSaveDebugLog;
  (window as any).clearSaveDebugLog = clearSaveDebugLog;
  (window as any).downloadSaveDebugLog = downloadSaveDebugLog;
}