import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX, Zap, Users, Gauge, Trophy, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { StatsPanel } from "./StatsPanel";

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
    activeBoosts,
    
    upgradeTimeMachine,
    upgradeCapacity,
    upgradeSpeed,
    upgradeCustomerRate,
    unlockDestination,
    setDestination,
    watchAd,
    prestige,
    
    getTimeMachineUpgradeCost,
    getCapacityUpgradeCost,
    getSpeedUpgradeCost,
    getCustomerRateUpgradeCost,
  } = useIdleGame();
  
  const { isMuted, toggleMute } = useAudio();
  const [adCooldowns, setAdCooldowns] = useState<Record<string, number>>({});
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAdCooldowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key] > 0) {
            updated[key] = Math.max(0, updated[key] - 1);
          }
        });
        return updated;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleWatchAd = (type: "revenue" | "customers" | "speed") => {
    if (adCooldowns[type] && adCooldowns[type] > 0) return;
    
    watchAd(type);
    setAdCooldowns(prev => ({ ...prev, [type]: 60 }));
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return Math.floor(num).toString();
  };
  
  const getBoostTimeRemaining = (type: string) => {
    const boost = activeBoosts.find(b => b.type === type);
    if (!boost) return 0;
    return Math.max(0, Math.ceil((boost.endsAt - Date.now()) / 1000));
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
            <StatsPanel />
            <Button
              onClick={toggleMute}
              variant="outline"
              size="icon"
              className="bg-black/80 backdrop-blur-sm border-cyan-500/30"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto">
          <Button
            onClick={() => handleWatchAd("revenue")}
            disabled={adCooldowns["revenue"] > 0}
            className="bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-xl w-24 h-24 relative shadow-lg border-2 border-yellow-400/50 flex flex-col items-center justify-center p-2 disabled:opacity-60"
          >
            <Zap className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-bold text-white">Revenue</span>
            <span className="text-xs font-extrabold text-yellow-200">2x</span>
            {getBoostTimeRemaining("revenue") > 0 ? (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                {getBoostTimeRemaining("revenue")}s
              </span>
            ) : adCooldowns["revenue"] > 0 ? (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                {adCooldowns["revenue"]}s
              </span>
            ) : null}
          </Button>
          
          <Button
            onClick={() => handleWatchAd("customers")}
            disabled={adCooldowns["customers"] > 0}
            className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl w-24 h-24 relative shadow-lg border-2 border-blue-400/50 flex flex-col items-center justify-center p-2 disabled:opacity-60"
          >
            <Users className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-bold text-white">Customers</span>
            <span className="text-xs font-extrabold text-blue-200">+10</span>
            {getBoostTimeRemaining("customers") > 0 ? (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-blue-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                {getBoostTimeRemaining("customers")}s
              </span>
            ) : adCooldowns["customers"] > 0 ? (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                {adCooldowns["customers"]}s
              </span>
            ) : null}
          </Button>
          
          <Button
            onClick={() => handleWatchAd("speed")}
            disabled={adCooldowns["speed"] > 0}
            className="bg-gradient-to-br from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-xl w-24 h-24 relative shadow-lg border-2 border-green-400/50 flex flex-col items-center justify-center p-2 disabled:opacity-60"
          >
            <Gauge className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-bold text-white">Speed</span>
            <span className="text-xs font-extrabold text-green-200">2x</span>
            {getBoostTimeRemaining("speed") > 0 ? (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-green-400 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                {getBoostTimeRemaining("speed")}s
              </span>
            ) : adCooldowns["speed"] > 0 ? (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">
                {adCooldowns["speed"]}s
              </span>
            ) : null}
          </Button>
        </div>
        
        <div className="flex-1" />
        
        <div className="flex gap-2 items-end pointer-events-auto">
          <div className="flex gap-1 items-center bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-2 py-1">
            <div className="text-cyan-400 text-[10px]">Wait:</div>
            <div className="text-white text-sm font-bold">{Math.floor(waitingCustomers)}</div>
          </div>
          <div className="flex gap-1 items-center bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-2 py-1">
            <div className="text-green-400 text-[10px]">Trip:</div>
            <div className="text-white text-sm font-bold">{processingCustomers}</div>
          </div>
          <div className="flex gap-1 items-center bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-2 py-1">
            <div className="text-purple-400 text-[10px]">Done:</div>
            <div className="text-white text-sm font-bold">{formatNumber(totalCustomersServed)}</div>
          </div>
        </div>
        
        <div className="pointer-events-auto">
          <Button
            onClick={prestige}
            disabled={totalEarned < 100000}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 h-16 w-full text-lg font-bold disabled:opacity-50"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Prestige
          </Button>
        </div>
      </div>
    </div>
  );
}
