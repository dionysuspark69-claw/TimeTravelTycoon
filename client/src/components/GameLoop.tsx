import { useEffect } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useManagers } from "@/lib/stores/useManagers";
import { useMissions } from "@/lib/stores/useMissions";
import { useEvents } from "@/lib/stores/useEvents";
import { useAdBoosts } from "@/lib/stores/useAdBoosts";

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
  const unlockedDestinations = useIdleGame(state => state.unlockedDestinations);
  const timeMachineLevel = useIdleGame(state => state.timeMachineLevel);
  const totalUpgradesPurchased = useIdleGame(state => 
    state.timeMachineCapacity + state.timeMachineSpeed + state.customerGenerationRate
  );
  
  const { checkProgress, getStreakBonus } = useMissions();
  const eventsUpdate = useEvents(state => state.update);
  const getActiveMultipliers = useEvents(state => state.getActiveMultipliers);
  const adBoostsUpdate = useAdBoosts(state => state.update);
  const getAdRevenueMultiplier = useAdBoosts(state => state.getRevenueMultiplier);
  const getAdCustomerMultiplier = useAdBoosts(state => state.getCustomerMultiplier);
  const getAdSpeedMultiplier = useAdBoosts(state => state.getSpeedMultiplier);
  const totalBoostsUsed = useAdBoosts(state => state.totalBoostsUsed);
  
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
      adBoostsUpdate(deltaTime);
      
      if (hasPerk("accountant", 10) && totalTrips > lastCompoundCheck && totalTrips % 100 === 0) {
        incrementCompoundInterest();
        lastCompoundCheck = totalTrips;
      }
      
      const managerCustomerBonus = getCustomerRateBonus();
      const managerSpeedBonus = getSpeedBonus();
      const managerRevenueBonus = getRevenueBonus();
      const overclockMultiplier = overclockActive ? 1000 : 1;
      const eventMultipliers = getActiveMultipliers();
      const adRevenueBoost = getAdRevenueMultiplier();
      const adCustomerBoost = getAdCustomerMultiplier();
      const adSpeedBoost = getAdSpeedMultiplier();
      const streakBonus = getStreakBonus();
      
      const bonuses = {
        customerRate: (1 + managerCustomerBonus) * eventMultipliers.customers * adCustomerBoost - 1,
        speed: (1 + managerSpeedBonus) * overclockMultiplier * eventMultipliers.speed * adSpeedBoost * (1 + streakBonus.speedBonus) - 1,
        revenue: (1 + managerRevenueBonus) * eventMultipliers.revenue * adRevenueBoost * (1 + streakBonus.revenueBonus) - 1
      };
      
      const perks = {
        hasVIP: hasPerk("recruiter", 25),
        hasSlipstream: hasPerk("technician", 10),
        hasTimeShare: hasPerk("accountant", 25),
        hasTemporalBeacon: hasPerk("recruiter", 10)
      };
      
      update(deltaTime, bonuses, perks);
      
      checkProgress(totalEarned, totalTrips, totalManagerUpgrades, totalBoostsUsed, unlockedDestinations.length, timeMachineLevel, totalUpgradesPurchased);
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [update, getCustomerRateBonus, getSpeedBonus, getRevenueBonus, updatePerkTimers, hasPerk, overclockActive, incrementCompoundInterest, totalTrips, totalEarned, totalManagerUpgrades, totalBoostsUsed, unlockedDestinations, checkProgress, eventsUpdate, getActiveMultipliers, adBoostsUpdate, getAdRevenueMultiplier, getAdCustomerMultiplier, getAdSpeedMultiplier, timeMachineLevel, totalUpgradesPurchased, getStreakBonus]);
  
  return null;
}
