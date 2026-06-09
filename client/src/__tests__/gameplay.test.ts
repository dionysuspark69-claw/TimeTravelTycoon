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
});
