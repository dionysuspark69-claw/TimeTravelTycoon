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

import { useCallback } from "react";
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

  // The viewport is sized to be drop-in for the current GameScene area
  // (50–60vh in your current code). Tune the width prop here for your layout.
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        background: "#000",
        border: "1px solid #1d1b26",
        width: "100%",
        maxWidth: 720 + 56,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <AntFarmScene
          currentEra={currentEra}
          unlockedEras={unlocked}
          queueSize={queueSize}
          tier={tier}
          width={720}
          onArrive={() => {
            // Hook for SFX, particle bursts, achievement triggers, etc.
          }}
        />
      </div>
      <DepthMap
        currentEra={currentEra}
        unlockedEras={unlocked}
        visibleWindow={3}
        height={84 * 3}
        onSelect={onSelect}
      />
    </div>
  );
}
