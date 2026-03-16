import { create } from "zustand";
import { subscribeWithSelector, persist } from "zustand/middleware";
import { useManagerPerks, MANAGER_PERK_BRANCHES } from "./useManagerPerks";

export interface ManagerPerk {
  level: number;
  name: string;
  description: string;
  type: "passive" | "active";
}

export interface Manager {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  level: number;
  maxLevel: number;
  bonusType: "customerRate" | "speed" | "revenue";
  bonusPerLevel: number;
  color: string;
  perks: ManagerPerk[];
}

export const MANAGER_TYPES: Omit<Manager, "level">[] = [
  {
    id: "recruiter",
    name: "Customer Recruiter",
    description: "Attracts more customers to your time machine",
    baseCost: 1000,
    maxLevel: 30,
    bonusType: "customerRate",
    bonusPerLevel: 0.1,
    color: "#3498db",
    perks: [
      {
        level: 10,
        name: "Temporal Beacon",
        description: "Every 60 seconds, a wave of 2x customers instantly appears",
        type: "passive"
      },
      {
        level: 25,
        name: "VIP Clients",
        description: "1% chance for any customer to be a VIP who pays 100x ChronoCoins",
        type: "passive"
      }
    ]
  },
  {
    id: "technician",
    name: "Speed Technician",
    description: "Makes your time machine travel faster",
    baseCost: 2000,
    maxLevel: 30,
    bonusType: "speed",
    bonusPerLevel: 0.08,
    color: "#2ecc71",
    perks: [
      {
        level: 10,
        name: "Slipstream",
        description: "50% chance after a trip to instantly return (0 travel time back)",
        type: "passive"
      },
      {
        level: 25,
        name: "Overclock",
        description: "Active ability: All trips instantaneous for 10s (5min cooldown)",
        type: "active"
      }
    ]
  },
  {
    id: "accountant",
    name: "Revenue Accountant",
    description: "Increases revenue from each trip",
    baseCost: 3000,
    maxLevel: 30,
    bonusType: "revenue",
    bonusPerLevel: 0.12,
    color: "#f39c12",
    perks: [
      {
        level: 10,
        name: "Compound Interest",
        description: "For every 100 trips, base revenue permanently increases by 1%",
        type: "passive"
      },
      {
        level: 25,
        name: "Time-Share Scam",
        description: "5% chance any trip pays out 3x revenue",
        type: "passive"
      }
    ]
  },
  {
    id: "timeline-optimizer",
    name: "Timeline Optimizer",
    description: "Optimizes the flow of customers across multiple timelines",
    baseCost: 4000,
    maxLevel: 30,
    bonusType: "customerRate",
    bonusPerLevel: 0.09,
    color: "#9b59b6",
    perks: [
      {
        level: 10,
        name: "Multi-Timeline Recruitment",
        description: "Customers arrive in groups of 3 instead of 1",
        type: "passive"
      },
      {
        level: 25,
        name: "Timeline Convergence",
        description: "Every 5 minutes, instantly gain 50 customers from parallel timelines",
        type: "passive"
      }
    ]
  },
  {
    id: "chrono-mechanic",
    name: "Chrono-Mechanic",
    description: "Maintains and upgrades your time machine's temporal engines",
    baseCost: 6000,
    maxLevel: 30,
    bonusType: "speed",
    bonusPerLevel: 0.08,
    color: "#1abc9c",
    perks: [
      {
        level: 10,
        name: "Emergency Repairs",
        description: "25% of trips complete 2x faster due to optimized machinery",
        type: "passive"
      },
      {
        level: 25,
        name: "Temporal Shortcut",
        description: "Active ability: Next 20 trips are instant (8min cooldown)",
        type: "active"
      }
    ]
  },
  {
    id: "temporal-marketing",
    name: "Temporal Marketing Expert",
    description: "Advertises your time travel services across all eras",
    baseCost: 8000,
    maxLevel: 30,
    bonusType: "customerRate",
    bonusPerLevel: 0.11,
    color: "#e74c3c",
    perks: [
      {
        level: 10,
        name: "Viral Campaign",
        description: "Every customer has a 20% chance to bring a friend",
        type: "passive"
      },
      {
        level: 25,
        name: "Celebrity Endorsement",
        description: "Historical figures boost customer rate by 50% permanently",
        type: "passive"
      }
    ]
  },
  {
    id: "paradox-handler",
    name: "Paradox Handler",
    description: "Resolves temporal paradoxes to prevent travel delays",
    baseCost: 10000,
    maxLevel: 30,
    bonusType: "speed",
    bonusPerLevel: 0.10,
    color: "#34495e",
    perks: [
      {
        level: 10,
        name: "Paradox Prevention",
        description: "Eliminates 30% of random travel delays",
        type: "passive"
      },
      {
        level: 25,
        name: "Reality Anchor",
        description: "All trips ignore time paradoxes, maintaining constant maximum speed",
        type: "passive"
      }
    ]
  },
  {
    id: "time-banker",
    name: "Time Banker",
    description: "Invests your ChronoCoins in temporal stock markets",
    baseCost: 15000,
    maxLevel: 30,
    bonusType: "revenue",
    bonusPerLevel: 0.13,
    color: "#16a085",
    perks: [
      {
        level: 10,
        name: "Interest Accrual",
        description: "Every trip earns an additional 15% based on current coin total",
        type: "passive"
      },
      {
        level: 25,
        name: "Future Dividends",
        description: "10% chance any trip pays out 5x revenue from future investments",
        type: "passive"
      }
    ]
  },
  {
    id: "dimension-scout",
    name: "Dimension Scout",
    description: "Finds customers from alternate dimensions and realities",
    baseCost: 18000,
    maxLevel: 30,
    bonusType: "customerRate",
    bonusPerLevel: 0.10,
    color: "#8e44ad",
    perks: [
      {
        level: 10,
        name: "Dimensional Portal",
        description: "Opens a portal every 90 seconds bringing 5 extra-dimensional customers",
        type: "passive"
      },
      {
        level: 25,
        name: "Multiverse Access",
        description: "Customer rate permanently increases by 100%",
        type: "passive"
      }
    ]
  },
  {
    id: "warp-engineer",
    name: "Warp Engineer",
    description: "Creates wormhole shortcuts for faster time travel",
    baseCost: 22000,
    maxLevel: 30,
    bonusType: "speed",
    bonusPerLevel: 0.09,
    color: "#2980b9",
    perks: [
      {
        level: 10,
        name: "Wormhole Network",
        description: "40% of trips use wormholes and complete 3x faster",
        type: "passive"
      },
      {
        level: 25,
        name: "Stable Wormhole",
        description: "Active ability: All trips take 0.1 seconds for 15s (10min cooldown)",
        type: "active"
      }
    ]
  },
  {
    id: "temporal-economist",
    name: "Temporal Economist",
    description: "Optimizes pricing strategies across different time periods",
    baseCost: 28000,
    maxLevel: 30,
    bonusType: "revenue",
    bonusPerLevel: 0.14,
    color: "#d35400",
    perks: [
      {
        level: 10,
        name: "Dynamic Pricing",
        description: "Revenue increases by 1% for every 10 consecutive trips",
        type: "passive"
      },
      {
        level: 25,
        name: "Market Manipulation",
        description: "Can predict future prices, base revenue permanently increases by 75%",
        type: "passive"
      }
    ]
  },
  {
    id: "chrono-influencer",
    name: "Chrono-Influencer",
    description: "A social media star across all time periods",
    baseCost: 35000,
    maxLevel: 30,
    bonusType: "customerRate",
    bonusPerLevel: 0.12,
    color: "#e91e63",
    perks: [
      {
        level: 10,
        name: "Trending Timeline",
        description: "Every 2 minutes, gain customers equal to 10% of total trips completed",
        type: "passive"
      },
      {
        level: 25,
        name: "Viral Moment",
        description: "Active ability: Instantly gain 200 customers (12min cooldown)",
        type: "active"
      }
    ]
  },
  {
    id: "quantum-accelerator",
    name: "Quantum Accelerator",
    description: "Uses quantum mechanics to accelerate time machine to impossible speeds",
    baseCost: 40000,
    maxLevel: 30,
    bonusType: "speed",
    bonusPerLevel: 0.11,
    color: "#00bcd4",
    perks: [
      {
        level: 10,
        name: "Quantum Tunneling",
        description: "20% of trips phase through time barriers instantly",
        type: "passive"
      },
      {
        level: 25,
        name: "Superposition Travel",
        description: "Time machine exists in multiple states, all trips 50% faster permanently",
        type: "passive"
      }
    ]
  },
  {
    id: "future-trader",
    name: "Future Trader",
    description: "Trades commodities and stocks from the future for massive profits",
    baseCost: 45000,
    maxLevel: 30,
    bonusType: "revenue",
    bonusPerLevel: 0.12,
    color: "#ff9800",
    perks: [
      {
        level: 10,
        name: "Insider Trading",
        description: "Knowing the future, revenue increases by 25% permanently",
        type: "passive"
      },
      {
        level: 25,
        name: "Cryptocurrency Boom",
        description: "15% chance any trip discovers a crypto jackpot worth 10x revenue",
        type: "passive"
      }
    ]
  },
  {
    id: "chrono-investor",
    name: "Chrono-Investor",
    description: "Invests in companies centuries before they become profitable",
    baseCost: 50000,
    maxLevel: 30,
    bonusType: "revenue",
    bonusPerLevel: 0.15,
    color: "#4caf50",
    perks: [
      {
        level: 10,
        name: "Long-Term Portfolio",
        description: "Each trip adds 0.5% to a growing revenue multiplier (stacks infinitely)",
        type: "passive"
      },
      {
        level: 25,
        name: "Historical Monopoly",
        description: "Owning key historical businesses doubles all revenue permanently",
        type: "passive"
      }
    ]
  }
];

