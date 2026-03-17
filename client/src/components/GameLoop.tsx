import { useEffect, useRef } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useManagers } from "@/lib/stores/useManagers";
import { useMissions } from "@/lib/stores/useMissions";
import { useEvents } from "@/lib/stores/useEvents";
import { useAdBoosts } from "@/lib/stores/useAdBoosts";

export function GameLoop() {
  // Only subscribe to primitive values that should restart the loop when they change.
  // Function refs from stores must NOT be in the dep array - store setState creates new
  // function refs and causes the rAF loop to tear down and restart (freeze).
  const totalTrips = useIdleGame(state => state.totalTripsCompleted);
  const totalEarned = useIdleGame(state => state.totalEarned);
  const totalManagerUpgrades = useIdleGame(state => state.totalManagerUpgrades);
  const timeMachineLevel = useIdleGame(state => state.timeMachineLevel);
  const unlockedDestinationsLen = useIdleGame(state => state.unlockedDestinations.length);
  const totalUpgradesPurchased = useIdleGame(state =>
    state.timeMachineCapacity + state.timeMachineSpeed + state.customerGenerationRate
  );
  const totalBoostsUsed = useAdBoosts(state => state.totalBoostsUsed);
  const overclockActive = useManagers(state => state.overclockActive);

  // Keep refs so the loop always reads current values without being in the dep array
  const totalTripsRef = useRef(totalTrips);
  const totalEarnedRef = useRef(totalEarned);
  const totalManagerUpgradesRef = useRef(totalManagerUpgrades);
  const timeMachineLevelRef = useRef(timeMachineLevel);
  const unlockedDestLenRef = useRef(unlockedDestinationsLen);
  const totalUpgradesRef = useRef(totalUpgradesPurchased);
  const totalBoostsRef = useRef(totalBoostsUsed);

  useEffect(() => { totalTripsRef.current = totalTrips; }, [totalTrips]);
  useEffect(() => { totalEarnedRef.current = totalEarned; }, [totalEarned]);
  useEffect(() => { totalManagerUpgradesRef.current = totalManagerUpgrades; }, [totalManagerUpgrades]);
  useEffect(() => { timeMachineLevelRef.current = timeMachineLevel; }, [timeMachineLevel]);
  useEffect(() => { unlockedDestLenRef.current = unlockedDestinationsLen; }, [unlockedDestinationsLen]);
  useEffect(() => { totalUpgradesRef.current = totalUpgradesPurchased; }, [totalUpgradesPurchased]);
  useEffect(() => { totalBoostsRef.current = totalBoostsUsed; }, [totalBoostsUsed]);

  useEffect(() => {
    let lastTime = Date.now();
    let animationFrameId: number;
    let lastCompoundCheck = 0;

    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Read functions directly from store singletons - safe, no stale closure risk
      const managers = useManagers.getState();
      const missions = useMissions.getState();
      const events = useEvents.getState();
      const adBoosts = useAdBoosts.getState();
      const idleGame = useIdleGame.getState();

      managers.updatePerkTimers(deltaTime);
      events.update(deltaTime);
      adBoosts.update(deltaTime);

      const trips = totalTripsRef.current;
      if (managers.hasPerk("accountant", 10) && trips > lastCompoundCheck && trips % 100 === 0) {
        managers.incrementCompoundInterest();
        lastCompoundCheck = trips;
      }

      const managerCustomerBonus = managers.getCustomerRateBonus();
      const managerSpeedBonus = managers.getSpeedBonus();
      const managerRevenueBonus = managers.getRevenueBonus();
      const overclockMultiplier = managers.overclockActive ? 1000 : 1;
      const eventMultipliers = events.getActiveMultipliers();
      const adRevenueBoost = adBoosts.getRevenueMultiplier();
      const adCustomerBoost = adBoosts.getCustomerMultiplier();
      const adSpeedBoost = adBoosts.getSpeedMultiplier();
      const streakBonus = missions.getStreakBonus();

      const bonuses = {
        customerRate: (1 + managerCustomerBonus) * eventMultipliers.customers * adCustomerBoost - 1,
        speed: (1 + managerSpeedBonus) * overclockMultiplier * eventMultipliers.speed * adSpeedBoost * (1 + streakBonus.speedBonus) - 1,
        revenue: (1 + managerRevenueBonus) * eventMultipliers.revenue * adRevenueBoost * (1 + streakBonus.revenueBonus) - 1,
      };

      const perks = {
        hasVIP: managers.hasPerk("recruiter", 25),
        hasSlipstream: managers.hasPerk("technician", 10),
        hasTimeShare: managers.hasPerk("accountant", 25),
        hasTemporalBeacon: managers.hasPerk("recruiter", 10),
      };

      idleGame.update(deltaTime, bonuses, perks);

      missions.checkProgress(
        totalEarnedRef.current,
        totalTripsRef.current,
        totalManagerUpgradesRef.current,
        totalBoostsRef.current,
        unlockedDestLenRef.current,
        timeMachineLevelRef.current,
        totalUpgradesRef.current
      );

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  // Empty dep array: loop starts once, never restarts. Refs keep values current.
  // Store setState (from profile load, etc.) will NOT trigger loop restart.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
