import { useEffect, useState } from "react";
import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";

const ERA_ICONS: Record<string, string> = {
  dinosaur:    "🦕",
  egypt:       "🏺",
  rome:        "🏛️",
  medieval:    "⚔️",
  viking:      "🪓",
  renaissance: "🎨",
  industrial:  "⚙️",
  wildwest:    "🤠",
  roaring20s:  "🎷",
  spaceage:    "🚀",
  future:      "🌆",
  cyberpunk:   "🤖",
  atlantis:    "🌊",
  prehistoric: "🌋",
  mooncolony:  "🌕",
  aiutopia:    "💡",
  mars:        "🔴",
  timeorigin:  "⏳",
  quantum:     "⚛️",
  paradise:    "🌴",
  timeloop:    "🔄",
  multiversal: "🌌",
  temporal:    "✨",
};

const ERA_BG: Record<string, string> = {
  dinosaur:    "from-green-900/60 to-emerald-900/40",
  egypt:       "from-yellow-900/60 to-amber-800/40",
  rome:        "from-red-900/60 to-rose-900/40",
  medieval:    "from-purple-900/60 to-violet-900/40",
  viking:      "from-slate-800/60 to-gray-900/40",
  renaissance: "from-orange-900/60 to-amber-900/40",
  industrial:  "from-gray-800/60 to-zinc-900/40",
  wildwest:    "from-red-900/60 to-orange-900/40",
  roaring20s:  "from-yellow-800/60 to-amber-700/40",
  spaceage:    "from-blue-900/60 to-cyan-900/40",
  future:      "from-teal-900/60 to-cyan-800/40",
  cyberpunk:   "from-fuchsia-900/60 to-purple-900/40",
  atlantis:    "from-blue-900/60 to-teal-900/40",
  prehistoric: "from-orange-900/60 to-red-900/40",
  mooncolony:  "from-gray-700/60 to-slate-800/40",
  aiutopia:    "from-sky-900/60 to-blue-800/40",
  mars:        "from-red-800/60 to-orange-900/40",
  timeorigin:  "from-indigo-900/60 to-blue-900/40",
  quantum:     "from-violet-900/60 to-indigo-900/40",
  paradise:    "from-green-800/60 to-teal-700/40",
  timeloop:    "from-emerald-900/60 to-green-800/40",
  multiversal: "from-purple-900/60 to-fuchsia-900/40",
  temporal:    "from-pink-900/60 to-rose-900/40",
};

export function EraDisplay() {
  const currentDestination = useIdleGame(s => s.currentDestination);
  const [displayedDest, setDisplayedDest] = useState(currentDestination);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (currentDestination === displayedDest) return;
    // Fade out, swap, fade in
    setVisible(false);
    const t = setTimeout(() => {
      setDisplayedDest(currentDestination);
      setVisible(true);
    }, 350);
    return () => clearTimeout(t);
  }, [currentDestination]);

  const dest = TIME_PERIODS.find(d => d.id === displayedDest);
  if (!dest) return null;

  const icon = ERA_ICONS[dest.id] || "🕰️";
  const bg = ERA_BG[dest.id] || "from-gray-900/60 to-slate-900/40";

  return (
    <div
      className={`
        absolute top-2 left-1/2 -translate-x-1/2 z-10
        pointer-events-none select-none
        transition-all duration-300 ease-in-out
        w-max max-w-[90vw]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
    >
      {/* Mobile: slim single-line pill */}
      <div className="md:hidden">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10"
          style={{ borderColor: dest.color + "55" }}
        >
          <span className="text-lg leading-none">{icon}</span>
          <span className="text-sm font-bold leading-tight" style={{ color: dest.color }}>{dest.name}</span>
          <span className="text-xs text-gray-400">{dest.era}</span>
        </div>
      </div>

      {/* Desktop: full card */}
      <div
        className={`
          hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl
          bg-gradient-to-r ${bg}
          backdrop-blur-md border border-white/10
          shadow-lg
        `}
        style={{ borderColor: dest.color + "55" }}
      >
        <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: dest.color }} />
        <span className="text-3xl leading-none">{icon}</span>
        <div className="flex flex-col min-w-0">
          <span className="text-base font-bold leading-tight truncate" style={{ color: dest.color }}>{dest.name}</span>
          <span className="text-xs text-gray-400 leading-tight">{dest.era}</span>
          <span className="text-xs text-gray-500 leading-tight italic truncate max-w-[180px]">{dest.description}</span>
        </div>
        <div className="flex flex-col gap-0.5 ml-1 shrink-0">
          {dest.speedModifier !== 1.0 && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${dest.speedModifier > 1 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
              ⚡{dest.speedModifier > 1 ? "+" : ""}{((dest.speedModifier - 1) * 100).toFixed(0)}%
            </span>
          )}
          {dest.revenueModifier !== 1.0 && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${dest.revenueModifier > 1 ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"}`}>
              💰{dest.revenueModifier > 1 ? "+" : ""}{((dest.revenueModifier - 1) * 100).toFixed(0)}%
            </span>
          )}
          {dest.customerGenModifier !== 1.0 && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${dest.customerGenModifier > 1 ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300"}`}>
              👥{dest.customerGenModifier > 1 ? "+" : ""}{((dest.customerGenModifier - 1) * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
