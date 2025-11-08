import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useArtifacts } from "./useArtifacts";
import { useAudio } from "./useAudio";
import { toast } from "sonner";

export interface TimePeriod {
  id: string;
  name: string;
  era: string;
  baseFare: number;
  unlockCost: number;
  color: string;
  description: string;
  speedModifier: number;
  revenueModifier: number;
  customerGenModifier: number;
  pros: string[];
  cons: string[];
}

export const TIME_PERIODS: TimePeriod[] = [
  {
    id: "dinosaur",
    name: "Dinosaur Era",
    era: "65 Million BC",
    baseFare: 10,
    unlockCost: 0,
    color: "#2ecc71",
    description: "Watch the mighty dinosaurs roam!",
    speedModifier: 1.0,
    revenueModifier: 1.0,
    customerGenModifier: 1.0,
    pros: ["Balanced experience"],
    cons: []
  },
  {
    id: "egypt",
    name: "Ancient Egypt",
    era: "2500 BC",
    baseFare: 25,
    unlockCost: 500,
    color: "#f39c12",
    description: "Visit the pyramids being built!",
    speedModifier: 0.8,
    revenueModifier: 1.5,
    customerGenModifier: 1.0,
    pros: ["Easily Impressed: +50% revenue"],
    cons: ["Primitive Routes: -20% speed"]
  },
  {
    id: "rome",
    name: "Ancient Rome",
    era: "100 AD",
    baseFare: 40,
    unlockCost: 1500,
    color: "#c0392b",
    description: "Witness the glory of the Roman Empire!",
    speedModifier: 1.1,
    revenueModifier: 1.4,
    customerGenModifier: 1.2,
    pros: ["Imperial Splendor: +40% revenue", "Road Network: +10% speed", "Empire Travelers: +20% customers"],
    cons: []
  },
  {
    id: "medieval",
    name: "Medieval Times",
    era: "1200 AD",
    baseFare: 50,
    unlockCost: 2000,
    color: "#9b59b6",
    description: "Experience knights and castles!",
    speedModifier: 1.0,
    revenueModifier: 1.2,
    customerGenModifier: 1.3,
    pros: ["Popular Era: +30% customer generation", "Historic Interest: +20% revenue"],
    cons: []
  },
  {
    id: "viking",
    name: "Viking Age",
    era: "900 AD",
    baseFare: 60,
    unlockCost: 3500,
    color: "#34495e",
    description: "Sail with legendary Norse warriors!",
    speedModifier: 0.9,
    revenueModifier: 1.6,
    customerGenModifier: 0.9,
    pros: ["Legendary Tales: +60% revenue"],
    cons: ["Rough Seas: -10% speed", "Fierce Reputation: -10% customers"]
  },
  {
    id: "renaissance",
    name: "Renaissance",
    era: "1500 AD",
    baseFare: 75,
    unlockCost: 5000,
    color: "#e67e22",
    description: "Witness the rebirth of art and science!",
    speedModifier: 1.2,
    revenueModifier: 1.3,
    customerGenModifier: 0.9,
    pros: ["Cultural Boom: +30% revenue", "Stable Routes: +20% speed"],
    cons: ["Elite Tourism: -10% customer generation"]
  },
  {
    id: "industrial",
    name: "Industrial Revolution",
    era: "1850 AD",
    baseFare: 100,
    unlockCost: 10000,
    color: "#95a5a6",
    description: "See the age of steam and steel!",
    speedModifier: 1.5,
    revenueModifier: 1.0,
    customerGenModifier: 1.2,
    pros: ["Steam Power: +50% speed", "Working Class: +20% customers"],
    cons: []
  },
  {
    id: "wildwest",
    name: "Wild West",
    era: "1880 AD",
    baseFare: 125,
    unlockCost: 20000,
    color: "#e74c3c",
    description: "Live the cowboy adventure!",
    speedModifier: 0.7,
    revenueModifier: 2.0,
    customerGenModifier: 0.8,
    pros: ["High Stakes: +100% revenue"],
    cons: ["Dangerous Territory: -30% speed", "Cautious Travelers: -20% customers"]
  },
  {
    id: "roaring20s",
    name: "Roaring Twenties",
    era: "1925 AD",
    baseFare: 175,
    unlockCost: 35000,
    color: "#f1c40f",
    description: "Dance through the jazz age!",
    speedModifier: 1.3,
    revenueModifier: 1.5,
    customerGenModifier: 1.4,
    pros: ["Party Era: +40% customers", "Wealthy Tourists: +50% revenue", "Modern Travel: +30% speed"],
    cons: []
  },
  {
    id: "spaceage",
    name: "Space Age",
    era: "1969 AD",
    baseFare: 225,
    unlockCost: 50000,
    color: "#3498db",
    description: "Join the race to the moon!",
    speedModifier: 1.8,
    revenueModifier: 1.2,
    customerGenModifier: 1.0,
    pros: ["Rocket Tech: +80% speed", "Scientific Interest: +20% revenue"],
    cons: []
  },
  {
    id: "future",
    name: "Future City",
    era: "2500 AD",
    baseFare: 300,
    unlockCost: 75000,
    color: "#1abc9c",
    description: "See the world of tomorrow!",
    speedModifier: 2.0,
    revenueModifier: 0.8,
    customerGenModifier: 1.1,
    pros: ["Advanced Tech: +100% speed", "Curious Minds: +10% customers"],
    cons: ["Jaded Tourists: -20% revenue"]
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Metropolis",
    era: "2077 AD",
    baseFare: 350,
    unlockCost: 100000,
    color: "#e91e63",
    description: "Neon-lit streets and corporate intrigue!",
    speedModifier: 1.6,
    revenueModifier: 1.8,
    customerGenModifier: 0.7,
    pros: ["High Tech: +60% speed", "Premium Clients: +80% revenue"],
    cons: ["Dangerous Streets: -30% customers"]
  },
  {
    id: "farfuture",
    name: "Far Future",
    era: "5000 AD",
    baseFare: 500,
    unlockCost: 150000,
    color: "#9b59b6",
    description: "Explore the distant future!",
    speedModifier: 0.5,
    revenueModifier: 5.0,
    customerGenModifier: 0.5,
    pros: ["Extreme Premium: +400% revenue"],
    cons: ["Unstable Timelines: -50% speed", "Risky Travel: -50% customers"]
  }
];

