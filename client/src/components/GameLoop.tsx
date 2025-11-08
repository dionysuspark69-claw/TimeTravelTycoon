import { useEffect } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useManagers } from "@/lib/stores/useManagers";
import { useMissions } from "@/lib/stores/useMissions";
import { useEvents } from "@/lib/stores/useEvents";

export function GameLoop() {
  const update = useIdleGame(state => state.update);
  const { 
    getCustomerRateBonus, 
    getSpeedBonus, 
    getRevenueBonus, 
    updatePerkTimers, 
    hasPerk, 
    overclockActive,
    incrementCompoundInterest
  } = useManagers();
  
  const totalTrips = useIdleGame(state => state.totalTripsCompleted);
  const totalEarned = useIdleGame(state => state.totalEarned);
  const totalManagerUpgrades = useIdleGame(state => state.totalManagerUpgrades);
  const totalBoostsUsed = useIdleGame(state => state.totalBoostsUsed);
  const unlockedDestinations = useIdleGame(state => state.unlockedDestinations);
  
  const { checkProgress } = useMissions();
  const eventsUpdate = useEvents(state => state.update);
  const getActiveMultipliers = useEvents(state => state.getActiveMultipliers);
  
  useEffect(() => {
    let lastTime = Date.now();
    let animationFrameId: number;
    let lastCompoundCheck = 0;
    
    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      updatePerkTimers(deltaTime);
      eventsUpdate(deltaTime);
      
      if (hasPerk("accountant", 10) && totalTrips > lastCompoundCheck && totalTrips % 100 === 0) {
        incrementCompoundInterest();
        lastCompoundCheck = totalTrips;
      }
      
      const speedBonus = getSpeedBonus();
      const overclockMultiplier = overclockActive ? 1000 : 1;
      const eventMultipliers = getActiveMultipliers();
      
      const bonuses = {
        customerRate: getCustomerRateBonus() * eventMultipliers.customers,
        speed: speedBonus * overclockMultiplier * eventMultipliers.speed,
        revenue: getRevenueBonus() * eventMultipliers.revenue
      };
      
      const perks = {
        hasVIP: hasPerk("recruiter", 25),
        hasSlipstream: hasPerk("technician", 10),
        hasTimeShare: hasPerk("accountant", 25),
        hasTemporalBeacon: hasPerk("recruiter", 10)
      };
      
      update(deltaTime, bonuses, perks);
      
      checkProgress(totalEarned, totalTrips, totalManagerUpgrades, totalBoostsUsed, unlockedDestinations.length);
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [update, getCustomerRateBonus, getSpeedBonus, getRevenueBonus, updatePerkTimers, hasPerk, overclockActive, incrementCompoundInterest, totalTrips, totalEarned, totalManagerUpgrades, totalBoostsUsed, unlockedDestinations, checkProgress, eventsUpdate, getActiveMultipliers]);
  
  return null;
}
