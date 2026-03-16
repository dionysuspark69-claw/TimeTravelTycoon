import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  use2DMode: boolean;
  toggle2DMode: () => void;
  set2DMode: (val: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      use2DMode: false,
      toggle2DMode: () => set((s) => ({ use2DMode: !s.use2DMode })),
      set2DMode: (val) => set({ use2DMode: val }),
    }),
    {
      name: "chronotransit-settings",
    }
  )
);