export type CustomerState = "spawning" | "approaching" | "waiting" | "boarding" | "traveling";

export interface CustomerEntity {
  id: string;
  state: CustomerState;
  spawnTime: number;
  stateChangedTime: number;
  colorIndex: number;
  targetPosition?: [number, number, number];
  hasReachedTarget?: boolean;
  isVIP?: boolean;
}

interface IdleGameState {
  chronocoins: number;
  totalEarned: number;
  
  prestigeLevel: number;
  prestigePoints: number;
  
  timeMachineLevel: number;
  timeMachineCapacity: number;
  timeMachineSpeed: number;
  timeMachineCount: number;
  
  customerGenerationRate: number;
  waitingCustomers: number;
  processingCustomers: number;
  totalCustomersServed: number;
  totalTripsCompleted: number;
  tripEndTime: number | null;
  
  totalManagerUpgrades: number;
  
  customerEntities: CustomerEntity[];
  nextCustomerId: number;
  
  unlockedDestinations: string[];
  currentDestination: string;
  
  lastUpdateTime: number;
  lastPlayTime: number;
  lastTemporalBeaconTime: number;
  
  tutorialShown: boolean;
  setTutorialShown: () => void;
  
  coinsPerSecond: number;
  lastClickBoostTime?: number;
  
  addChronocoins: (amount: number) => void;
  spendChronocoins: (amount: number) => boolean;
  
