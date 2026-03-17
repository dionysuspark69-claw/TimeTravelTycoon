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
  loadProfile: () => Promise<void>; // background load after game is visible
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
        // Core
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
        customerEntities: state.customerEntities,
        nextCustomerId: state.nextCustomerId,
        unlockedDestinations: state.unlockedDestinations,
        currentDestination: state.currentDestination,
        prestigeLevel: state.prestigeLevel,
        prestigePoints: state.prestigePoints,
        tutorialShown: state.tutorialShown,
        lastPlayTime: state.lastPlayTime,
        coinsPerSecond: state.coinsPerSecond,
        // Profile (synced separately on load but saved together)
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

  // Phase 1: load core state only - fast, blocks game start
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
          // customerEntities intentionally NOT restored - transient runtime state.
          // Restoring them triggers 3D scene re-renders that freeze the game.
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

        // Profile data (managers, achievements, etc.) stays in localStorage.
        // loadProfile() disabled - it causes re-render cascade on live game.
        // Cross-device sync will be handled separately when needed.
      }
    } catch (error) {
      console.error("Error loading game:", error);
    }
  },

  // Phase 2: load profile from cloud ONLY if localStorage is empty (new device)
  // If localStorage already has data, skip entirely - avoid unnecessary setState spam
  loadProfile: async () => {
    try {
      // Check if localStorage already has meaningful data
      const hasLocalManagers = Object.keys(useManagers.getState().managers).length > 0;
      const hasLocalAchievements = useAchievements.getState().unlockedAchievements.length > 0;
      const hasLocalArtifacts = useArtifacts.getState().discoveries.length > 0;
      const hasLocalMissions = useArtifacts.getState().discoveries.length > 0;

      // If all stores are populated, cloud sync not needed this session
      if (hasLocalManagers && hasLocalAchievements) {
        console.log("Profile data in localStorage, skipping cloud profile load");
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch("/api/load", {
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) return;

      const data = await response.json();
      if (!data.gameState) return;
      const gs = data.gameState;

      const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
      const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

      // Only apply each store if localStorage was empty for that store
      if (!hasLocalManagers && gs.managers && Object.keys(gs.managers).length > 0) {
        await nextFrame();
        useManagers.setState({ managers: gs.managers, compoundInterestBonus: gs.compoundInterestBonus || 0 });
        await delay(100);
      }
      if (!hasLocalAchievements && gs.unlockedAchievements?.length > 0) {
        await nextFrame();
        useAchievements.setState({ unlockedAchievements: gs.unlockedAchievements || [], claimedAchievements: gs.claimedAchievements || [] });
        await delay(100);
      }
      if (!hasLocalArtifacts && gs.artifactDiscoveries?.length > 0) {
        await nextFrame();
        useArtifacts.setState({ discoveries: gs.artifactDiscoveries, totalDrops: gs.artifactTotalDrops || 0 });
        await delay(100);
      }
      if (!hasLocalMissions && gs.missions?.length > 0) {
        await nextFrame();
        useMissions.setState({ missions: gs.missions, completedMissionIds: gs.completedMissionIds || [], nextMissionId: gs.nextMissionId || 0, missionStreak: gs.missionStreak || 0, lastMissionCompletedAt: gs.lastMissionCompletedAt || 0, rerollsAvailable: gs.rerollsAvailable ?? 1 });
        await delay(100);
      }
      if (gs.prestigePerkChoices && Object.keys(gs.prestigePerkChoices).length > 0) {
        const hasLocalPerks = Object.keys(usePrestigePerks.getState().chosenPerks).length > 0;
        if (!hasLocalPerks) { await nextFrame(); usePrestigePerks.setState({ chosenPerks: gs.prestigePerkChoices }); await delay(100); }
      }
      if (gs.managerPerkChoices && Object.keys(gs.managerPerkChoices).length > 0) {
        const hasLocalManagerPerks = Object.keys(useManagerPerks.getState().choices).length > 0;
        if (!hasLocalManagerPerks) { await nextFrame(); useManagerPerks.setState({ choices: gs.managerPerkChoices }); }
      }
    } catch (error) {
      console.log("Background profile load failed, using localStorage:", error);
    }
  },
}));
