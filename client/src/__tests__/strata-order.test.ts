import { describe, it, expect } from "vitest";
import { GAME_STRATA } from "../lib/strataOrder";
import { TIME_PERIODS } from "../lib/stores/useIdleGame";
import { STRATA, ERA_PALETTES, TERRAIN, CHARACTERS } from "../lib/pixelEngine";

describe("strata column order", () => {
  it("matches game progression order exactly, one stratum per destination", () => {
    expect(GAME_STRATA.length).toBe(TIME_PERIODS.length);
    expect(GAME_STRATA.map(s => s.era)).toEqual(TIME_PERIODS.map(p => p.id));
  });

  it("every game era has real art (no fallback strata needed)", () => {
    const missing = TIME_PERIODS.filter(p => !STRATA.some(s => s.era === p.id)).map(p => p.id);
    expect(missing).toEqual([]);
    for (const p of TIME_PERIODS) {
      expect(ERA_PALETTES[p.id], `palette for ${p.id}`).toBeTruthy();
      expect(TERRAIN[p.id], `terrain for ${p.id}`).toBeTruthy();
      expect(CHARACTERS[p.id], `characters for ${p.id}`).toBeTruthy();
    }
  });

  it("consecutive unlocks are adjacent strata (one-step elevator rides)", () => {
    for (let i = 1; i < TIME_PERIODS.length; i++) {
      const a = GAME_STRATA.findIndex(s => s.era === TIME_PERIODS[i - 1].id);
      const b = GAME_STRATA.findIndex(s => s.era === TIME_PERIODS[i].id);
      expect(b - a).toBe(1);
    }
  });
});
