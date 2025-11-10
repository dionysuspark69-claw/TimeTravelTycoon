import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useManagers, MANAGER_TYPES } from "@/lib/stores/useManagers";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowUp, Users, Zap, DollarSign, Star, Crown, Sparkles, Bolt } from "lucide-react";
import { useState, useEffect } from "react";
import { formatChronoValue } from "@/lib/utils";

export function ManagersPanel() {
  const { chronocoins, spendChronocoins } = useIdleGame();
  const { 
    upgradeManager, 
    getManagerLevel, 
    getManagerCost, 
    getUnlockedPerks, 
    triggerOverclock,
    overclockActive,
    overclockEndsAt,
    overclockCooldownEndsAt,
    hasPerk
  } = useManagers();
  
  const [overclockTimeLeft, setOverclockTimeLeft] = useState(0);
  const [overclockCooldownLeft, setOverclockCooldownLeft] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setOverclockTimeLeft(Math.max(0, Math.ceil((overclockEndsAt - now) / 1000)));
      setOverclockCooldownLeft(Math.max(0, Math.ceil((overclockCooldownEndsAt - now) / 1000)));
    }, 100);
    
    return () => clearInterval(interval);
  }, [overclockEndsAt, overclockCooldownEndsAt]);
  
  const getIcon = (bonusType: string) => {
    switch (bonusType) {
      case "customerRate":
        return <Users className="w-5 h-5" />;
      case "speed":
        return <Zap className="w-5 h-5" />;
      case "revenue":
        return <DollarSign className="w-5 h-5" />;
      default:
        return null;
    }
  };
  
  const getBonusLabel = (bonusType: string) => {
    switch (bonusType) {
      case "customerRate":
        return "Customer Generation";
      case "speed":
        return "Trip Speed";
      case "revenue":
        return "Revenue";
      default:
        return "Bonus";
    }
  };
  
  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-white font-semibold text-lg mb-3">Managers</h3>
      {MANAGER_TYPES.map((manager) => {
        const level = getManagerLevel(manager.id);
        const cost = getManagerCost(manager.id);
        const isMaxLevel = level >= manager.maxLevel;
        const bonusAmount = (level * manager.bonusPerLevel * 100).toFixed(0);
        const unlockedPerks = getUnlockedPerks(manager.id);
        
        return (
          <Card
            key={manager.id}
            className="bg-gray-900/50 border-cyan-500/30 p-3"
            style={{
              borderLeftWidth: 4,
              borderLeftColor: manager.color
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold flex items-center gap-2">
                  {getIcon(manager.bonusType)}
                  {manager.name}
                </div>
                <div className="text-gray-400 text-sm">{manager.description}</div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="text-cyan-400 text-sm">
                    Level {level}/{manager.maxLevel}
                  </div>
                  {level > 0 && (
                    <div className="text-green-400 text-sm font-semibold bg-green-500/10 px-2 py-0.5 rounded">
                      +{bonusAmount}% {getBonusLabel(manager.bonusType)}
                    </div>
                  )}
                </div>
                
                {unlockedPerks.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {unlockedPerks.map((perk, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        {perk.type === "active" ? (
                          <Crown className="w-3 h-3 text-yellow-400" />
                        ) : (
                          <Star className="w-3 h-3 text-purple-400" />
                        )}
                        <span className="text-purple-300 font-semibold">{perk.name}:</span>
                        <span className="text-gray-400">{perk.description}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {manager.perks.filter(p => level < p.level).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {manager.perks.filter(p => level < p.level).map((perk, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                        <Sparkles className="w-3 h-3" />
                        <span className="font-semibold">Level {perk.level}: {perk.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {manager.id === "technician" && hasPerk("technician", 25) && (
                  <Button
                    onClick={triggerOverclock}
                    disabled={overclockActive || overclockCooldownLeft > 0}
                    size="sm"
                    className={`min-h-[44px] ${overclockActive ? "bg-yellow-600 animate-pulse" : "bg-purple-600 hover:bg-purple-700"}`}
                  >
                    <Bolt className="w-4 h-4 mr-1" />
                    {overclockActive 
                      ? `Active ${overclockTimeLeft}s` 
                      : overclockCooldownLeft > 0 
                        ? `${Math.floor(overclockCooldownLeft / 60)}:${(overclockCooldownLeft % 60).toString().padStart(2, '0')}`
                        : "Overclock"}
                  </Button>
                )}
                {!isMaxLevel ? (
                  <Button
                    onClick={() => upgradeManager(manager.id, chronocoins, spendChronocoins)}
                    disabled={chronocoins < cost}
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700 min-h-[44px]"
                  >
                    <ArrowUp className="w-4 h-4 mr-1" />
                    {formatChronoValue(cost)}
                  </Button>
                ) : (
                  <div className="text-yellow-400 text-sm font-semibold">MAX</div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
