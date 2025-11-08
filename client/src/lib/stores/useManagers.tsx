import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

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
  
  triggerOverclock: () => boolean;
  updatePerkTimers: (deltaTime: number) => void;
  incrementCompoundInterest: () => void;
  
  getCustomerRateBonus: () => number;
  getSpeedBonus: () => number;
  getRevenueBonus: () => number;
}

export const useManagers = create<ManagerState>()(
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
        set((state) => ({
          managers: {
            ...state.managers,
            [managerId]: currentLevel + 1
          }
        }));
        return true;
      }
      
      return false;
    },
    
    hasPerk: (managerId, perkLevel) => {
      const level = get().getManagerLevel(managerId);
      return level >= perkLevel;
    },
    
    getUnlockedPerks: (managerId) => {
      const manager = MANAGER_TYPES.find(m => m.id === managerId);
      if (!manager) return [];
      
      const level = get().getManagerLevel(managerId);
      return manager.perks.filter(perk => level >= perk.level);
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
      
      return bonus;
    }
  }))
);
