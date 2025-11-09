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
  timeMachineCount: number;
  totalTripsCompleted: number;
  totalManagerUpgrades: number;
  currentCoins: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Original 11 achievements
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
  },
  
  // NEW: More Customer Milestones
  {
    id: "hundred_k_customers",
    name: "Temporal Traffic Jam",
    description: "100,000 customers! Your time machine needs a traffic light now.",
    condition: (stats) => stats.totalCustomersServed >= 100000,
    reward: 30000,
    icon: "🚦"
  },
  {
    id: "half_mil_customers",
    name: "Population Control Issues",
    description: "500,000 customers served. The Time Police are asking questions.",
    condition: (stats) => stats.totalCustomersServed >= 500000,
    reward: 60000,
    icon: "👮"
  },
  {
    id: "million_customers",
    name: "Million Dollar (People) Baby",
    description: "1 million customers! You're basically running a temporal airline now.",
    condition: (stats) => stats.totalCustomersServed >= 1000000,
    reward: 100000,
    icon: "✈️"
  },
  {
    id: "five_mil_customers",
    name: "Are We Running a Cult?",
    description: "5 million customers. This is definitely a cult at this point.",
    condition: (stats) => stats.totalCustomersServed >= 5000000,
    reward: 250000,
    icon: "🛐"
  },
  
  // NEW: More Revenue Milestones
  {
    id: "ten_mil_earned",
    name: "Disgustingly Rich",
    description: "10 million ChronoCoins earned. You can't even spend this fast.",
    condition: (stats) => stats.totalEarned >= 10000000,
    reward: 25000,
    icon: "🤑"
  },
  {
    id: "hundred_mil_earned",
    name: "Time Billionaire",
    description: "100 million earned. Jeff Bezos? Never heard of him.",
    condition: (stats) => stats.totalEarned >= 100000000,
    reward: 75000,
    icon: "💵"
  },
  {
    id: "billion_earned",
    name: "Chrono-Capitalist Supreme",
    description: "1 BILLION coins! The IRS wants to talk about your 'temporal earnings'.",
    condition: (stats) => stats.totalEarned >= 1000000000,
    reward: 500000,
    icon: "🏦"
  },
  
  // NEW: Trip Milestones
  {
    id: "hundred_trips",
    name: "Frequent Flyer Miles",
    description: "100 trips completed. You've earned so many temporal miles!",
    condition: (stats) => stats.totalTripsCompleted >= 100,
    reward: 2000,
    icon: "🎫"
  },
  {
    id: "thousand_trips",
    name: "Professional Time Hopper",
    description: "1,000 trips! Your frequent flyer card is made of pure chronium.",
    condition: (stats) => stats.totalTripsCompleted >= 1000,
    reward: 8000,
    icon: "🎟️"
  },
  {
    id: "ten_k_trips",
    name: "Temporal Taxi Driver",
    description: "10,000 trips. Are you talkin' to ME? Through time?!",
    condition: (stats) => stats.totalTripsCompleted >= 10000,
    reward: 20000,
    icon: "🚕"
  },
  {
    id: "hundred_k_trips",
    name: "Living Time Paradox",
    description: "100,000 trips. Physicists are crying, but you keep going.",
    condition: (stats) => stats.totalTripsCompleted >= 100000,
    reward: 60000,
    icon: "🌀"
  },
  {
    id: "half_mil_trips",
    name: "Breaking Physics Daily",
    description: "500,000 trips. Einstein's spinning in his grave. Also, he's your customer.",
    condition: (stats) => stats.totalTripsCompleted >= 500000,
    reward: 100000,
    icon: "⚛️"
  },
  {
    id: "million_trips",
    name: "Paradox Generator 3000",
    description: "1 MILLION trips! Reality is just a suggestion at this point.",
    condition: (stats) => stats.totalTripsCompleted >= 1000000,
    reward: 300000,
    icon: "🌌"
  },
  
  // NEW: Manager Milestones
  {
    id: "first_manager_upgrade",
    name: "Entry-Level Management",
    description: "Upgraded a manager for the first time. Congrats, you're 'delegating'!",
    condition: (stats) => stats.totalManagerUpgrades >= 1,
    reward: 1000,
    icon: "📊"
  },
  {
    id: "ten_manager_upgrades",
    name: "Middle Management Syndrome",
    description: "10 manager upgrades. You now have meetings about having meetings.",
    condition: (stats) => stats.totalManagerUpgrades >= 10,
    reward: 5000,
    icon: "📈"
  },
  {
    id: "fifty_manager_upgrades",
    name: "Corporate Overlord",
    description: "50 manager upgrades! Your org chart looks like a temporal paradox.",
    condition: (stats) => stats.totalManagerUpgrades >= 50,
    reward: 15000,
    icon: "👔"
  },
  {
    id: "hundred_manager_upgrades",
    name: "HR Department of One",
    description: "100 manager upgrades. You're managing the managers who manage managers.",
    condition: (stats) => stats.totalManagerUpgrades >= 100,
    reward: 40000,
    icon: "🏢"
  },
  {
    id: "250_manager_upgrades",
    name: "Managerial Madness",
    description: "250 manager upgrades. This is madness. Glorious, profitable madness.",
    condition: (stats) => stats.totalManagerUpgrades >= 250,
    reward: 80000,
    icon: "🤪"
  },
  
  // NEW: Time Machine Count Milestones
  {
    id: "five_machines",
    name: "Small Fleet Owner",
    description: "5 time machines! You're running a proper fleet now.",
    condition: (stats) => stats.timeMachineCount >= 5,
    reward: 5000,
    icon: "🚗"
  },
  {
    id: "ten_machines",
    name: "Time Armada Admiral",
    description: "10 machines! Is this a business or a temporal invasion force?",
    condition: (stats) => stats.timeMachineCount >= 10,
    reward: 12000,
    icon: "⛵"
  },
  {
    id: "25_machines",
    name: "Temporal Industrial Park",
    description: "25 time machines. Your parking lot is now a temporal anomaly.",
    condition: (stats) => stats.timeMachineCount >= 25,
    reward: 30000,
    icon: "🏭"
  },
  {
    id: "fifty_machines",
    name: "Time Machine Hoarder",
    description: "50 machines! Do you have a problem? Yes. Is it profitable? Also yes.",
    condition: (stats) => stats.timeMachineCount >= 50,
    reward: 60000,
    icon: "🎰"
  },
  {
    id: "hundred_machines",
    name: "Chrono-Traffic Control",
    description: "100 time machines! The FAA called. They're confused but impressed.",
    condition: (stats) => stats.timeMachineCount >= 100,
    reward: 150000,
    icon: "🗼"
  },
  
  // NEW: Machine Level Easter Eggs
  {
    id: "machine_level_69",
    name: "Nice Time Machine",
    description: "Level 69. Nice.",
    condition: (stats) => stats.timeMachineLevel >= 69,
    reward: 6969,
    icon: "😏"
  },
  {
    id: "machine_level_100",
    name: "Century Club Member",
    description: "Level 100! Your machine is officially vintage. Wait, or futuristic?",
    condition: (stats) => stats.timeMachineLevel >= 100,
    reward: 50000,
    icon: "💯"
  },
  {
    id: "machine_level_200",
    name: "Overachiever Alert",
    description: "Level 200. Calm down, it's not a competition... or is it?",
    condition: (stats) => stats.timeMachineLevel >= 200,
    reward: 100000,
    icon: "🏆"
  },
  
  // NEW: More Prestige
  {
    id: "prestige_10",
    name: "Reset Addiction",
    description: "10 prestiges. You enjoy starting over way too much.",
    condition: (stats) => stats.prestigeLevel >= 10,
    reward: 75000,
    icon: "♻️"
  },
  {
    id: "prestige_25",
    name: "Groundhog Day Syndrome",
    description: "25 prestiges! Bill Murray called. He wants his movie plot back.",
    condition: (stats) => stats.prestigeLevel >= 25,
    reward: 200000,
    icon: "🐿️"
  },
  
  // NEW: More Destinations
  {
    id: "twenty_destinations",
    name: "Chronic Wanderer",
    description: "20 destinations unlocked. You get around... through time!",
    condition: (stats) => stats.unlockedDestinationsCount >= 20,
    reward: 25000,
    icon: "🧳"
  },
  {
    id: "forty_destinations",
    name: "Omnipresent Tourist",
    description: "40 destinations! You're literally everywhere and everywhen.",
    condition: (stats) => stats.unlockedDestinationsCount >= 40,
    reward: 80000,
    icon: "🗺️"
  },
  
  // NEW: Funny Easter Eggs
  {
    id: "blazing_coins",
    name: "Blazing Through Time",
    description: "Earned exactly 420,000 coins. Time to... celebrate responsibly?",
    condition: (stats) => stats.totalEarned >= 420000,
    reward: 4200,
    icon: "🌿"
  },
  {
    id: "lucky_sevens",
    name: "Lucky Sevens Jackpot",
    description: "777,777 coins earned! The temporal casino is smiling upon you.",
    condition: (stats) => stats.totalEarned >= 777777,
    reward: 7777,
    icon: "🎰"
  },
  {
    id: "broke_but_happy",
    name: "Broke But Happy",
    description: "Spent everything! 0 coins but rich in experiences (and debt).",
    condition: (stats) => stats.currentCoins === 0 && stats.totalEarned >= 100000,
    reward: 5000,
    icon: "😅"
  },
  {
    id: "leet_customers",
    name: "1337 H4X0R",
    description: "Exactly 1,337 customers. You're elite in the temporal sense!",
    condition: (stats) => stats.totalCustomersServed >= 1337,
    reward: 1337,
    icon: "💻"
  },
  {
    id: "nice_and_blazing",
    name: "Nice and Blazing",
    description: "69,420 customers! The internet approves of your temporal business.",
    condition: (stats) => stats.totalCustomersServed >= 69420,
    reward: 6942,
    icon: "🔥"
  },
  {
    id: "all_the_destinations",
    name: "Time Tourist Completionist",
    description: "Unlocked EVERY destination! The universe is your playground.",
    condition: (stats) => stats.unlockedDestinationsCount >= 50,
    reward: 250000,
    icon: "🎮"
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
