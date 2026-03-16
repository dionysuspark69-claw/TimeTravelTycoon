import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PerkId = "offline_efficiency" | "artifact_luck" | "manager_xp" | "mission_rewards" | "machine_retention" | "destination_fares";

export interface PerkChoice {
  id: PerkId;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  effect: (level: number) => number;
}

export const PERK_DEFINITIONS: Record<PerkId, Omit<PerkChoice, 'level'>> = {
  offline_efficiency: {
    id: "offline_efficiency",
    name: "Temporal Echo",
    description: "Offline earnings efficiency",
    icon: "🌙",
    maxLevel: 5,
    effect: (level) => 0.4 + level * 0.1,
  },
  artifact_luck: {
    id: "artifact_luck",
    name: "Artifact Sense",
    description: "Artifact drop rate multiplier",
    icon: "🔮",
    maxLevel: 5,
    effect: (level) => 1 + level * 0.5,
  },
  manager_xp: {
    id: "manager_xp",
    name: "Leadership",
    description: "Manager upgrade cost reduction",
    icon: "👔",
    maxLevel: 3,
    effect: (level) => 1 - level * 0.15,
  },
  mission_rewards: {
    id: "mission_rewards",
    name: "Chrono Broker",
    description: "Mission coin reward multiplier",
    icon: "📋",
    maxLevel: 5,
    effect: (level) => 1 + level * 0.25,
  },
  machine_retention: {
    id: "machine_retention",
    name: "Temporal Anchor",
    description: "Keep 1 extra Time Machine after prestige per level",
    icon: "⚓",
    maxLevel: 3,
    effect: (level) => level,
  },
  destination_fares: {
    id: "destination_fares",
    name: "Fare Optimizer",
    description: "Base fare multiplier for all destinations",
    icon: "💰",
    maxLevel: 5,
    effect: (level) => 1 + level * 0.1,
  },
};

interface PrestigePerksState {
  chosenPerks: Partial<Record<PerkId, number>>;
  pendingChoice: boolean;
  setPendingChoice: (val: boolean) => void;
  choosePerk: (perkId: PerkId) => void;
  getPerkLevel: (perkId: PerkId) => number;
  getPerkValue: (perkId: PerkId) => number;
  getPerksForCategory: (category: "offline" | "artifact" | "manager" | "mission" | "machine" | "fare") => PerkChoice[];
}

export const usePrestigePerks = create<PrestigePerksState>()(
  persist(
    (set, get) => ({
      chosenPerks: {},
      pendingChoice: false,
      setPendingChoice: (val) => set({ pendingChoice: val }),
      choosePerk: (perkId) => {
        const state = get();
        const def = PERK_DEFINITIONS[perkId];
        const currentLevel = state.chosenPerks[perkId] || 0;
        if (currentLevel >= def.maxLevel) return;
        set({
          chosenPerks: { ...state.chosenPerks, [perkId]: currentLevel + 1 },
          pendingChoice: false,
        });
      },
      getPerkLevel: (perkId) => get().chosenPerks[perkId] || 0,
      getPerkValue: (perkId) => {
        const level = get().getPerkLevel(perkId);
        return PERK_DEFINITIONS[perkId].effect(level);
      },
      getPerksForCategory: () => [],
    }),
    { name: "chronotransit-prestige-perks", version: 1, migrate: (s: any) => ({ chosenPerks: {}, pendingChoice: false, ...s }) }
  )
);
