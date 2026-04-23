import { useEffect, useState, useRef } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useAchievements, type Achievement } from "@/lib/stores/useAchievements";
import { AchievementNotification } from "./AchievementNotification";

export function AchievementChecker() {
  const totalCustomersServed = useIdleGame(s => s.totalCustomersServed);
  const totalEarned = useIdleGame(s => s.totalEarned);
  const timeMachineLevel = useIdleGame(s => s.timeMachineLevel);
  const unlockedDestinationsLength = useIdleGame(s => s.unlockedDestinations.length);
  const prestigeLevel = useIdleGame(s => s.prestigeLevel);
  const timeMachineCount = useIdleGame(s => s.timeMachineCount);
  const totalTripsCompleted = useIdleGame(s => s.totalTripsCompleted);
  const totalManagerUpgrades = useIdleGame(s => s.totalManagerUpgrades);
  const chronocoins = useIdleGame(s => s.chronocoins);
  
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);
  const lastCheckRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastCheckRef.current < 5000) return;
    lastCheckRef.current = now;

    const stats = {
      totalCustomersServed,
      totalEarned,
      timeMachineLevel,
      unlockedDestinationsCount: unlockedDestinationsLength,
      prestigeLevel,
      timeMachineCount,
      totalTripsCompleted,
      totalManagerUpgrades,
      currentCoins: chronocoins,
    };

    const newAchievements = useAchievements.getState().checkAchievements(stats);
    if (newAchievements.length > 0) {
      setQueue(prev => [...prev, ...newAchievements]);
    }
  }, [totalCustomersServed, totalEarned, timeMachineLevel, unlockedDestinationsLength, prestigeLevel, timeMachineCount, totalTripsCompleted, totalManagerUpgrades, chronocoins]);
  
  useEffect(() => {
    if (queue.length > 0 && !currentNotification) {
      setCurrentNotification(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [queue, currentNotification]);
  
  return (
    <AchievementNotification
      achievement={currentNotification}
      onClose={() => setCurrentNotification(null)}
    />
  );
}
