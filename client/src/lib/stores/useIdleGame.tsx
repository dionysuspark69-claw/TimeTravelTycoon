import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface TimePeriod {
  id: string;
  name: string;
  era: string;
  baseFare: number;
  unlockCost: number;
  color: string;
  description: string;
}

export const TIME_PERIODS: TimePeriod[] = [
  {
    id: "dinosaur",
    name: "Dinosaur Era",
    era: "65 Million BC",
    baseFare: 10,
    unlockCost: 0,
    color: "#2ecc71",
    description: "Watch the mighty dinosaurs roam!"
  },
  {
    id: "egypt",
    name: "Ancient Egypt",
    era: "2500 BC",
    baseFare: 25,
    unlockCost: 500,
    color: "#f39c12",
    description: "Visit the pyramids being built!"
  },
  {
    id: "medieval",
    name: "Medieval Times",
    era: "1200 AD",
    baseFare: 50,
    unlockCost: 2000,
    color: "#9b59b6",
    description: "Experience knights and castles!"
  },
  {
    id: "wildwest",
    name: "Wild West",
    era: "1880 AD",
    baseFare: 100,
    unlockCost: 10000,
    color: "#e74c3c",
    description: "Live the cowboy adventure!"
  },
  {
    id: "future",
    name: "Future City",
    era: "2500 AD",
    baseFare: 250,
    unlockCost: 50000,
    color: "#3498db",
    description: "See the world of tomorrow!"
  }
];

export interface AdBoost {
  type: "revenue" | "customers" | "speed";
  multiplier: number;
  endsAt: number;
}

interface IdleGameState {
  chronocoins: number;
  totalEarned: number;
  
  prestigeLevel: number;
  prestigePoints: number;
  
  timeMachineLevel: number;
  timeMachineCapacity: number;
  timeMachineSpeed: number;
  
  customerGenerationRate: number;
  waitingCustomers: number;
  processingCustomers: number;
  totalCustomersServed: number;
  tripEndTime: number | null;
  
  unlockedDestinations: string[];
  currentDestination: string;
  
  activeBoosts: AdBoost[];
  
  lastUpdateTime: number;
  
  addChronocoins: (amount: number) => void;
  spendChronocoins: (amount: number) => boolean;
  
  upgradeTimeMachine: () => boolean;
  upgradeCapacity: () => boolean;
  upgradeSpeed: () => boolean;
  upgradeCustomerRate: () => boolean;
  
  unlockDestination: (destinationId: string) => boolean;
  setDestination: (destinationId: string) => void;
  
  clickBoost: () => void;
  
  watchAd: (type: "revenue" | "customers" | "speed") => void;
  
  prestige: () => void;
  
  update: (deltaTime: number) => void;
  
  getTimeMachineUpgradeCost: () => number;
  getCapacityUpgradeCost: () => number;
  getSpeedUpgradeCost: () => number;
  getCustomerRateUpgradeCost: () => number;
  
  getRevenueMultiplier: () => number;
  getSpeedMultiplier: () => number;
  
  getCurrentFare: () => number;
}

