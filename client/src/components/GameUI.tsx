import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { useAudio } from "@/lib/stores/useAudio";
import { Volume2, VolumeX, Zap, Users, Gauge, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

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
    
    clickBoost,
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
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="p-4 flex flex-col gap-4 h-full pointer-events-none">
        <div className="flex justify-between items-start pointer-events-auto">
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
          
          <Button
            onClick={toggleMute}
            variant="outline"
            size="icon"
            className="bg-black/80 backdrop-blur-sm border-cyan-500/30"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
          <Card className="bg-black/80 backdrop-blur-sm border-cyan-500/30 p-3 flex-1">
            <div className="text-cyan-400 text-xs mb-1">Waiting</div>
            <div className="text-white text-xl font-bold">{Math.floor(waitingCustomers)}</div>
          </Card>
          <Card className="bg-black/80 backdrop-blur-sm border-cyan-500/30 p-3 flex-1">
            <div className="text-green-400 text-xs mb-1">Traveling</div>
            <div className="text-white text-xl font-bold">{processingCustomers}</div>
          </Card>
          <Card className="bg-black/80 backdrop-blur-sm border-cyan-500/30 p-3 flex-1">
            <div className="text-purple-400 text-xs mb-1">Served</div>
            <div className="text-white text-xl font-bold">{formatNumber(totalCustomersServed)}</div>
          </Card>
        </div>
        
        <div className="flex-1" />
        
        <div className="grid grid-cols-3 gap-2 pointer-events-auto">
          <Button
            onClick={() => handleWatchAd("revenue")}
            disabled={adCooldowns["revenue"] > 0}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 h-auto py-3 flex flex-col"
          >
            <Zap className="w-5 h-5 mb-1" />
            <span className="text-xs">2x Revenue</span>
            {getBoostTimeRemaining("revenue") > 0 ? (
              <span className="text-[10px] text-yellow-200">{getBoostTimeRemaining("revenue")}s</span>
            ) : adCooldowns["revenue"] > 0 ? (
              <span className="text-[10px]">{adCooldowns["revenue"]}s</span>
            ) : (
              <span className="text-[10px]">Watch Ad</span>
            )}
          </Button>
          
          <Button
            onClick={() => handleWatchAd("customers")}
            disabled={adCooldowns["customers"] > 0}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-auto py-3 flex flex-col"
          >
            <Users className="w-5 h-5 mb-1" />
            <span className="text-xs">+10 Customers</span>
            {adCooldowns["customers"] > 0 ? (
              <span className="text-[10px]">{adCooldowns["customers"]}s</span>
            ) : (
              <span className="text-[10px]">Watch Ad</span>
            )}
          </Button>
          
          <Button
            onClick={() => handleWatchAd("speed")}
            disabled={adCooldowns["speed"] > 0}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 h-auto py-3 flex flex-col"
          >
            <Gauge className="w-5 h-5 mb-1" />
            <span className="text-xs">2x Speed</span>
            {getBoostTimeRemaining("speed") > 0 ? (
              <span className="text-[10px] text-green-200">{getBoostTimeRemaining("speed")}s</span>
            ) : adCooldowns["speed"] > 0 ? (
              <span className="text-[10px]">{adCooldowns["speed"]}s</span>
            ) : (
              <span className="text-[10px]">Watch Ad</span>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 pointer-events-auto">
          <Button
            onClick={clickBoost}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 h-16 text-lg font-bold"
          >
            Click Boost!
          </Button>
          
          <Button
            onClick={prestige}
            disabled={totalEarned < 100000}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 h-16 text-lg font-bold disabled:opacity-50"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Prestige
          </Button>
        </div>
      </div>
    </div>
  );
}
