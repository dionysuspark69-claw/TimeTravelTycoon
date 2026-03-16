import { create } from "zustand";
import { useIdleGame } from "./useIdleGame";
import { useManagers } from "./useManagers";
import { useAchievements } from "./useAchievements";
import { useArtifacts } from "./useArtifacts";
import { useMissions } from "./useMissions";
import { usePrestigePerks } from "./usePrestigePerks";
import { useManagerPerks } from "./useManagerPerks";
import { toast } from "sonner";

interface SaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasLoadedOnce: boolean;
  setIsSaving: (isSaving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
  setHasLoadedOnce: (hasLoaded: boolean) => void;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
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
      const managers = useManagers.getState();
      const achievements = useAchievements.getState();
      const artifacts = useArtifacts.getState();
      const missions = useMissions.getState();
      const prestigePerks = usePrestigePerks.getState();
      const managerPerks = useManagerPerks.getState();

      const gameState = {
        // Core idle game
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
        waitingCustomers: state.waitingCustomers,
        processingCustomers: state.processingCustomers,
        customerEntities: state.customerEntities,
        nextCustomerId: state.nextCustomerId,
        unlockedDestinations: state.unlockedDestinations,
        currentDestination: state.currentDestination,
        prestigeLevel: state.prestigeLevel,
        prestigePoints: state.prestigePoints,
        tutorialShown: state.tutorialShown,
        lastPlayTime: state.lastPlayTime,
        coinsPerSecond: state.coinsPerSecond,
        // Advanced upgrades
        queueSize: state.queueSize,
        boardingSpeed: state.boardingSpeed,
        vipChance: state.vipChance,
        turnaroundTime: state.turnaroundTime,
        artifactScanner: state.artifactScanner,
        offlineInfra: state.offlineInfra,
        autoDispatch: state.autoDispatch,
        eraExpertise: state.eraExpertise,
        // Managers
        managers: managers.managers,
        compoundInterestBonus: managers.compoundInterestBonus,
        // Achievements
        unlockedAchievements: achievements.unlockedAchievements,
        claimedAchievements: achievements.claimedAchievements,
        // Artifacts
        artifactDiscoveries: artifacts.discoveries,
        artifactTotalDrops: artifacts.totalDrops,
        // Missions
        missions: missions.missions,
        completedMissionIds: missions.completedMissionIds,
        nextMissionId: missions.nextMissionId,
        missionStreak: missions.missionStreak,
        lastMissionCompletedAt: missions.lastMissionCompletedAt,
        rerollsAvailable: missions.rerollsAvailable,
        // Prestige perks
        prestigePerkChoices: prestigePerks.chosenPerks,
        // Manager perks
        managerPerkChoices: managerPerks.choices,
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

  loadGame: async () => {
    try {
      // 5s timeout on load fetch - prevents hanging on slow Render cold starts
      const controller = new AbortController();
      const loadTimeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("/api/load", { credentials: "include", signal: controller.signal });
      clearTimeout(loadTimeout);

      if (!response.ok) {
        if (response.status === 404) {
          console.log("No saved game found");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load game");
      }

      const data = await response.json();
      if (!data.gameState) return;

      const gs = data.gameState;
      const now = Date.now();

      // ---- Core idle game ----
      const restoredEntities = (gs.customerEntities || []).map((entity: any) => ({
        ...entity,
        hasReachedTarget: false,
        stateChangedTime: now,
      }));
      const actualProcessingCount = restoredEntities.filter(
        (e: any) => e.state === "boarding" || e.state === "traveling"
      ).length;

      // Defer all setState calls to next animation frame to avoid freezing the running game loop
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

      useIdleGame.setState({
        chronocoins: gs.chronocoins,
        totalEarned: gs.totalEarned,
        totalTripsCompleted: gs.totalTripsCompleted,
        totalManagerUpgrades: gs.totalManagerUpgrades || 0,
        totalCustomersServed: gs.totalCustomersServed,
        timeMachineLevel: gs.timeMachineLevel,
        timeMachineCapacity: gs.timeMachineCapacity,
        timeMachineSpeed: gs.timeMachineSpeed,
        timeMachineCount: gs.timeMachineCount,
        customerGenerationRate: gs.customerGenerationRate,
        queueSize: gs.queueSize || 1,
        boardingSpeed: gs.boardingSpeed || 1,
        vipChance: gs.vipChance || 1,
        turnaroundTime: gs.turnaroundTime || 1,
        artifactScanner: gs.artifactScanner || 1,
        offlineInfra: gs.offlineInfra || 1,
        autoDispatch: gs.autoDispatch || 1,
        eraExpertise: gs.eraExpertise || 1,
        waitingCustomers: gs.waitingCustomers,
        processingCustomers: actualProcessingCount,
        tripEndTime: actualProcessingCount > 0 ? now : null,
        customerEntities: restoredEntities,
        nextCustomerId: gs.nextCustomerId || 0,
        unlockedDestinations: gs.unlockedDestinations,
        currentDestination: gs.currentDestination,
        prestigeLevel: gs.prestigeLevel,
        prestigePoints: gs.prestigePoints,
        tutorialShown: gs.tutorialShown || useIdleGame.getState().tutorialShown,
        lastPlayTime: gs.lastPlayTime || now,
        coinsPerSecond: gs.coinsPerSecond || 0,
      });
      useIdleGame.getState().updateCustomerStates();

      // ---- Managers ----
      if (gs.managers && Object.keys(gs.managers).length > 0) {
        useManagers.setState({
          managers: gs.managers,
          compoundInterestBonus: gs.compoundInterestBonus || 0,
        });
      }

      // ---- Achievements ----
      if (gs.unlockedAchievements?.length > 0 || gs.claimedAchievements?.length > 0) {
        useAchievements.setState({
          unlockedAchievements: gs.unlockedAchievements || [],
          claimedAchievements: gs.claimedAchievements || [],
        });
      }

      // ---- Artifacts ----
      if (gs.artifactDiscoveries?.length > 0) {
        useArtifacts.setState({
          discoveries: gs.artifactDiscoveries,
          totalDrops: gs.artifactTotalDrops || 0,
        });
      }

      // ---- Missions ----
      if (gs.missions?.length > 0) {
        useMissions.setState({
          missions: gs.missions,
          completedMissionIds: gs.completedMissionIds || [],
          nextMissionId: gs.nextMissionId || 0,
          missionStreak: gs.missionStreak || 0,
          lastMissionCompletedAt: gs.lastMissionCompletedAt || 0,
          rerollsAvailable: gs.rerollsAvailable ?? 1,
        });
      }

      // ---- Prestige perks ----
      if (gs.prestigePerkChoices && Object.keys(gs.prestigePerkChoices).length > 0) {
        usePrestigePerks.setState({ chosenPerks: gs.prestigePerkChoices });
      }

      // ---- Manager perk branches ----
      if (gs.managerPerkChoices && Object.keys(gs.managerPerkChoices).length > 0) {
        useManagerPerks.setState({ choices: gs.managerPerkChoices });
      }

      toast.success("Game progress loaded from cloud!");
    } catch (error) {
      console.error("Error loading game:", error);
      toast.error("Failed to load saved game");
    }
  },
}));
