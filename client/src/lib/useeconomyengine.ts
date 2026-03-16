import { useIdleGame } from "./stores/useIdleGame";
import { useManagers } from "./stores/useManagers";
import { getPrestigeRequirements } from "./utils";

export type BottleneckType = "speed" | "capacity" | "customerRate" | "none";
export type RecommendationKey =
  | "timeMachine"
  | "capacity"
  | "speed"
  | "customerRate"
  | "buyMachine"
  | "prestige"
  | "any";

export interface UpgradeROI {
  label: string;
  cost: number;
  projectedGainPerSec: number;
  paybackSeconds: number;
  efficiency: number;
}

export interface EconomyEngineResult {
  coinsPerSecond: number;
  tripsPerMinute: number;
  revenuePerTrip: number;
  bottleneck: BottleneckType;
  bottleneckLabel: string;
  bottleneckShortLabel: string;
  recommendation: string;
  recommendationKey: RecommendationKey;
  recommendationReason: string;
  upgrades: {
    timeMachine: UpgradeROI;
    capacity: UpgradeROI;
    speed: UpgradeROI;
    customerRate: UpgradeROI;
    buyMachine: UpgradeROI;
  };
}

function capPayback(cost: number, gainPerSec: number): number {
  if (gainPerSec <= 0) return 9999;
  return Math.min(9999, Math.round(cost / gainPerSec));
}

