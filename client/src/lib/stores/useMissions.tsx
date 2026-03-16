import { create } from "zustand";
import { subscribeWithSelector, persist } from "zustand/middleware";
import { formatChronoValue } from "@/lib/utils";

export type MissionType = "earn_coins" | "complete_trips" | "hire_manager" | "use_boosts" | "unlock_destination" | "earn_in_time" | "upgrade_machine" | "reach_level" | "visit_destination";

export interface Mission {
  id: string;
  type: MissionType;
  description: string;
  progress: number;
  target: number;
  reward: number;
  icon: string;
  timeLimit?: number;
  startedAt?: number;
  baselineCoins?: number;
  baselineUpgrades?: number;
  baselineTrips?: number;
}

interface MissionsState {
  missions: Mission[];
  completedMissionIds: string[];
  nextMissionId: number;
  missionStreak: number;
  lastMissionCompletedAt: number;
  rerollsAvailable: number;

  generateMission: (excludeTypes?: MissionType[]) => Mission;
  checkProgress: (coinsEarned: number, tripsCompleted: number, managersHired: number, boostsUsed: number, destinationsUnlocked: number, machineLevel: number, totalUpgrades: number) => void;
  completeMission: (missionId: string) => void;
  initializeMissions: () => void;
  getStreakBonus: () => { revenueBonus: number; speedBonus: number };
  updateStreak: () => void;
  rerollMission: (missionId: string) => void;
}

const MISSION_TEMPLATES = [
  {
    type: "earn_coins" as MissionType,
    descriptionTemplate: (target: number) => `Earn ${formatChronoValue(target)} ChronoCoins`,
    baseTarget: 500,
    targetScalePerLevel: 150,
    rewardMultiplier: 0.3,
    icon: "CC",
    weight: 3
  },
  {
    type: "complete_trips" as MissionType,
    descriptionTemplate: (target: number) => `Complete ${target} time travel trips`,
    baseTarget: 5,
    targetScalePerLevel: 3,
    rewardMultiplier: 75,
    icon: "Trip",
    weight: 3
  },
  {
    type: "hire_manager" as MissionType,
    descriptionTemplate: (target: number) => `Upgrade any manager ${target} time${target > 1 ? "s" : ""}`,
    baseTarget: 1,
    targetScalePerLevel: 1,
    rewardMultiplier: 300,
    icon: "Mgr",
    weight: 2
  },
  {
    type: "use_boosts" as MissionType,
    descriptionTemplate: (target: number) => `Use click boosts ${target} time${target > 1 ? "s" : ""}`,
    baseTarget: 2,
    targetScalePerLevel: 1,
    rewardMultiplier: 50,
    icon: "Tap",
    weight: 2
  },
  {
    type: "unlock_destination" as MissionType,
    descriptionTemplate: (target: number) => `Unlock ${target} new destination${target > 1 ? "s" : ""}`,
    baseTarget: 1,
    targetScalePerLevel: 0,
    rewardMultiplier: 800,
    icon: "Era",
    weight: 1
  },
  {
    type: "earn_in_time" as MissionType,
    descriptionTemplate: (target: number) => `Earn ${formatChronoValue(target)} coins in 5 minutes`,
    baseTarget: 1000,
    targetScalePerLevel: 400,
    rewardMultiplier: 0.5,
    icon: "Rush",
    weight: 2,
    timed: true
  },
  {
    type: "upgrade_machine" as MissionType,
    descriptionTemplate: (target: number) => `Buy ${target} upgrade${target > 1 ? "s" : ""} of any type`,
    baseTarget: 3,
    targetScalePerLevel: 2,
    rewardMultiplier: 100,
    icon: "Up",
    weight: 3
  },
  {
    type: "reach_level" as MissionType,
    descriptionTemplate: (target: number) => `Reach time machine level ${target}`,
    baseTarget: 5,
    targetScalePerLevel: 4,
    rewardMultiplier: 200,
    icon: "Lv",
    weight: 1
  },
  {
    type: "visit_destination" as MissionType,
    descriptionTemplate: (target: number) => `Complete ${target} trips at current destination`,
    baseTarget: 10,
    targetScalePerLevel: 5,
    rewardMultiplier: 60,
    icon: "Map",
    weight: 2
  }
];

