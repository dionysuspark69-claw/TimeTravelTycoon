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
      const controller = new AbortController();
      const loadTimeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("/api/load", {
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(loadTimeout);

      if (!response.ok) {
        if (response.status === 404) return;
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load game");
      }

      const data = await response.json();
      if (data.gameState) {
        const gs = data.gameState;
        const now = Date.now();

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
          waitingCustomers: 0,
          processingCustomers: 0,
          tripEndTime: null,
          customerEntities: [],
          nextCustomerId: gs.nextCustomerId || 0,
          unlockedDestinations: gs.unlockedDestinations,
          currentDestination: gs.currentDestination,
          prestigeLevel: gs.prestigeLevel,
          prestigePoints: gs.prestigePoints,
          tutorialShown: gs.tutorialShown || useIdleGame.getState().tutorialShown,
          lastPlayTime: gs.lastPlayTime || now,
          coinsPerSecond: gs.coinsPerSecond || 0,
        });
      }
    } catch (error) {
      console.error("Error loading game:", error);
    }
  },

  // Loads profile state - also runs BEFORE game shows, so no subscribers exist yet
  loadProfile: async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch("/api/load-profile", {
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) return;

      const data = await response.json();
      if (!data.profileState) return;
      const ps = data.profileState;

      // All of these run before the game renders - no active subscribers
      if (ps.managers && Object.keys(ps.managers).length > 0) {
        useManagers.setState({ managers: ps.managers, compoundInterestBonus: ps.compoundInterestBonus || 0 });
      }
      if (ps.unlockedAchievements?.length > 0 || ps.claimedAchievements?.length > 0) {
        useAchievements.setState({ unlockedAchievements: ps.unlockedAchievements || [], claimedAchievements: ps.claimedAchievements || [] });
      }
      if (ps.artifactDiscoveries?.length > 0) {
        useArtifacts.setState({ discoveries: ps.artifactDiscoveries, totalDrops: ps.artifactTotalDrops || 0 });
      }
      if (ps.missions?.length > 0) {
        useMissions.setState({ missions: ps.missions, completedMissionIds: ps.completedMissionIds || [], nextMissionId: ps.nextMissionId || 0, missionStreak: ps.missionStreak || 0, lastMissionCompletedAt: ps.lastMissionCompletedAt || 0, rerollsAvailable: ps.rerollsAvailable ?? 1 });
      }
      if (ps.prestigePerkChoices && Object.keys(ps.prestigePerkChoices).length > 0) {
        usePrestigePerks.setState({ chosenPerks: ps.prestigePerkChoices });
      }
      if (ps.managerPerkChoices && Object.keys(ps.managerPerkChoices).length > 0) {
        useManagerPerks.setState({ choices: ps.managerPerkChoices });
      }
    } catch (error) {
      console.log("Profile load failed, using localStorage:", error);
    }
  },
}));