export function useEconomyEngine(): EconomyEngineResult {
  const {
    coinsPerSecond,
    timeMachineLevel,
    timeMachineCapacity,
    timeMachineSpeed,
    timeMachineCount,
    waitingCustomers,
    processingCustomers,
    totalEarned,
    prestigeLevel,
    getTimeMachineUpgradeCost,
    getCapacityUpgradeCost,
    getSpeedUpgradeCost,
    getCustomerRateUpgradeCost,
    getTimeMachineBuyCost,
    getCurrentFare,
  } = useIdleGame();

  // Subscribe so hook updates with manager changes
  useManagers();

  const currentFare = getCurrentFare();
  const speedMultiplier = Math.max(1, timeMachineSpeed);
  const tripDurationMs = Math.max(500, 3000 / speedMultiplier);
  const tripsPerMinute = 60000 / tripDurationMs;
  const revenuePerTrip = currentFare * timeMachineCapacity;

  // ---- Bottleneck detection ----
  let bottleneck: BottleneckType = "none";
  let bottleneckLabel = "";
  let bottleneckShortLabel = "Balanced";

  if (waitingCustomers > processingCustomers * 2) {
    bottleneck = "speed";
    bottleneckLabel = "Trips finishing too slowly - upgrade Speed";
    bottleneckShortLabel = "Speed";
  } else if (processingCustomers < timeMachineCapacity * 0.5) {
    bottleneck = "customerRate";
    bottleneckLabel = "Machines not filling - upgrade Customer Rate";
    bottleneckShortLabel = "Customer Rate";
  } else if (processingCustomers >= timeMachineCapacity * 0.9) {
    bottleneck = "capacity";
    bottleneckLabel = "Machines always full - upgrade Capacity";
    bottleneckShortLabel = "Capacity";
  }

  // ---- ROI calculations (per 1 unit) ----
  const qty = 1;

  // Time Machine level (fare scales with level)
  const tmCost = getTimeMachineUpgradeCost(qty);
  const baseFarePerLevel = currentFare / Math.max(1, timeMachineLevel);
  const tmGainPerSec = baseFarePerLevel * timeMachineCapacity * (tripsPerMinute / 60);
  const tmPayback = capPayback(tmCost, tmGainPerSec);

  // Capacity
  const capCost = getCapacityUpgradeCost(qty);
  const capGainPerSec = currentFare * qty * (tripsPerMinute / 60);
  const capPaybackSecs = capPayback(capCost, capGainPerSec);

  // Speed
  const speedCost = getSpeedUpgradeCost(qty);
  const speedGainPerSec = coinsPerSecond * (qty / (speedMultiplier + qty)) * 0.4;
  const speedPaybackSecs = capPayback(speedCost, speedGainPerSec);

  // Customer Rate
  const crCost = getCustomerRateUpgradeCost(qty);
  const crGainPerSec = currentFare * qty * 0.25 * (tripsPerMinute / 60);
  const crPaybackSecs = capPayback(crCost, crGainPerSec);

  // Buy Machine
  const buyMachineCost = getTimeMachineBuyCost(1);
  const buyMachineGainPerSec = coinsPerSecond * 0.7;
  const buyMachinePayback = capPayback(buyMachineCost, buyMachineGainPerSec);

  const upgrades = {
    timeMachine: {
      label: "Time Machine Level",
      cost: tmCost,
      projectedGainPerSec: tmGainPerSec,
      paybackSeconds: tmPayback,
      efficiency: tmGainPerSec / Math.max(1, tmCost),
    },
    capacity: {
      label: "Capacity",
      cost: capCost,
      projectedGainPerSec: capGainPerSec,
      paybackSeconds: capPaybackSecs,
      efficiency: capGainPerSec / Math.max(1, capCost),
    },
    speed: {
      label: "Speed",
      cost: speedCost,
      projectedGainPerSec: speedGainPerSec,
      paybackSeconds: speedPaybackSecs,
      efficiency: speedGainPerSec / Math.max(1, speedCost),
    },
    customerRate: {
      label: "Customer Generation",
      cost: crCost,
      projectedGainPerSec: crGainPerSec,
      paybackSeconds: crPaybackSecs,
      efficiency: crGainPerSec / Math.max(1, crCost),
    },
    buyMachine: {
      label: "Time Machines",
      cost: buyMachineCost,
      projectedGainPerSec: buyMachineGainPerSec,
      paybackSeconds: buyMachinePayback,
      efficiency: buyMachineGainPerSec / Math.max(1, buyMachineCost),
    },
  };

  // ---- Recommendation with tie-breaking ----
  const coreUpgrades: [RecommendationKey, UpgradeROI][] = [
    ["timeMachine", upgrades.timeMachine],
    ["capacity", upgrades.capacity],
    ["speed", upgrades.speed],
    ["customerRate", upgrades.customerRate],
  ];
  const sorted = [...coreUpgrades].sort((a, b) => b[1].efficiency - a[1].efficiency);
  const top1 = sorted[0];
  const top2 = sorted[1];
  const isRoiTied =
    top2 && top1[1].efficiency > 0 &&
    Math.abs(top1[1].efficiency - top2[1].efficiency) / top1[1].efficiency < 0.1;

  let recommendationKey: RecommendationKey = "timeMachine";
  let recommendation = "Time Machine Level";
  let recommendationReason = "Level up for better fares";

  const { earnReq: prestigeEarnReq } = getPrestigeRequirements(prestigeLevel);

  if (timeMachineCount === 1) {
    recommendationKey = "buyMachine";
    recommendation = "Buy a 2nd Time Machine";
    recommendationReason = "More machines = more output";
  } else if (bottleneck === "speed") {
    recommendationKey = "speed";
    recommendation = "Speed";
    recommendationReason = "Speed is the bottleneck - trips finishing too slow";
  } else if (bottleneck === "capacity") {
    recommendationKey = "capacity";
    recommendation = "Capacity";
    recommendationReason = "Machines are always full - add capacity";
  } else if (bottleneck === "customerRate") {
    recommendationKey = "customerRate";
    recommendation = "Customer Generation";
    recommendationReason = "Customers not filling machines - increase rate";
  } else if (timeMachineLevel < 10) {
    recommendationKey = "timeMachine";
    recommendation = "Time Machine Level";
    recommendationReason = "Level up for better fares";
  } else if (isRoiTied && bottleneck === "none") {
    recommendationKey = "any";
    recommendation = "Any core upgrade";
    recommendationReason = "ROI roughly equal - any core upgrade works";
  } else {
    recommendationKey = top1[0] as RecommendationKey;
    recommendation = top1[1].label;
    recommendationReason = "Best payback ratio";
  }

  // Prestige override (lower priority)
  if (
    totalEarned > prestigeEarnReq * 0.8 &&
    recommendationKey !== "buyMachine"
  ) {
    recommendationKey = "prestige";
    recommendation = "Prestige";
    recommendationReason = "Approaching prestige threshold";
  }

  return {
    coinsPerSecond,
    tripsPerMinute,
    revenuePerTrip,
    bottleneck,
    bottleneckLabel,
    bottleneckShortLabel,
    recommendation,
    recommendationKey,
    recommendationReason,
    upgrades,
  };
}
