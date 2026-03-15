import { useState, useRef, useCallback } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { formatChronoValue } from "@/lib/utils";

const COMBO_DECAY_MS = 2000; // combo resets after 2s no click
const COMBO_THRESHOLDS = [1, 3, 7, 15, 30]; // clicks to reach each tier
const COMBO_MULTIPLIERS = [1, 2, 5, 10, 25];
const COMBO_LABELS = ["", "DOUBLE!", "5x COMBO!", "10x COMBO!", "MAX 25x!"];
const COMBO_COLORS = ["text-white", "text-yellow-300", "text-orange-400", "text-red-400", "text-fuchsia-400"];

interface FloatingCoin {
  id: number;
  x: number;
  y: number;
  amount: number;
  tier: number;
}

export function ComboClick() {
  const [clicks, setClicks] = useState(0);
  const [tier, setTier] = useState(0);
  const [floaters, setFloaters] = useState<FloatingCoin[]>([]);
  const [showComboLabel, setShowComboLabel] = useState(false);
  const decayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floaterIdRef = useRef(0);

  const { getCurrentFare, timeMachineCount, addChronocoins } = useIdleGame();

  const getTier = (clickCount: number) => {
    let t = 0;
    for (let i = COMBO_THRESHOLDS.length - 1; i >= 0; i--) {
      if (clickCount >= COMBO_THRESHOLDS[i]) { t = i; break; }
    }
    return t;
  };

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClicks(prev => {
      const newClicks = prev + 1;
      const newTier = getTier(newClicks);
      const multiplier = COMBO_MULTIPLIERS[newTier];

      // Coin award
      const fare = useIdleGame.getState().getCurrentFare();
      const count = useIdleGame.getState().timeMachineCount;
      const reward = Math.floor(fare * 5 * multiplier);
      addChronocoins(reward);

      // Show combo label if tier increased
      if (newTier > tier) {
        setTier(newTier);
        setShowComboLabel(true);
        setTimeout(() => setShowComboLabel(false), 1000);
      }

      // Floating coin
      floaterIdRef.current++;
      const fid = floaterIdRef.current;
      setFloaters(f => [...f, { id: fid, x, y, amount: reward, tier: newTier }]);
      setTimeout(() => setFloaters(f => f.filter(fl => fl.id !== fid)), 900);

      return newClicks;
    });

    // Reset decay timer
    if (decayRef.current) clearTimeout(decayRef.current);
    decayRef.current = setTimeout(() => {
      setClicks(0);
      setTier(0);
    }, COMBO_DECAY_MS);
  }, [tier, addChronocoins]);

  const currentTier = getTier(clicks);
  const nextThreshold = COMBO_THRESHOLDS[Math.min(currentTier + 1, COMBO_THRESHOLDS.length - 1)];
  const progress = currentTier >= COMBO_THRESHOLDS.length - 1
    ? 100
    : ((clicks - COMBO_THRESHOLDS[currentTier]) / (nextThreshold - COMBO_THRESHOLDS[currentTier])) * 100;

  return (
    <div
      className="absolute inset-0 z-10 pointer-events-auto cursor-pointer select-none"
      onClick={handleClick}
    >
      {/* Floating coin labels */}
      {floaters.map(f => (
        <div
          key={f.id}
          className={`absolute pointer-events-none font-bold text-sm animate-in fade-in zoom-in-75 duration-100 ${COMBO_COLORS[f.tier]}`}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            transform: "translate(-50%, -50%)",
            animation: "floatUp 0.9s ease-out forwards",
          }}
        >
          +{formatChronoValue(f.amount)}
        </div>
      ))}

      {/* Combo HUD -- bottom right of scene */}
      {clicks > 0 && (
        <div className="absolute bottom-10 right-3 flex flex-col items-end gap-1 pointer-events-none">
          {/* Combo label */}
          {showComboLabel && currentTier > 0 && (
            <div className={`text-sm font-black animate-in zoom-in-75 duration-200 ${COMBO_COLORS[currentTier]}`}>
              {COMBO_LABELS[currentTier]}
            </div>
          )}

          {/* Multiplier badge */}
          <div className={`flex items-center gap-1 bg-black/70 border rounded-full px-2.5 py-1 ${
            currentTier === 0 ? "border-white/20" :
            currentTier === 1 ? "border-yellow-400/50" :
            currentTier === 2 ? "border-orange-400/50" :
            currentTier === 3 ? "border-red-400/50" :
            "border-fuchsia-400/50"
          }`}>
            <span className="text-gray-400 text-xs">⚡</span>
            <span className={`text-xs font-bold ${COMBO_COLORS[currentTier]}`}>
              x{COMBO_MULTIPLIERS[currentTier]}
            </span>
          </div>

          {/* Progress to next tier */}
          {currentTier < COMBO_THRESHOLDS.length - 1 && (
            <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-100 ${
                  currentTier === 0 ? "bg-white" :
                  currentTier === 1 ? "bg-yellow-400" :
                  currentTier === 2 ? "bg-orange-400" :
                  "bg-red-400"
                }`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