export const useIdleGame = create<IdleGameState>()(
  subscribeWithSelector((set, get) => ({
    chronocoins: 0,
    totalEarned: 0,
    
    prestigeLevel: 0,
    prestigePoints: 0,
    
    timeMachineLevel: 1,
    timeMachineCapacity: 1,
    timeMachineSpeed: 1,
    
    customerGenerationRate: 1,
    waitingCustomers: 0,
    processingCustomers: 0,
    totalCustomersServed: 0,
    tripEndTime: null,
    
    unlockedDestinations: ["dinosaur"],
    currentDestination: "dinosaur",
    
    activeBoosts: [],
    
    lastUpdateTime: Date.now(),
    
    addChronocoins: (amount) => {
      set((state) => ({
        chronocoins: state.chronocoins + amount,
        totalEarned: state.totalEarned + amount
      }));
    },
    
    spendChronocoins: (amount) => {
      const state = get();
      if (state.chronocoins >= amount) {
        set({ chronocoins: state.chronocoins - amount });
        return true;
      }
      return false;
    },
    
    getTimeMachineUpgradeCost: () => {
      const state = get();
      return Math.floor(100 * Math.pow(1.5, state.timeMachineLevel - 1));
    },
    
    getCapacityUpgradeCost: () => {
      const state = get();
      return Math.floor(50 * Math.pow(1.4, state.timeMachineCapacity - 1));
    },
    
    getSpeedUpgradeCost: () => {
      const state = get();
      return Math.floor(75 * Math.pow(1.45, state.timeMachineSpeed - 1));
    },
    
    getCustomerRateUpgradeCost: () => {
      const state = get();
      return Math.floor(200 * Math.pow(1.6, state.customerGenerationRate - 1));
    },
    
    upgradeTimeMachine: () => {
      const state = get();
      const cost = state.getTimeMachineUpgradeCost();
      if (state.spendChronocoins(cost)) {
        set({ timeMachineLevel: state.timeMachineLevel + 1 });
        return true;
      }
      return false;
    },
    
    upgradeCapacity: () => {
      const state = get();
      const cost = state.getCapacityUpgradeCost();
      if (state.spendChronocoins(cost)) {
        set({ timeMachineCapacity: state.timeMachineCapacity + 1 });
        return true;
      }
      return false;
    },
    
    upgradeSpeed: () => {
      const state = get();
      const cost = state.getSpeedUpgradeCost();
      if (state.spendChronocoins(cost)) {
        set({ timeMachineSpeed: state.timeMachineSpeed + 1 });
        return true;
      }
      return false;
    },
    
    upgradeCustomerRate: () => {
      const state = get();
      const cost = state.getCustomerRateUpgradeCost();
      if (state.spendChronocoins(cost)) {
        set({ customerGenerationRate: state.customerGenerationRate + 1 });
        return true;
      }
      return false;
    },
    
    unlockDestination: (destinationId) => {
      const state = get();
      const destination = TIME_PERIODS.find(d => d.id === destinationId);
      if (!destination || state.unlockedDestinations.includes(destinationId)) {
        return false;
      }
      
      if (state.spendChronocoins(destination.unlockCost)) {
        set({
          unlockedDestinations: [...state.unlockedDestinations, destinationId],
          currentDestination: destinationId
        });
        return true;
      }
      return false;
    },
    
    setDestination: (destinationId) => {
      const state = get();
      if (state.unlockedDestinations.includes(destinationId)) {
        set({ currentDestination: destinationId });
      }
    },
    
    clickBoost: () => {
      const state = get();
      const fare = state.getCurrentFare();
      state.addChronocoins(fare * 0.5);
    },
    
    watchAd: (type) => {
      const now = Date.now();
      const duration = 30000;
      
      let boost: AdBoost;
      if (type === "revenue") {
        boost = { type: "revenue", multiplier: 2, endsAt: now + duration };
      } else if (type === "customers") {
        boost = { type: "customers", multiplier: 10, endsAt: now + duration };
        set((state) => ({ waitingCustomers: state.waitingCustomers + 10 }));
      } else {
        boost = { type: "speed", multiplier: 2, endsAt: now + duration };
      }
      
      set((state) => ({
        activeBoosts: [...state.activeBoosts, boost]
      }));
    },
    
    prestige: () => {
      const state = get();
      if (state.totalEarned < 100000) return;
      
      const points = Math.floor(state.totalEarned / 50000);
      
      set({
        chronocoins: 0,
        totalEarned: 0,
        prestigeLevel: state.prestigeLevel + 1,
        prestigePoints: state.prestigePoints + points,
        timeMachineLevel: 1,
        timeMachineCapacity: 1,
        timeMachineSpeed: 1,
        customerGenerationRate: 1,
        waitingCustomers: 0,
        processingCustomers: 0,
        tripEndTime: null,
        unlockedDestinations: ["dinosaur"],
        currentDestination: "dinosaur",
        activeBoosts: []
      });
    },
    
    getRevenueMultiplier: () => {
      const state = get();
      let multiplier = 1 + (state.prestigePoints * 0.1);
      
      const now = Date.now();
      state.activeBoosts.forEach(boost => {
        if (boost.type === "revenue" && boost.endsAt > now) {
          multiplier *= boost.multiplier;
        }
      });
      
      return multiplier;
    },
    
    getSpeedMultiplier: () => {
      const state = get();
      let multiplier = 1;
      
      const now = Date.now();
      state.activeBoosts.forEach(boost => {
        if (boost.type === "speed" && boost.endsAt > now) {
          multiplier *= boost.multiplier;
        }
      });
      
      return multiplier;
    },
    
    getCurrentFare: () => {
      const state = get();
      const destination = TIME_PERIODS.find(d => d.id === state.currentDestination);
      if (!destination) return 10;
      
      return Math.floor(destination.baseFare * state.timeMachineLevel);
    },
    
    update: (deltaTime) => {
      const state = get();
      const now = Date.now();
      
      set({
        activeBoosts: state.activeBoosts.filter(boost => boost.endsAt > now)
      });
      
      const customerGenRate = state.customerGenerationRate * 0.5;
      const newCustomers = customerGenRate * (deltaTime / 1000);
      
      const travelTime = 3000 / (state.timeMachineSpeed * state.getSpeedMultiplier());
      const capacity = state.timeMachineCapacity;
      
      let waitingCustomers = state.waitingCustomers + newCustomers;
      
      if (state.tripEndTime !== null && now >= state.tripEndTime) {
        const fare = state.getCurrentFare();
        const revenue = fare * state.processingCustomers * state.getRevenueMultiplier();
        
        state.addChronocoins(revenue);
        set({
          processingCustomers: 0,
          tripEndTime: null,
          totalCustomersServed: state.totalCustomersServed + state.processingCustomers
        });
      }
      
      if (state.processingCustomers === 0 && waitingCustomers >= 1) {
        const canProcess = Math.min(Math.floor(waitingCustomers), capacity);
        waitingCustomers -= canProcess;
        
        set({
          processingCustomers: canProcess,
          tripEndTime: now + travelTime
        });
      }
      
      set({
        waitingCustomers: waitingCustomers,
        lastUpdateTime: now
      });
    }
  }))
);
