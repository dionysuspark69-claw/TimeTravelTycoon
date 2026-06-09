import { describe, it, expect, beforeEach, vi } from "vitest";

describe("audit fix verification", () => {
  beforeEach(() => { vi.resetModules(); localStorage.clear(); });

  it("VIPs spawn again after prestige", async () => {
    const { useIdleGame } = await import("../lib/stores/useIdleGame");
    const g = () => useIdleGame.getState();

    // Get to prestige eligibility, then prestige.
    for (let i = 0; i < 80; i++) { g().addChronocoins(1e12); g().upgradeTimeMachine(1); g().buyTimeMachine(1); }
    g().prestige();

    // Base vipChance must be restored to 1 (was 0.05, below the spawn gate).
    expect(g().vipChance).toBe(1);

    // Buy one VIP level so vipChance > 1, then run a busy session.
    g().addChronocoins(1e12);
    g().upgradeVipChance(5);
    expect(g().vipChance).toBeGreaterThan(1);

    // Pin Math.random low so every spawn with vipChance > 1 is deterministically
    // VIP — isolates "the spawn gate passes again" from RNG variance. Entities
    // board and leave the array fast, so track unique ids rather than snapshots.
    const rnd = vi.spyOn(Math, "random").mockReturnValue(0.0001);
    const seen = new Set<string>();
    let vipSeen = 0;
    try {
      for (let i = 0; i < 1000; i++) {
        g().update(200, { customerRate: 1, speed: 0.5, revenue: 0.5 }, { hasVIP: false, hasSlipstream: false, hasTimeShare: false, hasTemporalBeacon: false });
        for (const e of g().customerEntities as any[]) {
          if (!seen.has(e.id)) { seen.add(e.id); if (e.isVIP) vipSeen++; }
        }
      }
    } finally {
      rnd.mockRestore();
    }
    expect(vipSeen).toBeGreaterThan(0);
  }, 30000);

  it("calculateBulkCost is finite when multiplier === 1", async () => {
    const { useIdleGame } = await import("../lib/stores/useIdleGame");
    const cost = useIdleGame.getState().calculateBulkCost(100, 1, 1, 50);
    expect(Number.isFinite(cost)).toBe(true);
    expect(cost).toBe(5000); // 100 * 50, linear when multiplier is 1
  });

  it("prestige points use a bounded sqrt curve (no runaway at high earnings)", async () => {
    const { getPrestigePoints } = await import("../lib/utils");
    // ~50M first-prestige threshold ≈ old linear value of 5.
    expect(getPrestigePoints(50_000_000)).toBe(5);
    // A 2.9T balance must NOT yield ~290k points (old linear); sqrt keeps it ~1k.
    const whale = getPrestigePoints(2_908_256_962_379);
    expect(whale).toBeGreaterThan(500);
    expect(whale).toBeLessThan(5000);
    // Monotonic and always at least 1.
    expect(getPrestigePoints(0)).toBe(1);
    expect(getPrestigePoints(1e9)).toBeGreaterThan(getPrestigePoints(1e8));
  });

  it("daily reward: claim grants coins once per day, builds a streak, blocks re-claim", async () => {
    const { useIdleGame } = await import("../lib/stores/useIdleGame");
    const { useDailyReward } = await import("../lib/stores/useDailyReward");
    useIdleGame.setState({ chronocoins: 0, totalEarned: 1_000_000, coinsPerSecond: 100 });

    expect(useDailyReward.getState().canClaim()).toBe(true);
    const reward = useDailyReward.getState().claim();
    expect(reward).toBeGreaterThan(0);
    expect(useIdleGame.getState().chronocoins).toBe(reward);
    expect(useDailyReward.getState().streak).toBe(1);

    // Second claim same day is a no-op.
    expect(useDailyReward.getState().canClaim()).toBe(false);
    expect(useDailyReward.getState().claim()).toBe(0);

    // Simulate "yesterday" so the next claim continues the streak.
    const DAY = 24 * 60 * 60 * 1000;
    useDailyReward.setState({ lastClaimedDay: Math.floor(Date.now() / DAY) - 1 });
    expect(useDailyReward.getState().canClaim()).toBe(true);
    expect(useDailyReward.getState().nextStreak()).toBe(2);
    useDailyReward.getState().claim();
    expect(useDailyReward.getState().streak).toBe(2);

    // A missed day resets the streak to 1.
    useDailyReward.setState({ lastClaimedDay: Math.floor(Date.now() / DAY) - 3 });
    expect(useDailyReward.getState().nextStreak()).toBe(1);
  });
});
