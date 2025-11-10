import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { formatChronoValue } from "@/lib/utils";

export type MissionType = "earn_coins" | "complete_trips" | "hire_manager" | "use_boosts" | "unlock_destination" | "earn_in_time" | "upgrade_machine" | "reach_level";

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
}

interface MissionsState {
  missions: Mission[];
  completedMissionIds: string[];
  nextMissionId: number;
  missionStreak: number;
  lastMissionCompletedAt: number;
  
  generateMission: () => Mission;
  checkProgress: (coinsEarned: number, tripsCompleted: number, managersHired: number, boostsUsed: number, destinationsUnlocked: number, machineLevel: number, totalUpgrades: number) => void;
  completeMission: (missionId: string) => void;
  initializeMissions: () => void;
  getStreakBonus: () => { revenueBonus: number; speedBonus: number };
  updateStreak: () => void;
}

const MISSION_TEMPLATES = [
  {
    type: "earn_coins" as MissionType,
    descriptionTemplate: (target: number) => `Earn ${formatChronoValue(target)} ChronoCoins`,
    targetRange: [500, 50000],
    rewardMultiplier: 0.3,
    icon: "💰",
    weight: 3
  },
  {
    type: "complete_trips" as MissionType,
    descriptionTemplate: (target: number) => `Complete ${target} time travel trips`,
    targetRange: [5, 100],
    rewardMultiplier: 75,
    icon: "🚀",
    weight: 3
  },
  {
    type: "hire_manager" as MissionType,
    descriptionTemplate: (target: number) => `Hire or upgrade any manager ${target} times`,
    targetRange: [1, 10],
    rewardMultiplier: 300,
    icon: "👔",
    weight: 2
  },
  {
    type: "use_boosts" as MissionType,
    descriptionTemplate: (target: number) => `Use Click Boost ${target} times`,
    targetRange: [2, 20],
    rewardMultiplier: 50,
    icon: "⚡",
    weight: 3
  },
  {
    type: "unlock_destination" as MissionType,
    descriptionTemplate: (target: number) => `Unlock ${target} new ${target === 1 ? "destination" : "destinations"}`,
    targetRange: [1, 3],
    rewardMultiplier: 800,
    icon: "🌍",
    weight: 1
  },
  {
    type: "earn_in_time" as MissionType,
    descriptionTemplate: (target: number) => `Earn ${formatChronoValue(target)} coins in 5 minutes`,
    targetRange: [1000, 25000],
    rewardMultiplier: 0.5,
    icon: "⏱️",
    weight: 2,
    timed: true
  },
  {
    type: "upgrade_machine" as MissionType,
    descriptionTemplate: (target: number) => `Purchase ${target} upgrades (any type)`,
    targetRange: [3, 25],
    rewardMultiplier: 100,
    icon: "⬆️",
    weight: 3
  },
  {
    type: "reach_level" as MissionType,
    descriptionTemplate: (target: number) => `Reach time machine level ${target}`,
    targetRange: [5, 30],
    rewardMultiplier: 200,
    icon: "🎯",
    weight: 1
  }
];

const STREAK_DECAY_TIME = 30 * 60 * 1000;

function selectWeightedTemplate() {
  const totalWeight = MISSION_TEMPLATES.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const template of MISSION_TEMPLATES) {
    random -= template.weight;
    if (random <= 0) {
      return template;
    }
  }
  
  return MISSION_TEMPLATES[0];
}

export const useMissions = create<MissionsState>()(
  subscribeWithSelector((set, get) => ({
    missions: [],
    completedMissionIds: [],
    nextMissionId: 0,
    missionStreak: 0,
    lastMissionCompletedAt: 0,
    
    updateStreak: () => {
      const state = get();
      const now = Date.now();
      
      if (state.lastMissionCompletedAt > 0 && now - state.lastMissionCompletedAt > STREAK_DECAY_TIME) {
        set({ missionStreak: 0 });
      }
    },
    
    getStreakBonus: () => {
      const state = get();
      state.updateStreak();
      
      const streak = state.missionStreak;
      const revenueBonus = Math.min(streak * 0.05, 0.5);
      const speedBonus = Math.min(streak * 0.05, 0.5);
      
      return { revenueBonus, speedBonus };
    },
    
    generateMission: () => {
      const state = get();
      const template = selectWeightedTemplate();
      
      const minTarget = template.targetRange[0];
      const maxTarget = template.targetRange[1];
      const target = Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget;
      
      const reward = Math.floor(target * template.rewardMultiplier);
      
      const mission: Mission = {
        id: `mission-${state.nextMissionId}`,
        type: template.type,
        description: template.descriptionTemplate(target),
        progress: 0,
        target,
        reward,
        icon: template.icon
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
        const state = idleGame.getState();
        mission.baselineUpgrades = (state.timeMachineCapacity || 0) + (state.timeMachineSpeed || 0) + (state.customerGenerationRate || 0);
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
          case "earn_coins":
            newProgress = coinsEarned;
            break;
          case "complete_trips":
            newProgress = tripsCompleted;
            break;
          case "hire_manager":
            newProgress = managersHired;
            break;
          case "use_boosts":
            newProgress = boostsUsed;
            break;
          case "unlock_destination":
            newProgress = destinationsUnlocked;
            break;
          case "earn_in_time":
            if (mission.baselineCoins !== undefined) {
              newProgress = coinsEarned - mission.baselineCoins;
            }
            break;
          case "upgrade_machine":
            if (mission.baselineUpgrades !== undefined) {
              newProgress = totalUpgrades - mission.baselineUpgrades;
            }
            break;
          case "reach_level":
            newProgress = machineLevel;
            break;
        }
        
        if (newProgress >= mission.target && !state.completedMissionIds.includes(mission.id)) {
          missionsToComplete.push(mission.id);
        }
        
        return { ...mission, progress: Math.min(newProgress, mission.target) };
      });
      
      if (expiredMissions.length > 0) {
        const remainingMissions = updatedMissions.filter(m => !expiredMissions.includes(m.id));
        expiredMissions.forEach(() => {
          remainingMissions.push(state.generateMission());
        });
        set({ missions: remainingMissions });
      } else {
        set({ missions: updatedMissions });
      }
      
      missionsToComplete.forEach(id => {
        state.completeMission(id);
      });
    },
    
    completeMission: (missionId) => {
      const state = get();
      const mission = state.missions.find(m => m.id === missionId);
      
      if (!mission) return;
      
      const now = Date.now();
      state.updateStreak();
      
      const newStreak = now - state.lastMissionCompletedAt < STREAK_DECAY_TIME ? state.missionStreak + 1 : 1;
      
      const idleGame = (window as any).__idleGameStore;
      if (idleGame) {
        idleGame.getState().addChronocoins(mission.reward);
      }
      
      set({
        completedMissionIds: [...state.completedMissionIds, missionId],
        missions: state.missions.filter(m => m.id !== missionId),
        missionStreak: newStreak,
        lastMissionCompletedAt: now
      });
      
      const newMission = state.generateMission();
      set({
        missions: [...state.missions.filter(m => m.id !== missionId), newMission]
      });
    },
    
    initializeMissions: () => {
      const state = get();
      
      if (state.missions.length === 0) {
        const initialMissions = [];
        for (let i = 0; i < 3; i++) {
          initialMissions.push(state.generateMission());
        }
        set({ missions: initialMissions });
      }
    }
  }))
);
