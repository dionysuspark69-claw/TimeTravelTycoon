import { STRATA } from "./pixelEngine";
import { TIME_PERIODS } from "./stores/useIdleGame";

// The cross-section column ordered by GAME PROGRESSION (TIME_PERIODS order),
// not raw chronology. Travel between consecutive destinations is then always
// a one-stratum elevator ride, and stratum numbers match unlock order.
// Eras that exist only in the handoff art set (not as game destinations) are
// dropped from the column.
export const GAME_STRATA: { era: string; depth: string; landmark: any }[] = TIME_PERIODS.map(p => {
  const s = STRATA.find(s => s.era === p.id);
  return s ?? { era: p.id, depth: "????", landmark: "rift" as const };
});
