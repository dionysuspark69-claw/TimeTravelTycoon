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
    reward: 2000,
    icon: "⏰"
  },
  {
    id: "ten_thousand_customers",
    name: "Chrono Legend",
    description: "Transport 10,000 customers",
    condition: (stats) => stats.totalCustomersServed >= 10000,
    reward: 10000,
    icon: "👑"
  },
  {
    id: "first_50k",
    name: "Getting Rich",
    description: "Earn 50,000 ChronoCoins",
    condition: (stats) => stats.totalEarned >= 50000,
    reward: 5000,
    icon: "💰"
  },
  {
    id: "first_500k",
    name: "Tycoon",
    description: "Earn 500,000 ChronoCoins",
    condition: (stats) => stats.totalEarned >= 500000,
    reward: 25000,
    icon: "💎"
  },
  {
    id: "first_million",
    name: "Millionaire",
    description: "Earn 1,000,000 ChronoCoins",
    condition: (stats) => stats.totalEarned >= 1000000,
    reward: 100000,
    icon: "💸"
  },
  {
    id: "machine_level_20",
    name: "Tech Pioneer",
    description: "Upgrade time machine to level 20",
    condition: (stats) => stats.timeMachineLevel >= 20,
    reward: 8000,
    icon: "⚙️"
  },
  {
    id: "machine_level_50",
    name: "Master Engineer",
    description: "Upgrade time machine to level 50",
    condition: (stats) => stats.timeMachineLevel >= 50,
    reward: 50000,
    icon: "🔧"
  },
  {
    id: "all_destinations",
    name: "Time Explorer",
    description: "Unlock all time destinations",
    condition: (stats) => stats.unlockedDestinationsCount >= 13,
    reward: 20000,
    icon: "🌍"
  },
  {
    id: "first_prestige",
    name: "Reset Master",
    description: "Prestige for the first time",
    condition: (stats) => stats.prestigeLevel >= 1,
    reward: 10000,
    icon: "⭐"
  },
  {
    id: "prestige_5",
    name: "Time Lord",
    description: "Reach prestige level 5",
    condition: (stats) => stats.prestigeLevel >= 5,
    reward: 50000,
    icon: "🌟"
  }
];

interface AchievementState {
  unlockedAchievements: string[];
  claimedAchievements: string[];
  
  checkAchievements: (stats: GameStats) => Achievement[];
  unlockAchievement: (achievementId: string) => void;
  claimAchievement: (achievementId: string) => number;
  isUnlocked: (achievementId: string) => boolean;
  isClaimed: (achievementId: string) => boolean;
  getUnlockedCount: () => number;
  getUnclaimedAchievements: () => Achievement[];
}

export const useAchievements = create<AchievementState>()(
  subscribeWithSelector((set, get) => ({
    unlockedAchievements: [],
    claimedAchievements: [],
    
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
    
    claimAchievement: (achievementId) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) return 0;
      
      const state = get();
      if (!state.unlockedAchievements.includes(achievementId) || state.claimedAchievements.includes(achievementId)) {
        return 0;
      }
      
      set((state) => ({
        claimedAchievements: [...state.claimedAchievements, achievementId]
      }));
      
      return achievement.reward;
    },
    
    isUnlocked: (achievementId) => {
      return get().unlockedAchievements.includes(achievementId);
    },
    
    isClaimed: (achievementId) => {
      return get().claimedAchievements.includes(achievementId);
    },
    
    getUnlockedCount: () => {
      return get().unlockedAchievements.length;
    },
    
    getUnclaimedAchievements: () => {
      const state = get();
      return ACHIEVEMENTS.filter(a => 
        state.unlockedAchievements.includes(a.id) && !state.claimedAchievements.includes(a.id)
      );
    }
  }))
);
