import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX, Trophy } from "lucide-react";
import { StatsPanel } from "./StatsPanel";
import { SettingsDialog } from "./SettingsDialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useAdBoosts } from "@/lib/stores/useAdBoosts";
import { useState, useEffect } from "react";
import { formatChronoValue } from "@/lib/utils";

export function GameUI() {
  const {
    chronocoins,
    totalEarned,
    waitingCustomers,
    processingCustomers,
    totalCustomersServed,
    currentDestination,
    prestigeLevel,
    prestigePoints,
    coinsPerSecond,
  } = useIdleGame();

  const { isMuted, toggleMute } = useAudio();
  const isMobile = useIsMobile();
  const { activeBoosts } = useAdBoosts();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCps = (num: number) => {
    if (num < 1) return num.toFixed(2);
    if (num < 10) return num.toFixed(1);
    return formatChronoValue(num, 1);
  };

  const formatTime = (ms: number) => {
    const s = Math.ceil(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const boostTimer = (() => {
    if (activeBoosts.length === 0) return null;
    const now = Date.now();
    const best = activeBoosts.reduce((a, b) => (b.endsAt - now > a.endsAt - now ? b : a));
    const rem = best.endsAt - now;
    return rem > 0 ? rem : null;
  })();

  const currentDest = TIME_PERIODS.find(d => d.id === currentDestination);

  return (
    <>
      {/* Fixed settings - always on top right */}
      <div className="fixed top-2 right-2 z-50 pointer-events-auto flex gap-1" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {!isMobile && <StatsPanel />}
        {!isMobile && (
          <Button onClick={toggleMute} variant="outline" size="icon" className="bg-black/80 backdrop-blur-sm border-cyan-500/30 h-9 w-9">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </Button>
        )}
        <SettingsDialog />
      </div>

      {/* Flat top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="bg-black/75 backdrop-blur-sm border-b border-cyan-500/20 px-3 py-2 pointer-events-auto pr-28">
          {/* Row 1: coins + cps */}
          <div className="flex items-baseline gap-2">
            <span className="text-white text-xl font-bold leading-none">{formatChronoValue(chronocoins)}</span>
            <span className="text-cyan-400 text-xs">CC</span>
            {coinsPerSecond > 0 && (
              <span className="text-green-400 text-xs">+{formatCps(coinsPerSecond)}/s</span>
            )}
            {prestigeLevel > 0 && (
              <span className="text-yellow-400 text-xs flex items-center gap-0.5 ml-1">
                <Trophy className="w-3 h-3" />P{prestigeLevel}
              </span>
            )}
            {currentDest && (
              <span className="text-xs ml-auto" style={{ color: currentDest.color }}>{currentDest.name}</span>
            )}
          </div>
          {/* Row 2: stats */}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-cyan-400 text-xs">Wait <span className="text-white font-semibold">{Math.floor(waitingCustomers)}</span></span>
            <span className="text-green-400 text-xs">Trip <span className="text-white font-semibold">{processingCustomers}</span></span>
            <span className="text-purple-400 text-xs">Done <span className="text-white font-semibold">{formatChronoValue(totalCustomersServed)}</span></span>
            {boostTimer && (
              <span className="text-yellow-300 text-xs ml-auto">Boost {formatTime(boostTimer)}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
