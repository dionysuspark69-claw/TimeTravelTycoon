import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

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
}

export const MANAGER_TYPES: Omit<Manager, "level">[] = [
  {
    id: "recruiter",
    name: "Customer Recruiter",
    description: "Attracts more customers to your time machine",
    baseCost: 1000,
    maxLevel: 10,
    bonusType: "customerRate",
    bonusPerLevel: 0.2,
    color: "#3498db"
  },
  {
    id: "technician",
    name: "Speed Technician",
    description: "Makes your time machine travel faster",
    baseCost: 2000,
    maxLevel: 10,
    bonusType: "speed",
    bonusPerLevel: 0.15,
    color: "#2ecc71"
  },
  {
    id: "accountant",
    name: "Revenue Accountant",
    description: "Increases revenue from each trip",
    baseCost: 3000,
    maxLevel: 10,
    bonusType: "revenue",
    bonusPerLevel: 0.25,
    color: "#f39c12"
  }
];

interface ManagerState {
  managers: Record<string, number>;
  
  getManagerLevel: (managerId: string) => number;
  getManagerCost: (managerId: string) => number;
  upgradeManager: (managerId: string, currentCoins: number, spendCoins: (amount: number) => boolean) => boolean;
  
  getCustomerRateBonus: () => number;
  getSpeedBonus: () => number;
  getRevenueBonus: () => number;
}

export const useManagers = create<ManagerState>()(
  subscribeWithSelector((set, get) => ({
    managers: {},
    
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
      
      return bonus;
    }
  }))
);
