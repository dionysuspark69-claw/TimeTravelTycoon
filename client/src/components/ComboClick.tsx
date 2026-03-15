import { useState, useRef, useCallback, useEffect } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useChronoMeter } from "@/lib/stores/useChronoMeter";
import { formatChronoValue } from "@/lib/utils";

const DRAIN_RATE_MS = 50;        // tick every 50ms
const DRAIN_PER_TICK = 1.2;      // % drained per tick (~6s to empty)
const REFILL_AMOUNT = 100;       // click = full bar

interface FloatingCoin {
  id: number;
  x: number;
  y: number;
  amount: number;
  color: string;
}

function getBarColor(pct: number) {
  if (pct > 60) return { bar: "#22d3ee", glow: "shadow-cyan-500/60", label: "text-cyan-300", border: "border-cyan-400/60" };
  if (pct > 30) return { bar: "#facc15", glow: "shadow-yellow-500/60", label: "text-yellow-300", border: "border-yellow-400/60" };
  return { bar: "#ef4444", glow: "shadow-red-500/60", label: "text-red-300", border: "border-red-400/60" };
}

export function ComboClick() {
  const [bar, setBar] = useState(100);
  const [floaters, setFloaters] = useState<FloatingCoin[]>([]);
  const [hintDismissed, setHintDismissed] = useState(() =>
    !!localStorage.getItem("chronotransit_click_hint_dismissed")
  );
  const floaterIdRef = useRef(0);
  const barRef = useRef(100);
  const drainRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { addChronocoins } = useIdleGame();
  const { setBarPct } = useChronoMeter();

  // Drain loop
  useEffect(() => {
    drainRef.current = setInterval(() => {
      barRef.current = Math.max(0, barRef.current - DRAIN_PER_TICK);
      const rounded = Math.round(barRef.current);
      setBar(rounded);
      setBarPct(rounded);
    }, DRAIN_RATE_MS);
    return () => { if (drainRef.current) clearInterval(drainRef.current); };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Refill bar
    barRef.current = REFILL_AMOUNT;
    setBar(REFILL_AMOUNT);
    setBarPct(REFILL_AMOUNT);

    // Award coins based on bar level before click (reward for clicking early)
    const pct = barRef.current;
    const fare = useIdleGame.getState().getCurrentFare();
    const count = useIdleGame.getState().timeMachineCount;
    const multiplier = pct > 60 ? 8 : pct > 30 ? 5 : 3;
    const reward = Math.floor(fare * count * multiplier);
    addChronocoins(reward);

    // Floating coin
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    floaterIdRef.current++;
    const fid = floaterIdRef.current;
    const colors = getBarColor(pct);
    setFloaters(f => [...f, { id: fid, x, y, amount: reward, color: colors.label }]);
    setTimeout(() => setFloaters(f => f.filter(fl => fl.id !== fid)), 900);
  }, [addChronocoins]);

  const colors = getBarColor(bar);
  const isEmpty = bar === 0;

  return (
    <div
      className="absolute inset-0 z-10 pointer-events-auto cursor-pointer select-none"
      onClick={handleClick}
    >
      {/* Onboarding hint */}
      {!hintDismissed && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/85 border border-cyan-400/60 rounded-full px-4 py-1.5 shadow-lg pointer-events-auto">
          <span className="text-base">👆</span>
          <span className="text-cyan-300 text-xs font-semibold">Click to keep the Chrono Meter full and earn bonus coins!</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              localStorage.setItem("chronotransit_click_hint_dismissed", "1");
              setHintDismissed(true);
            }}
            className="text-gray-500 hover:text-white text-xs ml-1"
          >✕</button>
        </div>
      )}

      {/* Floating coin labels */}
      {floaters.map(f => (
        <div
          key={f.id}
          className={`absolute pointer-events-none font-bold text-sm ${f.color}`}
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

      {/* CHRONO METER BAR -- bottom of scene */}
      <div className="absolute bottom-8 left-4 right-4 pointer-events-none z-20">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold ${colors.label}`}>⚡ CHRONO METER</span>
          <span className={`text-xs font-bold ml-auto ${colors.label}`}>{bar}%</span>
          {isEmpty && (
            <span className="text-red-400 text-xs font-black animate-pulse ml-1">CLICK!</span>
          )}
        </div>

        {/* Track */}
        <div className={`w-full h-4 bg-gray-900 rounded-full border ${colors.border} overflow-hidden shadow-lg ${colors.glow}`}>
          {/* Fill */}
          <div
            className="h-full rounded-full transition-none relative overflow-hidden"
            style={{
              width: `${bar}%`,
              backgroundColor: colors.bar,
              boxShadow: `0 0 8px ${colors.bar}`,
              transition: bar === 100 ? "width 0.15s ease-out" : undefined,
            }}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Passive boost hint */}
        <div className="flex justify-between mt-0.5">
          <span className="text-gray-600 text-xs">passive boost: {bar > 60 ? "+50%" : bar > 30 ? "+20%" : "none"}</span>
          <span className="text-gray-600 text-xs">tap anywhere ↑</span>
        </div>
      </div>

      {/* Big empty state prompt */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-1 animate-pulse">
            <span className="text-4xl">👆</span>
            <span className="text-red-300 text-lg font-black">CLICK TO RECHARGE!</span>
          </div>
        </div>
      )}
    </div>
  );
}
