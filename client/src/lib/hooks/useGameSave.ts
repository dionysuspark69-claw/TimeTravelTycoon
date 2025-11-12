import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../stores/useAuth";
import { useIdleGame } from "../stores/useIdleGame";
import { toast } from "sonner";

export function useGameSave() {
  const { isAuthenticated, user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const saveGame = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      setIsSaving(true);
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
        unlockedDestinations: state.unlockedDestinations,
        currentDestination: state.currentDestination,
        prestigeLevel: state.prestigeLevel,
        prestigePoints: state.prestigePoints,
        tutorialShown: state.tutorialShown,
      };

      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameState }),
      });

      if (!response.ok) {
        throw new Error("Failed to save game");
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving game:", error);
      toast.error("Failed to save game progress");
    } finally {
      setIsSaving(false);
    }
  }, [isAuthenticated]);

  const loadGame = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const response = await fetch("/api/load");

      if (!response.ok) {
        if (response.status === 404) {
          console.log("No saved game found");
          return;
        }
        throw new Error("Failed to load game");
      }

      const data = await response.json();
      if (data.gameState) {
        const state = useIdleGame.getState();
        
        state.chronocoins = data.gameState.chronocoins ?? state.chronocoins;
        state.totalEarned = data.gameState.totalEarned ?? state.totalEarned;
        state.totalTripsCompleted = data.gameState.totalTripsCompleted ?? state.totalTripsCompleted;
        state.totalCustomersServed = data.gameState.totalCustomersServed ?? state.totalCustomersServed;
        state.timeMachineLevel = data.gameState.timeMachineLevel ?? state.timeMachineLevel;
        state.timeMachineCapacity = data.gameState.timeMachineCapacity ?? state.timeMachineCapacity;
        state.timeMachineSpeed = data.gameState.timeMachineSpeed ?? state.timeMachineSpeed;
        state.timeMachineCount = data.gameState.timeMachineCount ?? state.timeMachineCount;
        state.customerGenerationRate = data.gameState.customerGenerationRate ?? state.customerGenerationRate;
        state.waitingCustomers = data.gameState.waitingCustomers ?? state.waitingCustomers;
        state.processingCustomers = data.gameState.processingCustomers ?? state.processingCustomers;
        state.unlockedDestinations = data.gameState.unlockedDestinations ?? state.unlockedDestinations;
        state.currentDestination = data.gameState.currentDestination ?? state.currentDestination;
        state.prestigeLevel = data.gameState.prestigeLevel ?? state.prestigeLevel;
        state.prestigePoints = data.gameState.prestigePoints ?? state.prestigePoints;
        state.tutorialShown = data.gameState.tutorialShown ?? state.tutorialShown;

        useIdleGame.setState({
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
          unlockedDestinations: state.unlockedDestinations,
          currentDestination: state.currentDestination,
          prestigeLevel: state.prestigeLevel,
          prestigePoints: state.prestigePoints,
          tutorialShown: state.tutorialShown,
        });

        toast.success("Game progress loaded from cloud!");
      }
    } catch (error) {
      console.error("Error loading game:", error);
      toast.error("Failed to load saved game");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !hasLoadedOnce) {
      loadGame();
      setHasLoadedOnce(true);
    }
  }, [isAuthenticated, hasLoadedOnce, loadGame]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      saveGame();
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, saveGame]);

  return {
    saveGame,
    loadGame,
    isSaving,
    lastSaved,
  };
}
