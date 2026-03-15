import { useIdleGame } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX, Trophy, Clock } from "lucide-react";
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
    timeMachineLevel,
    timeMachineCount,
    prestigeLevel,
    prestigePoints,
    coinsPerSecond,
    prestige,
  } = useIdleGame();

  const { isMuted, toggleMute } = useAudio();
  const isMobile = useIsMobile();
  const { activeBoosts } = useAdBoosts();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCoinsPerSecond = (num: number) => {
    if (num < 1) return num.toFixed(2);
    if (num < 10) return num.toFixed(1);
    return formatChronoValue(num, 1);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const getActiveBoostTimer = () => {
    if (activeBoosts.length === 0) return null;
    const now = Date.now();
    const longest = activeBoosts.reduce((a, b) => (b.endsAt - now > a.endsAt - now ? b : a));
    return longest.endsAt - now;
  };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ paddingTop: 'env(safe-area-inset-top)' }}>

      {/* Settings / controls: fixed top-right, always on top of everything */}
      <div className="fixed top-2 right-2 z-[100] flex gap-2 pointer-events-auto">
        <SettingsDialog />
        {!isMobile && (
          <>
            <StatsPanel />
            <Button
              onClick={toggleMute}
              variant="outline"
              size="icon"
              className="bg-black/80 backdrop-blur-sm border-cyan-500/30 min-w-[44px] min-h-[44px]"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </>
        )}
      </div>

      <div className="p-2 md:p-4 flex flex-col gap-2 md:gap-4 h-full relative">

        {/* Coin card: top-left */}
        <div className="pointer-events-auto self-start">
          <Card className="bg-black/80 backdrop-blur-sm border-cyan-500/30 p-3 md:p-4 min-w-[150px] max-w-[200px]">
            <div className="text-cyan-400 text-xs md:text-sm mb-1">ChronoCoins</div>
            <div className="text-white text-2xl md:text-3xl font-bold">{formatChronoValue(chronocoins)}</div>
            <div className="text-gray-400 text-xs mt-1">Total: {formatChronoValue(totalEarned)}</div>
            {coinsPerSecond > 0 && (
              <div className="text-green-400 text-xs mt-1">+{formatCoinsPerSecond(coinsPerSecond)}/sec</div>
            )}
            {prestigeLevel > 0 && (
              <div className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Prestige {prestigeLevel} (+{prestigePoints * 10}% revenue)
              </div>
            )}
            {/* Mobile inline stats */}
            <div className="flex gap-2 mt-2 md:hidden">
              <span className="text-cyan-400 text-xs">⏳{Math.floor(waitingCustomers)}</span>
              <span className="text-green-400 text-xs">✈️{processingCustomers}</span>
              <span className="text-purple-400 text-xs">✅{formatChronoValue(totalCustomersServed)}</span>
            </div>
          </Card>
        </div>

        <div className="flex-1" />

        {/* Desktop stat pills */}
        <div className="hidden md:flex flex-wrap gap-2 items-end pointer-events-auto">
          <div className="flex gap-1 items-center bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-full px-3 py-1.5">
            <div className="text-cyan-400 text-sm font-semibold">Wait:</div>
            <div className="text-white text-base font-bold">{Math.floor(waitingCustomers)}</div>
          </div>
          <div className="flex gap-1 items-center bg-black/60 backdrop-blur-sm border border-green-500/30 rounded-full px-3 py-1.5">
            <div className="text-green-400 text-sm font-semibold">Trip:</div>
            <div className="text-white text-base font-bold">{processingCustomers}</div>
          </div>
          <div className="flex gap-1 items-center bg-black/60 backdrop-blur-sm border border-purple-500/30 rounded-full px-3 py-1.5">
            <div className="text-purple-400 text-sm font-semibold">Done:</div>
            <div className="text-white text-base font-bold">{formatChronoValue(totalCustomersServed)}</div>
          </div>
          {getActiveBoostTimer() && (
            <div className="flex gap-1 items-center bg-gradient-to-r from-yellow-600/80 to-orange-600/80 backdrop-blur-sm border border-yellow-400/50 rounded-full px-3 py-1.5 animate-pulse">
              <Clock className="w-4 h-4 text-yellow-200" />
              <div className="text-yellow-200 text-sm font-semibold">Ad Boost:</div>
              <div className="text-white text-base font-bold">{formatTime(getActiveBoostTimer()!)}</div>
            </div>
          )}
        </div>

        {/* Prestige button */}
        {totalEarned >= 50000000 && timeMachineLevel >= 25 && timeMachineCount >= 5 && (
          <div className="pointer-events-auto">
            <Button
              onClick={prestige}
              className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 h-14 md:h-16 w-full text-base md:text-lg font-bold min-h-[44px]"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Prestige
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