const STREAK_DECAY_TIME = 30 * 60 * 1000;

// Pick a template excluding already-active types, with weighted randomness
function selectTemplate(excludeTypes: MissionType[] = []) {
  const available = MISSION_TEMPLATES.filter(t => !excludeTypes.includes(t.type));
  const pool = available.length > 0 ? available : MISSION_TEMPLATES;
  const totalWeight = pool.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * totalWeight;
  for (const template of pool) {
    random -= template.weight;
    if (random <= 0) return template;
  }
  return pool[0];
}

// Scale target based on how many missions have been completed (progression)
function scaledTarget(template: typeof MISSION_TEMPLATES[0], completedCount: number): number {
  const scale = Math.floor(completedCount / 3); // ramp every 3 completions
  const base = template.baseTarget + template.targetScalePerLevel * scale;
  // Add some randomness (±25%)
  const jitter = 0.75 + Math.random() * 0.5;
  return Math.max(1, Math.floor(base * jitter));
}

export const useMissions = create<MissionsState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      missions: [],
      completedMissionIds: [],
      nextMissionId: 0,
      missionStreak: 0,
      lastMissionCompletedAt: 0,
      rerollsAvailable: 1,

      updateStreak: () => {
        const state = get();
        const now = Date.now();
        if (state.lastMissionCompletedAt > 0 && now - state.lastMissionCompletedAt > STREAK_DECAY_TIME) {
          set({ missionStreak: 0 });
        }
      },

      rerollMission: (missionId) => {
        const state = get();
        if (state.rerollsAvailable <= 0) return;
        const remaining = state.missions.filter(m => m.id !== missionId);
        const activeTypes = remaining.map(m => m.type);
        const newMission = state.generateMission(activeTypes);
        set({
          missions: [...remaining, newMission],
          rerollsAvailable: state.rerollsAvailable - 1,
        });
      },

      getStreakBonus: () => {
        const state = get();
        state.updateStreak();
        const streak = state.missionStreak;
        return {
          revenueBonus: Math.min(streak * 0.05, 0.5),
          speedBonus: Math.min(streak * 0.05, 0.5),
        };
      },

      generateMission: (excludeTypes: MissionType[] = []) => {
        const state = get();
        const template = selectTemplate(excludeTypes);
        const target = scaledTarget(template, state.completedMissionIds.length);
        const reward = Math.max(10, Math.floor(target * template.rewardMultiplier));

        const mission: Mission = {
          id: `mission-${state.nextMissionId}`,
          type: template.type,
          description: template.descriptionTemplate(target),
          progress: 0,
          target,
          reward,
          icon: template.icon,
        };

        const idleGame = (window as any).__idleGameStore;

        if ((template as any).timed) {
          mission.timeLimit = 5 * 60 * 1000;
          mission.startedAt = Date.now();
          if (idleGame && template.type === "earn_in_time") {
            mission.baselineCoins = idleGame.getState().totalEarned || 0;
          }
        }

        if (template.type === "upgrade_machine" && idleGame) {
          const gs = idleGame.getState();
          mission.baselineUpgrades = (gs.timeMachineCapacity || 0) + (gs.timeMachineSpeed || 0) + (gs.customerGenerationRate || 0);
        }

        if (template.type === "visit_destination" && idleGame) {
          const gs = idleGame.getState();
          mission.baselineTrips = gs.totalTripsCompleted || 0;
        }

        set({ nextMissionId: state.nextMissionId + 1 });
        return mission;
      },

      checkProgress: (coinsEarned, tripsCompleted, managersHired, boostsUsed, destinationsUnlocked, machineLevel, totalUpgrades) => {
        const state = get();
        const missionsToComplete: string[] = [];
        const expiredMissions: string[] = [];
        const now = Date.now();

        const updatedMissions = state.missions.map(mission => {
          let newProgress = mission.progress;

          if (mission.timeLimit && mission.startedAt && now - mission.startedAt > mission.timeLimit) {
            expiredMissions.push(mission.id);
            return mission;
          }

          switch (mission.type) {
            case "earn_coins":      newProgress = coinsEarned; break;
            case "complete_trips":  newProgress = tripsCompleted; break;
            case "hire_manager":    newProgress = managersHired; break;
            case "use_boosts":      newProgress = boostsUsed; break;
            case "unlock_destination": newProgress = destinationsUnlocked; break;
            case "earn_in_time":
              if (mission.baselineCoins !== undefined) newProgress = coinsEarned - mission.baselineCoins;
              break;
            case "upgrade_machine":
              if (mission.baselineUpgrades !== undefined) newProgress = totalUpgrades - mission.baselineUpgrades;
              break;
            case "reach_level":     newProgress = machineLevel; break;
            case "visit_destination":
              if (mission.baselineTrips !== undefined) newProgress = tripsCompleted - mission.baselineTrips;
              break;
          }

          if (newProgress >= mission.target && !state.completedMissionIds.includes(mission.id)) {
            missionsToComplete.push(mission.id);
          }

          return { ...mission, progress: Math.min(newProgress, mission.target) };
        });

        if (expiredMissions.length > 0) {
          const remaining = updatedMissions.filter(m => !expiredMissions.includes(m.id));
          const activeTypes = remaining.map(m => m.type);
          expiredMissions.forEach(() => remaining.push(state.generateMission(activeTypes)));
          set({ missions: remaining });
        } else {
          const changed = updatedMissions.some((m, i) => m.progress !== state.missions[i]?.progress);
          if (changed) set({ missions: updatedMissions });
        }

        missionsToComplete.forEach(id => state.completeMission(id));
      },

      completeMission: (missionId) => {
        const state = get();
        const mission = state.missions.find(m => m.id === missionId);
        if (!mission) return;

        const now = Date.now();
        state.updateStreak();
        const newStreak = now - state.lastMissionCompletedAt < STREAK_DECAY_TIME ? state.missionStreak + 1 : 1;

        const idleGame = (window as any).__idleGameStore;
        if (idleGame) idleGame.getState().addChronocoins(mission.reward);

        const remaining = state.missions.filter(m => m.id !== missionId);
        const activeTypes = remaining.map(m => m.type);

        const completedMission = state.missions.find(m => m.id === missionId);
        // Chains cannot spawn more chains (one follow-up layer only)
        const isChain = Math.random() < 0.2 && completedMission?.icon !== "⛓️";
        const newMission = isChain
          ? (() => {
              if (!completedMission) return state.generateMission(activeTypes);
              const completed = completedMission;
              const chainTarget = Math.floor(completed.target * 2);
              const chainReward = Math.floor(completed.reward * 3);
              return {
                ...state.generateMission(activeTypes),
                type: completed.type,
                description: `[CHAIN] ${completed.description.replace(/\d[\d,.]*/g, String(chainTarget))}`,
                target: chainTarget,
                reward: chainReward,
                progress: 0,
                icon: "⛓️",
              };
            })()
          : state.generateMission(activeTypes);

        set({
          completedMissionIds: [...state.completedMissionIds, missionId],
          missions: [...remaining, newMission],
          missionStreak: newStreak,
          lastMissionCompletedAt: now,
          rerollsAvailable: Math.min(3, state.rerollsAvailable + 1),
        });
      },

      initializeMissions: () => {
        const state = get();
        // Detect any missions with garbled icons (non-ASCII) and regenerate all
        const hasGarbled = state.missions.some(m => /[^\x00-\x7F]/.test(m.icon));
        if (state.missions.length === 0 || hasGarbled) {
          const missions: Mission[] = [];
          const usedTypes: MissionType[] = [];
          for (let i = 0; i < 3; i++) {
            const m = state.generateMission(usedTypes);
            missions.push(m);
            usedTypes.push(m.type);
          }
          set({ missions });
        }
      },
    })),
    { name: "chronotransit-missions" }
  )
);
