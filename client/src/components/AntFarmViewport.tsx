/**
 * Example: AntFarmViewport.tsx
 * -----------------------------------------------------------------------------
 * Convenience wrapper combining AntFarmScene + DepthMap and wiring up the
 * "click stratum → travel there" interaction. Drop this into GameScene.tsx
 * to replace the existing 3D scene wholesale.
 *
 * Reads/writes useIdleGame directly — adapt the selector names to match your
 * actual store. Comments show the assumed shape.
 */

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import AntFarmScene from "./AntFarmScene";
import DepthMap from "./DepthMap";

// EXPECTED store shape — rename to match yours:
//   currentDestination: string          (era key)
//   unlockedDestinations: string[]      (era keys the player has unlocked)
//   processingCustomers: number
//   timeMachineLevel: number            (1..N)
//   setDestination(era: string): void
//
// If your store calls these differently, edit the selector below.
import { useIdleGame } from "../lib/stores/useIdleGame";

export default function AntFarmViewport() {
  const currentEra = useIdleGame(s => (s as any).currentDestination);
  const unlocked = useIdleGame(s => (s as any).unlockedDestinations) as string[] | undefined;
  const queueSize = useIdleGame(s => (s as any).processingCustomers ?? 0);
  const tierRaw = useIdleGame(s => (s as any).timeMachineLevel ?? 1);
  const setDestination = useIdleGame(s => (s as any).setDestination);

  const tier = Math.min(5, Math.max(1, Math.ceil(tierRaw / 4))) as 1 | 2 | 3 | 4 | 5;

  const onSelect = useCallback(
    (era: string) => setDestination?.(era),
    [setDestination],
  );

  // Measure the space GameScene gives us (the 50–60vh box) and scale the
  // scene to fill it. Phones get a narrower logical scene with one extra
  // stratum so the art renders ~2x bigger instead of shrinking a 720px strip.
  const measureRef = useRef<HTMLDivElement | null>(null);
  const [avail, setAvail] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const update = () => setAvail({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const RAIL_W = 56;
  const STRATUM_H = 84;
  const isNarrow = avail.w > 0 && avail.w < 640;
  const sceneW = isNarrow ? Math.max(320, Math.min(420, avail.w - RAIL_W)) : 720;
  const strataWindow = isNarrow ? 4 : 3;
  const naturalW = sceneW + RAIL_W;
  const naturalH = STRATUM_H * strataWindow;
  const scale = avail.w > 0
    ? Math.min(3, Math.max(0.5, Math.min(avail.w / naturalW, avail.h / naturalH)))
    : 1;

  return (
    <div
      ref={measureRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          background: "#000",
          border: "1px solid #1d1b26",
          width: naturalW,
          height: naturalH,
          flexShrink: 0,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <AntFarmScene
            currentEra={currentEra}
            unlockedEras={unlocked}
            queueSize={queueSize}
            tier={tier}
            width={sceneW}
            visibleWindow={strataWindow}
            onArrive={() => {
              // Hook for SFX, particle bursts, achievement triggers, etc.
            }}
          />
        </div>
        <DepthMap
          currentEra={currentEra}
          unlockedEras={unlocked}
          visibleWindow={strataWindow}
          height={naturalH}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
