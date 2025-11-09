import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX, Trophy, MapPin } from "lucide-react";
import { StatsPanel } from "./StatsPanel";
import { SettingsDialog } from "./SettingsDialog";
import { useIsMobile } from "@/hooks/use-is-mobile";

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
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return Math.floor(num).toString();
  };
  
  const formatCoinsPerSecond = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    if (num >= 1) return num.toFixed(1);
    return num.toFixed(2);
  };
  
  const currentDest = TIME_PERIODS.find(d => d.id === currentDestination);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="p-4 flex flex-col gap-4 h-full pointer-events-none relative">
        <div className="flex justify-between items-start gap-2 pointer-events-auto">
          <Card className="bg-black/80 backdrop-blur-sm border-cyan-500/30 p-4 min-w-[200px]">
            <div className="text-cyan-400 text-sm mb-2">ChronoCoins</div>
            <div className="text-white text-3xl font-bold">{formatNumber(chronocoins)}</div>
            <div className="text-gray-400 text-xs mt-1">Total: {formatNumber(totalEarned)}</div>
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
          
          {currentDest && (
            <Card 
              className="bg-black/80 backdrop-blur-sm border-cyan-500/30 p-3 min-w-[180px]"
              style={{
                borderColor: currentDest.color,
                borderWidth: 2
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" style={{ color: currentDest.color }} />
                <div className="text-white text-sm font-semibold">{currentDest.name}</div>
              </div>
              <div className="text-xs space-y-0.5">
                {currentDest.speedModifier !== 1.0 && (
                  <div className={currentDest.speedModifier > 1 ? "text-green-400" : "text-red-400"}>
                    Speed: {currentDest.speedModifier > 1 ? '+' : ''}{((currentDest.speedModifier - 1) * 100).toFixed(0)}%
                  </div>
                )}
                {currentDest.revenueModifier !== 1.0 && (
                  <div className={currentDest.revenueModifier > 1 ? "text-green-400" : "text-red-400"}>
                    Revenue: {currentDest.revenueModifier > 1 ? '+' : ''}{((currentDest.revenueModifier - 1) * 100).toFixed(0)}%
                  </div>
                )}
                {currentDest.customerGenModifier !== 1.0 && (
                  <div className={currentDest.customerGenModifier > 1 ? "text-green-400" : "text-red-400"}>
                    Customers: {currentDest.customerGenModifier > 1 ? '+' : ''}{((currentDest.customerGenModifier - 1) * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </Card>
          )}
          
          <div className="flex gap-2">
            {isMobile ? (
              <SettingsDialog />
            ) : (
              <>
                <StatsPanel />
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="icon"
                  className="bg-black/80 backdrop-blur-sm border-cyan-500/30"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex gap-2 items-end pointer-events-auto">
          <div className="flex gap-1 items-center bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-full px-3 py-1.5">
            <div className="text-cyan-400 text-xs font-semibold">Wait:</div>
            <div className="text-white text-base font-bold">{Math.floor(waitingCustomers)}</div>
          </div>
          <div className="flex gap-1 items-center bg-black/60 backdrop-blur-sm border border-green-500/30 rounded-full px-3 py-1.5">
            <div className="text-green-400 text-xs font-semibold">Trip:</div>
            <div className="text-white text-base font-bold">{processingCustomers}</div>
          </div>
          <div className="flex gap-1 items-center bg-black/60 backdrop-blur-sm border border-purple-500/30 rounded-full px-3 py-1.5">
            <div className="text-purple-400 text-xs font-semibold">Done:</div>
            <div className="text-white text-base font-bold">{formatNumber(totalCustomersServed)}</div>
          </div>
        </div>
        
        {totalEarned >= 100000 && (
          <div className="pointer-events-auto">
            <Button
              onClick={prestige}
              className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 h-16 w-full text-lg font-bold"
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
