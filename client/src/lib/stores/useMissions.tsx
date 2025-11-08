import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type MissionType = "earn_coins" | "complete_trips" | "hire_manager" | "use_boosts" | "unlock_destination";

export interface Mission {
  id: string;
  type: MissionType;
  description: string;
  progress: number;
  target: number;
  reward: number;
  icon: string;
}

interface MissionsState {
  missions: Mission[];
  completedMissionIds: string[];
  nextMissionId: number;
  
  generateMission: () => Mission;
  checkProgress: (coinsEarned: number, tripsCompleted: number, managersHired: number, boostsUsed: number, destinationsUnlocked: number) => void;
  completeMission: (missionId: string) => void;
  initializeMissions: () => void;
}

const MISSION_TEMPLATES = [
  {
    type: "earn_coins" as MissionType,
    descriptionTemplate: (target: number) => `Earn ${formatShortNumber(target)} ChronoCoins`,
    targetRange: [500, 50000],
    rewardMultiplier: 0.2,
    icon: "💰"
  },
  {
    type: "complete_trips" as MissionType,
    descriptionTemplate: (target: number) => `Complete ${target} time travel trips`,
    targetRange: [5, 100],
    rewardMultiplier: 50,
    icon: "🚀"
  },
  {
    type: "hire_manager" as MissionType,
    descriptionTemplate: (target: number) => `Hire or upgrade any manager ${target} times`,
    targetRange: [1, 10],
    rewardMultiplier: 200,
    icon: "👔"
  },
  {
    type: "use_boosts" as MissionType,
    descriptionTemplate: (target: number) => `Use Click Boost ${target} times`,
    targetRange: [2, 20],
    rewardMultiplier: 30,
    icon: "⚡"
  },
  {
    type: "unlock_destination" as MissionType,
    descriptionTemplate: (target: number) => `Unlock ${target} new ${target === 1 ? "destination" : "destinations"}`,
    targetRange: [1, 3],
    rewardMultiplier: 500,
    icon: "🌍"
  }
];

function formatShortNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export const useMissions = create<MissionsState>()(
  subscribeWithSelector((set, get) => ({
    missions: [],
    completedMissionIds: [],
    nextMissionId: 0,
    
    generateMission: () => {
      const state = get();
      const template = MISSION_TEMPLATES[Math.floor(Math.random() * MISSION_TEMPLATES.length)];
      
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
      
      set({ nextMissionId: state.nextMissionId + 1 });
      
      return mission;
    },
    
    checkProgress: (coinsEarned, tripsCompleted, managersHired, boostsUsed, destinationsUnlocked) => {
      const state = get();
      
      const missionsToComplete: string[] = [];
      const updatedMissions = state.missions.map(mission => {
        let newProgress = mission.progress;
        
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
        }
        
        if (newProgress >= mission.target && !state.completedMissionIds.includes(mission.id)) {
          missionsToComplete.push(mission.id);
        }
        
        return { ...mission, progress: Math.min(newProgress, mission.target) };
      });
      
      set({ missions: updatedMissions });
      
      missionsToComplete.forEach(id => {
        state.completeMission(id);
      });
    },
    
    completeMission: (missionId) => {
      const state = get();
      const mission = state.missions.find(m => m.id === missionId);
      
      if (!mission) return;
      
      const idleGame = (window as any).__idleGameStore;
      if (idleGame) {
        idleGame.getState().addChronocoins(mission.reward);
      }
      
      set({
        completedMissionIds: [...state.completedMissionIds, missionId],
        missions: state.missions.filter(m => m.id !== missionId)
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
