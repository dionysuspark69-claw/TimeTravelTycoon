import { create } from "zustand";
import { persist } from "zustand/middleware";

// Branch choice: at milestone level, player picks A or B
export interface PerkBranch {
  milestone: number; // 10 or 25
  optionA: { name: string; description: string; id: string };
  optionB: { name: string; description: string; id: string };
}

export const MANAGER_PERK_BRANCHES: Record<string, PerkBranch[]> = {
  recruiter: [
    {
      milestone: 10,
      optionA: { id: "recruiter_beacon", name: "Temporal Beacon", description: "Every 60s, 2x customer wave spawns" },
      optionB: { id: "recruiter_rush", name: "Rush Hour", description: "Customer rate +50% during first 30s of each trip" },
    },
    {
      milestone: 25,
      optionA: { id: "recruiter_vip", name: "VIP Network", description: "VIP spawn chance doubled" },
      optionB: { id: "recruiter_bulk", name: "Bulk Booking", description: "Machine capacity effectively +2 for customer boarding" },
    },
  ],
  technician: [
    {
      milestone: 10,
      optionA: { id: "tech_slipstream", name: "Slipstream", description: "50% chance for 0 return travel time after each trip" },
      optionB: { id: "tech_precision", name: "Precision Routing", description: "Trip speed +20% permanently" },
    },
    {
      milestone: 25,
      optionA: { id: "tech_overclock", name: "Overclock", description: "Active: all trips instant for 10s (5min cooldown)" },
      optionB: { id: "tech_momentum", name: "Momentum", description: "Each consecutive trip is 5% faster, resets on idle (max 50%) [UI only - not yet wired]" },
    },
  ],
  accountant: [
    {
      milestone: 10,
      optionA: { id: "acct_compound", name: "Compound Interest", description: "Every 100 trips, base revenue +1% permanently" },
      optionB: { id: "acct_surge", name: "Revenue Surge", description: "Every 5th trip pays 2x revenue [UI only - not yet wired]" },
    },
    {
      milestone: 25,
      optionA: { id: "acct_timeshare", name: "Time-Share", description: "5% chance any trip pays 3x revenue" },
      optionB: { id: "acct_optimizer", name: "Fare Optimizer", description: "Base fare +15% at all destinations" },
    },
  ],
  "timeline-optimizer": [
    {
      milestone: 10,
      optionA: { id: "tlo_multiline", name: "Multi-Timeline", description: "Customers arrive in groups of 3" },
      optionB: { id: "tlo_efficiency", name: "Timeline Efficiency", description: "Queue fills 30% faster" },
    },
    {
      milestone: 25,
      optionA: { id: "tlo_convergence", name: "Timeline Convergence", description: "Every 5 min, gain 50 instant customers" },
      optionB: { id: "tlo_cascade", name: "Cascade Effect", description: "Completing a trip has 20% chance to immediately start another [UI only - not yet wired]" },
    },
  ],
};

interface ManagerPerksState {
  choices: Record<string, string>; // "managerId_milestone" -> chosen perkId
  pendingChoice: { managerId: string; milestone: number } | null;
  setPendingChoice: (val: { managerId: string; milestone: number } | null) => void;
  makeChoice: (managerId: string, milestone: number, perkId: string) => void;
  hasChosen: (managerId: string, milestone: number) => boolean;
  getChosenPerk: (managerId: string, milestone: number) => string | null;
  hasPerkId: (perkId: string) => boolean;
}

export const useManagerPerks = create<ManagerPerksState>()(
  persist(
    (set, get) => ({
      choices: {},
      pendingChoice: null,
      setPendingChoice: (val) => set({ pendingChoice: val }),
      makeChoice: (managerId, milestone, perkId) => {
        const key = `${managerId}_${milestone}`;
        set(s => ({
          choices: { ...s.choices, [key]: perkId },
          pendingChoice: null,
        }));
      },
      hasChosen: (managerId, milestone) => {
        const key = `${managerId}_${milestone}`;
        return !!get().choices[key];
      },
      getChosenPerk: (managerId, milestone) => {
        const key = `${managerId}_${milestone}`;
        return get().choices[key] || null;
      },
      hasPerkId: (perkId) => {
        return Object.values(get().choices).includes(perkId);
      },
    }),
    { name: "chronotransit-manager-perks", version: 1, migrate: (s: any) => ({ choices: {}, pendingChoice: null, ...s }) }
  )
);