  upgradeTimeMachine: () => boolean;
  upgradeCapacity: () => boolean;
  upgradeSpeed: () => boolean;
  upgradeCustomerRate: () => boolean;
  buyTimeMachine: () => boolean;
  
  unlockDestination: (destinationId: string) => boolean;
  setDestination: (destinationId: string) => void;
  
  clickBoost: () => void;
  
  prestige: () => void;
  
  calculateOfflineEarnings: () => number;
  claimOfflineEarnings: () => void;
  
  spawnCustomerEntity: (isVIP?: boolean) => void;
  updateCustomerStates: () => void;
  markEntityReachedTarget: (entityId: string) => void;
  boardCustomers: (count: number) => void;
  
  update: (deltaTime: number, managerBonuses?: {customerRate: number, speed: number, revenue: number}, managerPerks?: {hasVIP: boolean, hasSlipstream: boolean, hasTimeShare: boolean, hasTemporalBeacon: boolean}) => void;
  
  getTimeMachineUpgradeCost: () => number;
  getCapacityUpgradeCost: () => number;
  getSpeedUpgradeCost: () => number;
  getCustomerRateUpgradeCost: () => number;
  getTimeMachineBuyCost: () => number;
  
  getRevenueMultiplier: (managerBonus?: number) => number;
  getSpeedMultiplier: (managerBonus?: number) => number;
  
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
    timeMachineCount: 1,
    
    customerGenerationRate: 1,
    waitingCustomers: 0,
    processingCustomers: 0,
    totalCustomersServed: 0,
    totalTripsCompleted: 0,
    tripEndTime: null,
    
    totalManagerUpgrades: 0,
    
    customerEntities: [],
    nextCustomerId: 0,
    
    unlockedDestinations: ["dinosaur"],
    currentDestination: "dinosaur",
    
    lastUpdateTime: Date.now(),
    lastPlayTime: Date.now(),
    lastTemporalBeaconTime: 0,
    
    tutorialShown: false,
    setTutorialShown: () => set({ tutorialShown: true }),
    
    coinsPerSecond: 0,
    lastClickBoostTime: undefined,
    
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
    
    getTimeMachineBuyCost: () => {
      const state = get();
      return Math.floor(10000 * Math.pow(2, state.timeMachineCount - 1));
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
    
    buyTimeMachine: () => {
      const state = get();
      const cost = state.getTimeMachineBuyCost();
      if (state.spendChronocoins(cost)) {
        set({ timeMachineCount: state.timeMachineCount + 1 });
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
      const clickRevenue = fare * 0.5;
      state.addChronocoins(clickRevenue);
      
      const clickTimestamp = Date.now();
      
      set({ 
        coinsPerSecond: clickRevenue,
        lastClickBoostTime: clickTimestamp
      });
      
      setTimeout(() => {
        const currentState = get();
        if (currentState.lastClickBoostTime === clickTimestamp) {
          set({ coinsPerSecond: 0 });
        }
      }, 1000);
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
        timeMachineCount: 1,
        customerGenerationRate: 1,
        waitingCustomers: 0,
        processingCustomers: 0,
        tripEndTime: null,
        customerEntities: [],
        nextCustomerId: 0,
        unlockedDestinations: ["dinosaur"],
        currentDestination: "dinosaur"
      });
    },
    
    calculateOfflineEarnings: () => {
      const state = get();
      const now = Date.now();
      const timeAway = now - state.lastPlayTime;
      const minutesAway = timeAway / 1000 / 60;
      
      if (minutesAway < 1) return 0;
      
      const maxMinutes = Math.min(minutesAway, 120);
      
      const fare = state.getCurrentFare();
      const baseRevenuePerMinute = (fare * state.timeMachineCapacity * state.timeMachineCount * state.customerGenerationRate * 0.5 * 60) / (3000 / 1000);
      const revenueMultiplier = 1 + (state.prestigePoints * 0.1);
      
      return Math.floor(baseRevenuePerMinute * maxMinutes * revenueMultiplier * 0.5);
    },
    
