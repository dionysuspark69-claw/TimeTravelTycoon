import { create } from "zustand";

interface ChronoMeterState {
  barPct: number;
  setBarPct: (pct: number) => void;
  getBonus: () => number; // revenue multiplier bonus from bar
}

export const useChronoMeter = create<ChronoMeterState>((set, get) => ({
  barPct: 100,
  setBarPct: (pct) => set({ barPct: pct }),
  getBonus: () => {
    const { barPct } = get();
    if (barPct > 60) return 0.5;  // +50% revenue
    if (barPct > 30) return 0.2;  // +20% revenue
    return 0;
  },
}));
