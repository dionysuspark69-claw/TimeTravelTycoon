import { useEffect, useState } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useAchievements, Achievement } from "@/lib/stores/useAchievements";
import { AchievementNotification } from "./AchievementNotification";

export function AchievementChecker() {
  const {
    totalCustomersServed,
    totalEarned,
    timeMachineLevel,
    unlockedDestinations,
    prestigeLevel,
    addChronocoins
  } = useIdleGame();
  
  const { checkAchievements } = useAchievements();
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);
  
  useEffect(() => {
    const stats = {
      totalCustomersServed,
      totalEarned,
      timeMachineLevel,
      unlockedDestinationsCount: unlockedDestinations.length,
      prestigeLevel
    };
    
    const newAchievements = checkAchievements(stats);
    
    if (newAchievements.length > 0) {
      newAchievements.forEach(achievement => {
        addChronocoins(achievement.reward);
      });
      
      setQueue(prev => [...prev, ...newAchievements]);
    }
  }, [totalCustomersServed, totalEarned, timeMachineLevel, unlockedDestinations.length, prestigeLevel, checkAchievements, addChronocoins]);
  
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