    claimOfflineEarnings: () => {
      const earnings = get().calculateOfflineEarnings();
      if (earnings > 0) {
        get().addChronocoins(earnings);
        set({ lastPlayTime: Date.now() });
      }
    },
    
    spawnCustomerEntity: (isVIP = false) => {
      const state = get();
      const id = `customer-${state.nextCustomerId}`;
      const colorIndex = state.nextCustomerId % 5;
      const now = Date.now();
      
      const newEntity: CustomerEntity = {
        id,
        state: "spawning",
        spawnTime: now,
        stateChangedTime: now,
        colorIndex,
        hasReachedTarget: false,
        isVIP
      };
      
      set({
        customerEntities: [...state.customerEntities, newEntity],
        nextCustomerId: state.nextCustomerId + 1
      });
    },
    
    updateCustomerStates: () => {
      const state = get();
      const now = Date.now();
      
      const waitingAndApproachingCount = state.customerEntities.filter(
        e => e.state === "waiting" || e.state === "approaching"
      ).length;
      
      const updatedEntities = state.customerEntities.map((entity, index) => {
        if (entity.state === "spawning" && now - entity.stateChangedTime > 100) {
          const queueIndex = state.customerEntities.filter(
            (e, i) => i < index && (e.state === "waiting" || e.state === "approaching")
          ).length;
          
          const QUEUE_START: [number, number, number] = [-6, 0, -2];
          const queuePos: [number, number, number] = [
            QUEUE_START[0] + Math.floor(queueIndex / 5) * 0.8,
            QUEUE_START[1],
            QUEUE_START[2] + (queueIndex % 5) * 0.6
          ];
          
          return { 
            ...entity, 
            state: "approaching" as CustomerState, 
            stateChangedTime: now,
            targetPosition: queuePos
          };
        }
        if (entity.state === "approaching" && entity.hasReachedTarget) {
          return { ...entity, state: "waiting" as CustomerState, stateChangedTime: now };
        }
        if (entity.state === "approaching" && now - entity.stateChangedTime > 5000) {
          return { ...entity, state: "waiting" as CustomerState, stateChangedTime: now };
        }
        return entity;
      });
      
      const hasChanges = updatedEntities.some((entity, index) => 
        entity.state !== state.customerEntities[index]?.state ||
        entity.targetPosition !== state.customerEntities[index]?.targetPosition
      );
      
      if (hasChanges) {
        set({ customerEntities: updatedEntities });
      }
    },
    
    markEntityReachedTarget: (entityId: string) => {
      const state = get();
      const updatedEntities = state.customerEntities.map(entity => {
        if (entity.id === entityId && !entity.hasReachedTarget) {
          return { ...entity, hasReachedTarget: true };
        }
        return entity;
      });
      
      set({ customerEntities: updatedEntities });
    },
    
    boardCustomers: (count) => {
      const state = get();
      const now = Date.now();
      
      useAudio.getState().playBoarding();
      
      const waitingEntities = state.customerEntities.filter(
        e => e.state === "waiting"
      ).slice(0, count);
      
      const updatedEntities = state.customerEntities.map(entity => {
        if (waitingEntities.find(e => e.id === entity.id)) {
          return { ...entity, state: "boarding" as CustomerState, stateChangedTime: now };
        }
        return entity;
      });
      
      set({ customerEntities: updatedEntities });
      
      setTimeout(() => {
        const currentState = get();
        const travelingEntities = currentState.customerEntities.map(entity => {
          if (waitingEntities.find(e => e.id === entity.id) && entity.state === "boarding") {
            return { ...entity, state: "traveling" as CustomerState, stateChangedTime: Date.now() };
          }
          return entity;
        });
        
        set({ customerEntities: travelingEntities });
      }, 500);
    },
    
