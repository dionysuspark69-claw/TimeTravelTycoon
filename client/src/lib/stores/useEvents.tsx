import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { toast } from "sonner";

export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "revenue" | "customers" | "speed" | "combined";
  multipliers: {
    revenue?: number;
    customers?: number;
    speed?: number;
  };
  duration: number;
  rarity: "common" | "rare" | "epic";
}

export const SPECIAL_EVENTS: SpecialEvent[] = [
  {
    id: "temporal_storm",
    name: "Temporal Storm",
    description: "Space-time turbulence boosts your speed!",
    icon: "⚡",
    type: "speed",
    multipliers: { speed: 2.0 },
    duration: 60000,
    rarity: "common"
  },
  {
    id: "time_tourist_rush",
    name: "Tourist Rush",
    description: "Wave of eager time travelers!",
    icon: "👥",
    type: "customers",
    multipliers: { customers: 3.0 },
    duration: 45000,
    rarity: "common"
  },
  {
    id: "golden_age",
    name: "Golden Age",
    description: "Economic boom doubles your revenue!",
    icon: "💰",
    type: "revenue",
    multipliers: { revenue: 2.0 },
    duration: 60000,
    rarity: "common"
  },
  {
    id: "temporal_alignment",
    name: "Temporal Alignment",
    description: "Perfect alignment boosts everything!",
    icon: "⭐",
    type: "combined",
    multipliers: { revenue: 1.5, customers: 1.5, speed: 1.5 },
    duration: 30000,
    rarity: "rare"
  },
  {
    id: "chrono_festival",
    name: "Chrono Festival",
    description: "Celebration across time! Massive bonuses!",
    icon: "🎉",
    type: "combined",
    multipliers: { revenue: 3.0, customers: 2.0, speed: 2.0 },
    duration: 45000,
    rarity: "epic"
  },
  {
    id: "time_loop",
    name: "Beneficial Time Loop",
    description: "Customers keep coming back!",
    icon: "🔄",
    type: "customers",
    multipliers: { customers: 5.0 },
    duration: 30000,
    rarity: "rare"
  },
  {
    id: "future_tech",
    name: "Future Tech Leak",
    description: "Advanced technology supercharges your machine!",
    icon: "🚀",
    type: "speed",
    multipliers: { speed: 3.0 },
    duration: 40000,
    rarity: "rare"
  },
  {
    id: "vip_convention",
    name: "VIP Convention",
    description: "High-paying clients flood your service!",
    icon: "💎",
    type: "revenue",
    multipliers: { revenue: 4.0 },
    duration: 35000,
    rarity: "epic"
  }
];

interface ActiveEvent {
  event: SpecialEvent;
  endsAt: number;
}

interface EventsState {
  activeEvents: ActiveEvent[];
  lastEventTime: number;
  eventCheckInterval: number;
  totalEventsTriggered: number;
  
  checkForEvent: () => void;
  getActiveMultipliers: () => { revenue: number; customers: number; speed: number };
  update: (deltaTime: number) => void;
}

export const useEvents = create<EventsState>()(
  subscribeWithSelector((set, get) => ({
    activeEvents: [],
    lastEventTime: Date.now(),
    eventCheckInterval: 120000,
    totalEventsTriggered: 0,
    
    checkForEvent: () => {
      const now = Date.now();
      const state = get();
      
      if (now - state.lastEventTime < state.eventCheckInterval) {
        return;
      }
      
      const roll = Math.random();
      let eventToTrigger: SpecialEvent | null = null;
      
      if (roll < 0.03) {
        const epicEvents = SPECIAL_EVENTS.filter(e => e.rarity === "epic");
        eventToTrigger = epicEvents[Math.floor(Math.random() * epicEvents.length)];
      } else if (roll < 0.15) {
        const rareEvents = SPECIAL_EVENTS.filter(e => e.rarity === "rare");
        eventToTrigger = rareEvents[Math.floor(Math.random() * rareEvents.length)];
      } else if (roll < 0.35) {
        const commonEvents = SPECIAL_EVENTS.filter(e => e.rarity === "common");
        eventToTrigger = commonEvents[Math.floor(Math.random() * commonEvents.length)];
      }
      
      if (eventToTrigger) {
        const newEvent: ActiveEvent = {
          event: eventToTrigger,
          endsAt: now + eventToTrigger.duration
        };
        
        set({
          activeEvents: [...state.activeEvents, newEvent],
          lastEventTime: now,
          totalEventsTriggered: state.totalEventsTriggered + 1
        });
        
        const rarityColors = {
          common: "🔹",
          rare: "🟣",
          epic: "🟠"
        };
        
        toast.success(`Special Event!`, {
          description: `${rarityColors[eventToTrigger.rarity]} ${eventToTrigger.icon} ${eventToTrigger.name} - ${eventToTrigger.description}`,
          duration: 5000
        });
      }
      
      set({ lastEventTime: now });
    },
    
    getActiveMultipliers: () => {
      const state = get();
      const now = Date.now();
      
      let revenue = 1.0;
      let customers = 1.0;
      let speed = 1.0;
      
      state.activeEvents.forEach(activeEvent => {
        if (activeEvent.endsAt > now) {
          if (activeEvent.event.multipliers.revenue) {
            revenue *= activeEvent.event.multipliers.revenue;
          }
          if (activeEvent.event.multipliers.customers) {
            customers *= activeEvent.event.multipliers.customers;
          }
          if (activeEvent.event.multipliers.speed) {
            speed *= activeEvent.event.multipliers.speed;
          }
        }
      });
      
      return { revenue, customers, speed };
    },
    
    update: (deltaTime) => {
      const state = get();
      const now = Date.now();
      
      const expiredEvents = state.activeEvents.filter(e => e.endsAt <= now);
      if (expiredEvents.length > 0) {
        set({
          activeEvents: state.activeEvents.filter(e => e.endsAt > now)
        });
      }
      
      state.checkForEvent();
    }
  }))
);
