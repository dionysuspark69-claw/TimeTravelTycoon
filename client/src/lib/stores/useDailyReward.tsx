import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useIdleGame } from "./useIdleGame";

// Once-per-day login reward. Streak grows on consecutive days and resets if a
// day is missed. The reward scales with the player's current production so it
// stays meaningful at every stage without being game-breaking.
const DAY_MS = 24 * 60 * 60 * 1000;
const dayIndex = (t: number = Date.now()) => Math.floor(t / DAY_MS);
const MAX_STREAK_BONUS_DAYS = 6; // streak bonus caps at day 7 (+90%)

function computeReward(streak: number): number {
  const game = useIdleGame.getState();
  const cps = Math.max(0, game.coinsPerSecond || 0);
  const totalEarned = Math.max(0, game.totalEarned || 0);
  const streakMult = 1 + Math.min(Math.max(0, streak - 1), MAX_STREAK_BONUS_DAYS) * 0.15;
  // 20 minutes of production, or 2% of lifetime earnings, whichever is larger.
  const base = Math.max(cps * 60 * 20, totalEarned * 0.02, 500);
  const reward = Math.floor(base * streakMult);
  return Number.isFinite(reward) && reward > 0 ? reward : 500;
}

interface DailyRewardState {
  lastClaimedDay: number; // day index of last claim; -1 = never
  streak: number;
  lastReward: number;
  canClaim: () => boolean;
  nextStreak: () => number;
  previewReward: () => number;
  msUntilNextClaim: () => number;
  claim: () => number; // grants coins, returns amount (0 if not claimable)
}

export const useDailyReward = create<DailyRewardState>()(
  persist(
    (set, get) => ({
      lastClaimedDay: -1,
      streak: 0,
      lastReward: 0,

      canClaim: () => dayIndex() > get().lastClaimedDay,

      nextStreak: () => {
        const today = dayIndex();
        const { lastClaimedDay, streak } = get();
        if (lastClaimedDay < 0) return 1;
        if (today === lastClaimedDay + 1) return streak + 1;
        if (today > lastClaimedDay + 1) return 1; // missed a day → reset
        return streak; // same day
      },

      previewReward: () => computeReward(get().nextStreak()),

      msUntilNextClaim: () => {
        if (get().canClaim()) return 0;
        return (get().lastClaimedDay + 1) * DAY_MS - Date.now();
      },

      claim: () => {
        if (!get().canClaim()) return 0;
        const streak = get().nextStreak();
        const reward = computeReward(streak);
        useIdleGame.getState().addChronocoins(reward);
        set({ lastClaimedDay: dayIndex(), streak, lastReward: reward });
        return reward;
      },
    }),
    { name: "chronotransit-daily-reward", version: 1 },
  ),
);