    getRevenueMultiplier: (managerBonus = 0) => {
      const state = get();
      const destination = TIME_PERIODS.find(d => d.id === state.currentDestination);
      const destinationMod = destination?.revenueModifier || 1.0;
      
      const artifactsStore = useArtifacts.getState();
      const artifactBonus = artifactsStore.getDestinationRevenueBonus(state.currentDestination);
      
      let multiplier = (1 + (state.prestigePoints * 0.1) + managerBonus + artifactBonus) * destinationMod;
      
      return multiplier;
    },
    
    getSpeedMultiplier: (managerBonus = 0) => {
      const state = get();
      const destination = TIME_PERIODS.find(d => d.id === state.currentDestination);
      const destinationMod = destination?.speedModifier || 1.0;
      
      let multiplier = (1 + managerBonus) * destinationMod;
      
      return multiplier;
    },
    
    getCurrentFare: () => {
      const state = get();
      const destination = TIME_PERIODS.find(d => d.id === state.currentDestination);
      if (!destination) return 10;
      
      return Math.floor(destination.baseFare * state.timeMachineLevel);
    },
    
    update: (deltaTime, managerBonuses, managerPerks) => {
      const state = get();
      const now = Date.now();
      
      const bonuses = managerBonuses || {customerRate: 0, speed: 0, revenue: 0};
      const perks = managerPerks || {hasVIP: false, hasSlipstream: false, hasTimeShare: false, hasTemporalBeacon: false};
      
      if (perks.hasTemporalBeacon && now - state.lastTemporalBeaconTime >= 60000) {
        set({ lastTemporalBeaconTime: now });
      }
      
      const destination = TIME_PERIODS.find(d => d.id === state.currentDestination);
      const destinationCustomerMod = destination?.customerGenModifier || 1.0;
      
      let customerGenRate = state.customerGenerationRate * 0.5 * (1 + bonuses.customerRate) * destinationCustomerMod;
      
      if (perks.hasTemporalBeacon && now - state.lastTemporalBeaconTime < 1000) {
        customerGenRate *= 2;
      }
      
      const newCustomers = customerGenRate * (deltaTime / 1000);
      
      const travelTime = 3000 / (state.timeMachineSpeed * state.getSpeedMultiplier(bonuses.speed));
      const capacity = state.timeMachineCapacity * state.timeMachineCount;
      
      let waitingCustomers = state.waitingCustomers + newCustomers;
      
      const queueEntitiesCount = state.customerEntities.filter(
        e => e.state === "approaching" || e.state === "waiting"
      ).length;
      
      const targetEntityCount = Math.min(Math.floor(waitingCustomers), 25);
      const entitiesToSpawn = Math.max(0, targetEntityCount - queueEntitiesCount);
      
      if (entitiesToSpawn > 0 && state.customerEntities.length < 25) {
        for (let i = 0; i < Math.min(entitiesToSpawn, 25 - state.customerEntities.length); i++) {
          const isVIP = perks.hasVIP && Math.random() < 0.01;
          state.spawnCustomerEntity(isVIP);
        }
      }
      
      state.updateCustomerStates();
      
      if (state.tripEndTime !== null && now >= state.tripEndTime) {
        const fare = state.getCurrentFare();
        const travelingCustomers = state.customerEntities.filter(e => e.state === "traveling");
        const vipCount = travelingCustomers.filter(c => c.isVIP).length;
        const normalCount = travelingCustomers.length - vipCount;
        
        let baseRevenue = fare * normalCount;
        const vipRevenue = fare * 100 * vipCount;
        baseRevenue += vipRevenue;
        
        const timeShareMultiplier = perks.hasTimeShare && Math.random() < 0.05 ? 3 : 1;
        const revenue = baseRevenue * timeShareMultiplier * state.getRevenueMultiplier(bonuses.revenue);
        
        state.addChronocoins(revenue);
        
        const coinsPerSec = revenue / (travelTime / 1000);
        set({ coinsPerSecond: coinsPerSec });
        
        const artifactsStore = useArtifacts.getState();
        const droppedArtifact = artifactsStore.checkForArtifactDrop(state.currentDestination);
        if (droppedArtifact) {
          artifactsStore.discoverArtifact(droppedArtifact.id);
          
          const rarityColors = {
            common: "🔹",
            uncommon: "🟢",
            rare: "🔵",
            epic: "🟣",
            legendary: "🟠"
          };
          
          const discoveryMessages: Record<string, string> = {
            trex_tooth: "A passenger accidentally kicked it loose from a fossil bed!",
            raptor_claw: "Found stuck in your time machine's seat cushion... somehow.",
            amber_fossil: "A tourist dropped it while frantically running from a T-Rex!",
            dino_egg_shell: "Your customer sat on it by mistake. Oops.",
            fern_print: "Peeled off the ground after a heavy landing!",
            
            golden_ankh: "A pharaoh tossed it as a tip for an excellent trip!",
            scarab_amulet: "Found wedged between pyramid stones during pickup.",
            papyrus_scroll: "Blown into the cabin by a desert sandstorm!",
            canopic_jar: "A mummy left this behind. No, really.",
            clay_tablet: "Accidentally swapped for a customer's luggage!",
            
            excalibur_shard: "Chipped off during a jousting tournament detour!",
            holy_grail_piece: "A monk dropped it while boarding in a hurry.",
            knights_signet: "Rolled under your seat during a bumpy castle landing!",
            chainmail_link: "Snagged on your time machine during a battlefield pickup.",
            wooden_shield: "Splintered off when a knight used your door as cover!",
            
            davinci_sketch: "Leonardo himself doodled it on your napkin!",
            galileo_lens: "He forgot it while star-gazing from your observation deck.",
            medici_coin: "Payment from a wealthy patron - overly generous!",
            artists_palette: "Michelangelo left it behind after getting paint everywhere.",
            printing_block: "Gutenberg traded it for a ride to the future!",
            
            steam_governor: "Fell off a train you were racing against!",
            edison_bulb: "Edison himself tested it in your cabin. It works!",
            factory_blueprint: "Blown out of an industrial magnate's briefcase.",
            brass_gear: "Popped loose from a malfunctioning machine nearby.",
            coal_sample: "A worker accidentally dropped his lunch pail!",
            
            quantum_core: "A tech entrepreneur left it as collateral for the fare!",
            neural_chip: "Downloaded from a passenger's failed brain backup.",
            fusion_cell: "Swapped for your outdated battery by a helpful engineer.",
            holo_projector: "A kid dropped it playing holographic games in transit.",
            smart_fabric: "Torn from a passenger's self-repairing jacket!"
          };
          
          const discoveryMsg = discoveryMessages[droppedArtifact.id] || "Your passenger accidentally left it behind!";
          
          toast.success(`Artifact Discovered!`, {
            description: `${rarityColors[droppedArtifact.rarity]} ${droppedArtifact.name} - ${discoveryMsg}`,
            duration: 5000
          });
        }
        
        const travelingEntities = state.customerEntities.filter(e => e.state !== "traveling");
        
        useAudio.getState().playTimeTravel();
        
        set({
          processingCustomers: 0,
          tripEndTime: null,
          totalCustomersServed: state.totalCustomersServed + state.processingCustomers,
          totalTripsCompleted: state.totalTripsCompleted + 1,
          customerEntities: travelingEntities
        });
      }
      
      if (state.processingCustomers === 0 && waitingCustomers >= 1) {
        const canProcess = Math.min(Math.floor(waitingCustomers), capacity);
        waitingCustomers -= canProcess;
        
        state.boardCustomers(canProcess);
        
        const slipstreamChance = perks.hasSlipstream && Math.random() < 0.5;
        const actualTravelTime = slipstreamChance ? 0 : travelTime;
        
        set({
          processingCustomers: canProcess,
          tripEndTime: now + actualTravelTime
        });
      }
      
      set({
        waitingCustomers: waitingCustomers,
        lastUpdateTime: now
      });
    }
  }))
);

if (typeof window !== 'undefined') {
  (window as any).__idleGameStore = useIdleGame;
}
