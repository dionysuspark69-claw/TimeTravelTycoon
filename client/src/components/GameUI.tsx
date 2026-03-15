import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX, Trophy, Clock } from "lucide-react";
import { StatsPanel } from "./StatsPanel";
import { SettingsDialog } from "./SettingsDialog";
import { AuthDisplay } from "./AuthDisplay";
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
    timeMachineCapacity,
    timeMachineSpeed,
    timeMachineCount,
    customerGenerationRate,
    currentDestination,
    unlockedDestinations,
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
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const getActiveBoostTimer = () => {
    if (activeBoosts.length === 0) return null;
    const now = Date.now();
    const longestBoost = activeBoosts.reduce((longest, boost) => {
      const remaining = boost.endsAt - now;
      const longestRemaining = longest.endsAt - now;
      return remaining > longestRemaining ? boost : longest;
    });
    return longestBoost.endsAt - now;
  };
  
  const currentDest = TIME_PERIODS.find(d => d.id === currentDestination);
  
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="p-2 md:p-4 flex flex-col gap-2 md:gap-4 h-full pointer-events-none relative">
        <div className="grid grid-cols-1 md:flex md:justify-between md:items-start gap-2 pointer-events-auto">
          <div className="grid grid-cols-2 gap-2 md:contents">
            <Card className="bg-black/80 backdrop-blur-sm border-cyan-500/30 p-3 md:p-4 min-w-0 md:min-w-[200px]">
              <div className="text-cyan-400 text-xs md:text-sm mb-1 md:mb-2">ChronoCoins</div>
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
            </Card>
            

          </div>
          
          <div className="flex gap-2 justify-end">
            <AuthDisplay />
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
        </div>
        
        <div className="flex-1" />
        
        <div className="flex flex-wrap gap-2 items-end pointer-events-auto">
          <div className="flex gap-1 items-center bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-full px-2 md:px-3 py-1 md:py-1.5">
            <div className="text-cyan-400 text-xs md:text-sm font-semibold">Wait:</div>
            <div className="text-white text-sm md:text-base font-bold">{Math.floor(waitingCustomers)}</div>
          </div>
          <div className="flex gap-1 items-center bg-black/60 backdrop-blur-sm border border-green-500/30 rounded-full px-2 md:px-3 py-1 md:py-1.5">
            <div className="text-green-400 text-xs md:text-sm font-semibold">Trip:</div>
            <div className="text-white text-sm md:text-base font-bold">{processingCustomers}</div>
          </div>
          <div className="flex gap-1 items-center bg-black/60 backdrop-blur-sm border border-purple-500/30 rounded-full px-2 md:px-3 py-1 md:py-1.5">
            <div className="text-purple-400 text-xs md:text-sm font-semibold">Done:</div>
            <div className="text-white text-sm md:text-base font-bold">{formatChronoValue(totalCustomersServed)}</div>
          </div>
          {getActiveBoostTimer() && (
            <div className="flex gap-1 items-center bg-gradient-to-r from-yellow-600/80 to-orange-600/80 backdrop-blur-sm border border-yellow-400/50 rounded-full px-2 md:px-3 py-1 md:py-1.5 animate-pulse">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-200" />
              <div className="text-yellow-200 text-xs md:text-sm font-semibold">Ad Boost:</div>
              <div className="text-white text-sm md:text-base font-bold">{formatTime(getActiveBoostTimer()!)}</div>
            </div>
          )}
        </div>
        
        {totalEarned >= 50000000 && timeMachineLevel >= 25 && timeMachineCount >= 5 && (
          <div className="pointer-events-auto">
            <Button
              onClick={prestige}
              className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 h-14 md:h-16 w-full text-base md:text-lg font-bold min-h-[44px]"
            >
              <Trophy className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Prestige
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
