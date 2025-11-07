import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useManagers, MANAGER_TYPES } from "@/lib/stores/useManagers";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowUp, Users, Zap, DollarSign } from "lucide-react";

export function ManagersPanel() {
  const { chronocoins, spendChronocoins } = useIdleGame();
  const { upgradeManager, getManagerLevel, getManagerCost } = useManagers();
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return Math.floor(num).toString();
  };
  
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
  
  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-white font-semibold text-lg mb-3">Managers</h3>
      {MANAGER_TYPES.map((manager) => {
        const level = getManagerLevel(manager.id);
        const cost = getManagerCost(manager.id);
        const isMaxLevel = level >= manager.maxLevel;
        const bonusAmount = (level * manager.bonusPerLevel * 100).toFixed(0);
        
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
                <div className="text-cyan-400 text-sm mt-1">
                  Level {level}/{manager.maxLevel}
                  {level > 0 && <span className="text-green-400 ml-2">+{bonusAmount}% bonus</span>}
                </div>
              </div>
              {!isMaxLevel ? (
                <Button
                  onClick={() => upgradeManager(manager.id, chronocoins, spendChronocoins)}
                  disabled={chronocoins < cost}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <ArrowUp className="w-4 h-4 mr-1" />
                  {formatNumber(cost)}
                </Button>
              ) : (
                <div className="text-yellow-400 text-sm font-semibold">MAX</div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
