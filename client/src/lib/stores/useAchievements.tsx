import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (stats: GameStats) => boolean;
  reward: number;
  icon: string;
}

export interface GameStats {
  totalCustomersServed: number;
  totalEarned: number;
  timeMachineLevel: number;
  unlockedDestinationsCount: number;
  prestigeLevel: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_customer",
    name: "First Voyage",
    description: "Transport your first customer",
    condition: (stats) => stats.totalCustomersServed >= 1,
    reward: 50,
    icon: "🚀"
  },
  {
    id: "hundred_customers",
    name: "Time Tourist Guide",
    description: "Transport 100 customers",
    condition: (stats) => stats.totalCustomersServed >= 100,
    reward: 500,
    icon: "👥"
  },
  {
    id: "thousand_customers",
    name: "Master of Time",
    description: "Transport 1,000 customers",
    condition: (stats) => stats.totalCustomersServed >= 1000,
    reward: 5000,
    icon: "⏰"
  },
  {
    id: "first_10k",
    name: "Getting Rich",
    description: "Earn 10,000 ChronoCoins",
    condition: (stats) => stats.totalEarned >= 10000,
    reward: 1000,
    icon: "💰"
  },
  {
    id: "first_100k",
    name: "Tycoon",
    description: "Earn 100,000 ChronoCoins",
    condition: (stats) => stats.totalEarned >= 100000,
    reward: 10000,
    icon: "💎"
  },
  {
    id: "machine_level_10",
    name: "Tech Pioneer",
    description: "Upgrade time machine to level 10",
    condition: (stats) => stats.timeMachineLevel >= 10,
    reward: 2000,
    icon: "⚙️"
  },
  {
    id: "all_destinations",
    name: "Time Explorer",
    description: "Unlock all time destinations",
    condition: (stats) => stats.unlockedDestinationsCount >= 10,
    reward: 15000,
    icon: "🌍"
  },
  {
    id: "first_prestige",
    name: "Reset Master",
    description: "Prestige for the first time",
    condition: (stats) => stats.prestigeLevel >= 1,
    reward: 5000,
    icon: "⭐"
  }
];

interface AchievementState {
  unlockedAchievements: string[];
  
  checkAchievements: (stats: GameStats) => Achievement[];
  unlockAchievement: (achievementId: string) => void;
  isUnlocked: (achievementId: string) => boolean;
  getUnlockedCount: () => number;
}

export const useAchievements = create<AchievementState>()(
  subscribeWithSelector((set, get) => ({
    unlockedAchievements: [],
    
    checkAchievements: (stats) => {
      const state = get();
      const newlyUnlocked: Achievement[] = [];
      
      ACHIEVEMENTS.forEach(achievement => {
        if (!state.unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
          newlyUnlocked.push(achievement);
          state.unlockAchievement(achievement.id);
        }
      });
      
      return newlyUnlocked;
    },
    
    unlockAchievement: (achievementId) => {
      set((state) => {
        if (state.unlockedAchievements.includes(achievementId)) {
          return {};
        }
        return {
          unlockedAchievements: [...state.unlockedAchievements, achievementId]
        };
      });
    },
    
    isUnlocked: (achievementId) => {
      return get().unlockedAchievements.includes(achievementId);
    },
    
    getUnlockedCount: () => {
      return get().unlockedAchievements.length;
    }
  }))
);
