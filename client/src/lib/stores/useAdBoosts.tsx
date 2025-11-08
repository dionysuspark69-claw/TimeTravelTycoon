import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type AdBoostType = "revenue" | "customers" | "speed";

export interface AdBoost {
  type: AdBoostType;
  multiplier: number;
  duration: number;
  endsAt: number;
}

export interface AdCooldown {
  type: AdBoostType;
  availableAt: number;
}

interface AdBoostsState {
  activeBoosts: AdBoost[];
  cooldowns: AdCooldown[];
  isWatchingAd: boolean;
  watchingAdType: AdBoostType | null;
  adWatchStartedAt: number | null;
  totalBoostsUsed: number;
  
  startWatchingAd: (type: AdBoostType) => void;
  completeAdWatch: () => void;
  cancelAdWatch: () => void;
  isAdAvailable: (type: AdBoostType) => boolean;
  getCooldownRemaining: (type: AdBoostType) => number;
  getActiveBoost: (type: AdBoostType) => AdBoost | undefined;
  getRevenueMultiplier: () => number;
  getCustomerMultiplier: () => number;
  getSpeedMultiplier: () => number;
  update: (deltaTime: number) => void;
}

const AD_WATCH_DURATION = 5000; // 5 seconds to simulate watching an ad
const AD_COOLDOWN = 5 * 60 * 1000; // 5 minutes between ads of same type

const BOOST_CONFIGS: Record<AdBoostType, { multiplier: number; duration: number }> = {
  revenue: { multiplier: 2, duration: 5 * 60 * 1000 }, // 2x revenue for 5 minutes
  customers: { multiplier: 2, duration: 5 * 60 * 1000 }, // 2x customers for 5 minutes
  speed: { multiplier: 1.5, duration: 5 * 60 * 1000 }, // 1.5x speed for 5 minutes
};

export const useAdBoosts = create<AdBoostsState>()(
  subscribeWithSelector((set, get) => ({
    activeBoosts: [],
    cooldowns: [],
    isWatchingAd: false,
    watchingAdType: null,
    adWatchStartedAt: null,
    totalBoostsUsed: 0,
    
    startWatchingAd: (type: AdBoostType) => {
      const state = get();
      
      if (!state.isAdAvailable(type)) {
        console.log(`Ad boost ${type} not available yet`);
        return;
      }
      
      if (state.isWatchingAd) {
        console.log("Already watching an ad");
        return;
      }
      
      console.log(`Started watching ad for ${type} boost`);
      set({
        isWatchingAd: true,
        watchingAdType: type,
        adWatchStartedAt: Date.now()
      });
    },
    
    completeAdWatch: () => {
      const state = get();
      
      if (!state.isWatchingAd || !state.watchingAdType || !state.adWatchStartedAt) {
        return;
      }
      
      const elapsed = Date.now() - state.adWatchStartedAt;
      if (elapsed < AD_WATCH_DURATION) {
        console.log(`Ad watch incomplete: ${elapsed}ms / ${AD_WATCH_DURATION}ms`);
        return;
      }
      
      const type = state.watchingAdType;
      const config = BOOST_CONFIGS[type];
      const now = Date.now();
      
      const newBoost: AdBoost = {
        type,
        multiplier: config.multiplier,
        duration: config.duration,
        endsAt: now + config.duration
      };
      
      const newCooldown: AdCooldown = {
        type,
        availableAt: now + AD_COOLDOWN
      };
      
      const updatedBoosts = [...state.activeBoosts.filter(b => b.type !== type), newBoost];
      const updatedCooldowns = [...state.cooldowns.filter(c => c.type !== type), newCooldown];
      
      console.log(`Ad boost activated: ${type} ${config.multiplier}x for ${config.duration / 1000}s`);
      
      set({
        activeBoosts: updatedBoosts,
        cooldowns: updatedCooldowns,
        isWatchingAd: false,
        watchingAdType: null,
        adWatchStartedAt: null,
        totalBoostsUsed: get().totalBoostsUsed + 1
      });
    },
    
    cancelAdWatch: () => {
      set({
        isWatchingAd: false,
        watchingAdType: null,
        adWatchStartedAt: null
      });
    },
    
    isAdAvailable: (type: AdBoostType) => {
      const state = get();
      const cooldown = state.cooldowns.find(c => c.type === type);
      
      if (!cooldown) return true;
      
      return Date.now() >= cooldown.availableAt;
    },
    
    getCooldownRemaining: (type: AdBoostType) => {
      const state = get();
      const cooldown = state.cooldowns.find(c => c.type === type);
      
      if (!cooldown) return 0;
      
      const remaining = Math.max(0, cooldown.availableAt - Date.now());
      return remaining;
    },
    
    getActiveBoost: (type: AdBoostType) => {
      const state = get();
      return state.activeBoosts.find(b => b.type === type);
    },
    
    getRevenueMultiplier: () => {
      const boost = get().getActiveBoost("revenue");
      return boost ? boost.multiplier : 1;
    },
    
    getCustomerMultiplier: () => {
      const boost = get().getActiveBoost("customers");
      return boost ? boost.multiplier : 1;
    },
    
    getSpeedMultiplier: () => {
      const boost = get().getActiveBoost("speed");
      return boost ? boost.multiplier : 1;
    },
    
    update: (deltaTime: number) => {
      const state = get();
      const now = Date.now();
      
      const stillActiveBoosts = state.activeBoosts.filter(boost => boost.endsAt > now);
      
      if (stillActiveBoosts.length !== state.activeBoosts.length) {
        set({ activeBoosts: stillActiveBoosts });
      }
      
      if (state.isWatchingAd && state.adWatchStartedAt) {
        const elapsed = now - state.adWatchStartedAt;
        if (elapsed >= AD_WATCH_DURATION) {
          get().completeAdWatch();
        }
      }
    }
  }))
);