interface ManagerState {
  managers: Record<string, number>;
  
  temporalBeaconLastTrigger: number;
  overclockActive: boolean;
  overclockEndsAt: number;
  overclockCooldownEndsAt: number;
  compoundInterestBonus: number;
  
  getManagerLevel: (managerId: string) => number;
  getManagerCost: (managerId: string) => number;
  upgradeManager: (managerId: string, currentCoins: number, spendCoins: (amount: number) => boolean) => boolean;
  
  hasPerk: (managerId: string, perkLevel: number) => boolean;
  getUnlockedPerks: (managerId: string) => ManagerPerk[];
  getTotalManagerLevels: () => number;
  getChosenManagerPerk: (managerId: string, milestone: number) => string | null;
  
  triggerOverclock: () => boolean;
  updatePerkTimers: (deltaTime: number) => void;
  incrementCompoundInterest: () => void;
  
  getCustomerRateBonus: () => number;
  getSpeedBonus: () => number;
  getRevenueBonus: () => number;
}

export const useManagers = create<ManagerState>()(
  persist(
  subscribeWithSelector((set, get) => ({
    managers: {},
    
    temporalBeaconLastTrigger: 0,
    overclockActive: false,
    overclockEndsAt: 0,
    overclockCooldownEndsAt: 0,
    compoundInterestBonus: 0,
    
    getManagerLevel: (managerId) => {
      return get().managers[managerId] || 0;
    },
    
    getManagerCost: (managerId) => {
      const manager = MANAGER_TYPES.find(m => m.id === managerId);
      if (!manager) return 0;
      
      const currentLevel = get().getManagerLevel(managerId);
      return Math.floor(manager.baseCost * Math.pow(1.5, currentLevel));
    },
    
    upgradeManager: (managerId, currentCoins, spendCoins) => {
      const manager = MANAGER_TYPES.find(m => m.id === managerId);
      if (!manager) return false;
      
      const currentLevel = get().getManagerLevel(managerId);
      if (currentLevel >= manager.maxLevel) return false;
      
      const cost = get().getManagerCost(managerId);
      if (currentCoins < cost) return false;
      
      if (spendCoins(cost)) {
        const newLevel = currentLevel + 1;
        set((state) => ({
          managers: {
            ...state.managers,
            [managerId]: newLevel
          }
        }));
        
        const idleGame = (window as any).__idleGameStore;
        if (idleGame) {
          const currentTotal = idleGame.getState().totalManagerUpgrades || 0;
          idleGame.setState({ totalManagerUpgrades: currentTotal + 1 });
        }

        // Trigger branch perk choice at milestone levels
        const branches = MANAGER_PERK_BRANCHES[managerId];
        if (branches) {
          const branch = branches.find(b => b.milestone === newLevel);
          if (branch && !useManagerPerks.getState().hasChosen(managerId, branch.milestone)) {
            useManagerPerks.getState().setPendingChoice({ managerId, milestone: branch.milestone });
          }
        }
        
        return true;
      }
      
      return false;
    },
    
    hasPerk: (managerId, perkLevel) => {
      const managerLevel = get().getManagerLevel(managerId);
      if (managerLevel < perkLevel) return false;
      // If there's a branch at this milestone, check if they chose the original option
      const branches = MANAGER_PERK_BRANCHES[managerId];
      if (branches) {
        const branch = branches.find(b => b.milestone === perkLevel);
        if (branch) {
          const chosen = useManagerPerks.getState().getChosenPerk(managerId, perkLevel);
          // Original perks: recruiter_beacon, tech_slipstream, acct_compound, recruiter_vip, tech_overclock, acct_timeshare
          const originalPerkIds: Record<string, Record<number, string>> = {
            recruiter: { 10: "recruiter_beacon", 25: "recruiter_vip" },
            technician: { 10: "tech_slipstream", 25: "tech_overclock" },
            accountant: { 10: "acct_compound", 25: "acct_timeshare" },
            "timeline-optimizer": { 10: "tlo_multiline", 25: "tlo_convergence" },
          };
          const originalId = originalPerkIds[managerId]?.[perkLevel];
          if (originalId && chosen && chosen !== originalId) return false; // chose the B option
        }
      }
      return true;
    },

    getChosenManagerPerk: (managerId, milestone) => {
      return useManagerPerks.getState().getChosenPerk(managerId, milestone);
    },
    
    getUnlockedPerks: (managerId) => {
      const manager = MANAGER_TYPES.find(m => m.id === managerId);
      if (!manager) return [];
      
      const level = get().getManagerLevel(managerId);
      return manager.perks.filter(perk => level >= perk.level);
    },
    
    getTotalManagerLevels: () => {
      const state = get();
      return Object.values(state.managers).reduce((sum, level) => sum + level, 0);
    },
    
    triggerOverclock: () => {
      const now = Date.now();
      const state = get();
      
      if (!state.hasPerk("technician", 25)) return false;
      if (state.overclockActive) return false;
      if (now < state.overclockCooldownEndsAt) return false;
      
      set({
        overclockActive: true,
        overclockEndsAt: now + 10000,
        overclockCooldownEndsAt: now + 300000
      });
      
      return true;
    },
    
    updatePerkTimers: (deltaTime) => {
      const now = Date.now();
      const state = get();
      
      if (state.overclockActive && now >= state.overclockEndsAt) {
        set({ overclockActive: false });
      }
    },
    
    incrementCompoundInterest: () => {
      set((state) => ({
        compoundInterestBonus: state.compoundInterestBonus + 0.01
      }));
    },
    
    getCustomerRateBonus: () => {
      const state = get();
      let bonus = 0;
      
      MANAGER_TYPES.forEach(manager => {
        if (manager.bonusType === "customerRate") {
          const level = state.getManagerLevel(manager.id);
          bonus += level * manager.bonusPerLevel;
        }
      });

      // recruiter_bulk: +15% customer gen (effective capacity bonus)
      if (useManagerPerks.getState().hasPerkId("recruiter_bulk")) bonus += 0.15;
      // tlo_efficiency: queue fills 30% faster
      if (useManagerPerks.getState().hasPerkId("tlo_efficiency")) bonus += 0.30;
      
      return bonus;
    },
    
    getSpeedBonus: () => {
      const state = get();
      let bonus = 0;
      
      MANAGER_TYPES.forEach(manager => {
        if (manager.bonusType === "speed") {
          const level = state.getManagerLevel(manager.id);
          bonus += level * manager.bonusPerLevel;
        }
      });

      // tech_precision: +20% permanent speed
      if (useManagerPerks.getState().hasPerkId("tech_precision")) bonus += 0.20;
      
      return bonus;
    },
    
    getRevenueBonus: () => {
      const state = get();
      let bonus = 0;
      
      MANAGER_TYPES.forEach(manager => {
        if (manager.bonusType === "revenue") {
          const level = state.getManagerLevel(manager.id);
          bonus += level * manager.bonusPerLevel;
        }
      });
      
      if (state.hasPerk("accountant", 10)) {
        bonus += state.compoundInterestBonus;
      }

      // acct_optimizer: +15% fare
      if (useManagerPerks.getState().hasPerkId("acct_optimizer")) bonus += 0.15;
      // TODO: acct_surge (every 5th trip pays 2x) - requires GameLoop-level state tracking
      
      return bonus;
    }
  })),
  { name: "chronotransit-managers" }
  )
);


