/**
 * DepthMap.tsx
 * -----------------------------------------------------------------------------
 * Side rail showing all 23 strata as a vertical mini-map. Each strip = one
 * stratum, colored by that era's palette. Click any strip to set it as
 * current. Highlights the in-viewport window and the current stratum.
 */

import { STRATA, ERA_PALETTES, ERA_META } from "../lib/pixelEngine";

interface Props {
  currentEra: string;
  unlockedEras?: string[];
  visibleWindow?: number;       // strata in viewport (default 3)
  height?: number;              // matches AntFarmScene's pixel height
  onSelect?: (era: string) => void;
  className?: string;
}

export default function DepthMap({
  currentEra,
  unlockedEras,
  visibleWindow = 3,
  height = 252,
  onSelect,
  className,
}: Props) {
  const currentIdx = STRATA.findIndex(s => s.era === currentEra);
  const startIdx = Math.max(0, Math.min(STRATA.length - visibleWindow, currentIdx - 1));
  const unlocked = new Set(unlockedEras ?? STRATA.map(s => s.era));

  return (
    <div
      className={className}
      style={{
        width: 56,
        height,
        background: "#06040a",
        borderLeft: "1px solid #1d1b26",
        position: "relative",
        flexShrink: 0,
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      }}
    >
      <div
        style={{
          position: "absolute", top: 4, left: 0, right: 0, textAlign: "center",
          color: "#55525f", fontSize: 7, letterSpacing: "0.1em",
        }}
      >
        DEPTH
      </div>
      <div
        style={{
          position: "absolute", top: 18, bottom: 4, left: 4, right: 4,
          display: "flex", flexDirection: "column",
        }}
      >
        {STRATA.map((s, i) => {
          const p = ERA_PALETTES[s.era];
          const isCurrent = i === currentIdx;
          const inViewport = i >= startIdx && i < startIdx + visibleWindow;
          const isUnlocked = unlocked.has(s.era);
          return (
            <button
              key={s.era}
              type="button"
              disabled={!isUnlocked}
              onClick={() => isUnlocked && onSelect?.(s.era)}
              aria-label={ERA_META[s.era]?.label || s.era}
              style={{
                flex: 1,
                background: isUnlocked ? p.B : "#1a1218",
                border: "none",
                borderTop: i === 0 ? "none" : "1px solid #0d0b14",
                position: "relative",
                cursor: isUnlocked ? "pointer" : "not-allowed",
                opacity: isUnlocked ? 1 : 0.35,
                padding: 0,
              }}
            >
              <div
                style={{
                  position: "absolute", left: 0, right: 0, top: "30%",
                  height: 1, background: isUnlocked ? p.A : "#33303d",
                }}
              />
              {inViewport && isUnlocked && (
                <div
                  style={{
                    position: "absolute", inset: 0,
                    background: `${p.E}22`,
                    border: `1px solid ${p.A}`,
                  }}
                />
              )}
              {isCurrent && (
                <>
                  <div
                    style={{
                      position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)",
                      width: 0, height: 0,
                      borderTop: "4px solid transparent",
                      borderBottom: "4px solid transparent",
                      borderRight: `5px solid ${p.E}`,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute", left: 2, top: "50%", transform: "translateY(-50%)",
                      fontSize: 6, color: p.E, fontWeight: 700,
                      textShadow: "0 0 2px #000",
                    }}
                  >
                    L{String(i + 1).padStart(2, "0")}
                  </div>
                </>
              )}
              {!isUnlocked && (
                <div
                  style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 7, color: "#55525f",
                  }}
                >
                  ▒
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
