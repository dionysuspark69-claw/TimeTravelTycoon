import { create } from "zustand";
import { useIdleGame } from "./useIdleGame";
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

      const gameState = {
        chronocoins: state.chronocoins,
        totalEarned: state.totalEarned,
        totalTripsCompleted: state.totalTripsCompleted,
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
      };

      console.log("Attempting to save game...", { 
        url: "/api/save",
        entityCount: state.customerEntities.length 
      });

      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ gameState }),
      });

      console.log("Save response:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Save failed:", { 
          status: response.status, 
          statusText: response.statusText,
          errorData,
          url: response.url
        });
        throw new Error(errorData.message || "Failed to save game");
      }

      set({ lastSaved: new Date() });
      console.log("Game saved successfully");
    } catch (error) {
      console.error("Error saving game:", error);
      toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      set({ isSaving: false });
    }
  },

  loadGame: async () => {
    try {
      const response = await fetch("/api/load", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log("No saved game found");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        console.error("Load failed:", response.status, errorData);
        throw new Error(errorData.message || "Failed to load game");
      }

      const data = await response.json();
      if (data.gameState) {
        const now = Date.now();
        const restoredEntities = (data.gameState.customerEntities || []).map((entity: any) => ({
          ...entity,
          hasReachedTarget: false,
          stateChangedTime: now
        }));

        const actualProcessingCount = restoredEntities.filter(
          (e: any) => e.state === "boarding" || e.state === "traveling"
        ).length;

        useIdleGame.setState({
          chronocoins: data.gameState.chronocoins,
          totalEarned: data.gameState.totalEarned,
          totalTripsCompleted: data.gameState.totalTripsCompleted,
          totalCustomersServed: data.gameState.totalCustomersServed,
          timeMachineLevel: data.gameState.timeMachineLevel,
          timeMachineCapacity: data.gameState.timeMachineCapacity,
          timeMachineSpeed: data.gameState.timeMachineSpeed,
          timeMachineCount: data.gameState.timeMachineCount,
          customerGenerationRate: data.gameState.customerGenerationRate,
          waitingCustomers: data.gameState.waitingCustomers,
          processingCustomers: actualProcessingCount,
          tripEndTime: actualProcessingCount > 0 ? now : null,
          customerEntities: restoredEntities,
          nextCustomerId: data.gameState.nextCustomerId || 0,
          unlockedDestinations: data.gameState.unlockedDestinations,
          currentDestination: data.gameState.currentDestination,
          prestigeLevel: data.gameState.prestigeLevel,
          prestigePoints: data.gameState.prestigePoints,
          tutorialShown: data.gameState.tutorialShown,
        });

        useIdleGame.getState().updateCustomerStates();

        toast.success("Game progress loaded from cloud!");
      }
    } catch (error) {
      console.error("Error loading game:", error);
      toast.error("Failed to load saved game");
    }
  },
}));
