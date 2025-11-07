import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowUp, MapPin } from "lucide-react";
import { ManagersPanel } from "./ManagersPanel";
import { AchievementsPanel } from "./AchievementsPanel";

export function UpgradePanel() {
  const {
    chronocoins,
    timeMachineLevel,
    timeMachineCapacity,
    timeMachineSpeed,
    customerGenerationRate,
    unlockedDestinations,
    currentDestination,
    
    upgradeTimeMachine,
    upgradeCapacity,
    upgradeSpeed,
    upgradeCustomerRate,
    unlockDestination,
    setDestination,
    
    getTimeMachineUpgradeCost,
    getCapacityUpgradeCost,
    getSpeedUpgradeCost,
    getCustomerRateUpgradeCost,
  } = useIdleGame();
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return Math.floor(num).toString();
  };
  
  return (
    <div className="w-full bg-black/80 backdrop-blur-sm border-t border-cyan-500/30 p-4">
      <Tabs defaultValue="upgrades" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-900">
          <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upgrades" className="space-y-2 mt-4">
          <Card className="bg-gray-900/50 border-cyan-500/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Time Machine Level</div>
                <div className="text-gray-400 text-sm">Level {timeMachineLevel} - Increase fare per trip</div>
              </div>
              <Button
                onClick={upgradeTimeMachine}
                disabled={chronocoins < getTimeMachineUpgradeCost()}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                {formatNumber(getTimeMachineUpgradeCost())}
              </Button>
            </div>
          </Card>
          
          <Card className="bg-gray-900/50 border-cyan-500/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Capacity</div>
                <div className="text-gray-400 text-sm">Level {timeMachineCapacity} - Customers per trip</div>
              </div>
              <Button
                onClick={upgradeCapacity}
                disabled={chronocoins < getCapacityUpgradeCost()}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                {formatNumber(getCapacityUpgradeCost())}
              </Button>
            </div>
          </Card>
          
          <Card className="bg-gray-900/50 border-cyan-500/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Speed</div>
                <div className="text-gray-400 text-sm">Level {timeMachineSpeed} - Faster trips</div>
              </div>
              <Button
                onClick={upgradeSpeed}
                disabled={chronocoins < getSpeedUpgradeCost()}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                {formatNumber(getSpeedUpgradeCost())}
              </Button>
            </div>
          </Card>
          
          <Card className="bg-gray-900/50 border-cyan-500/30 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">Customer Generation</div>
                <div className="text-gray-400 text-sm">Level {customerGenerationRate} - More customers</div>
              </div>
              <Button
                onClick={upgradeCustomerRate}
                disabled={chronocoins < getCustomerRateUpgradeCost()}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                {formatNumber(getCustomerRateUpgradeCost())}
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="managers" className="space-y-2 mt-4">
          <ManagersPanel />
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-2 mt-4">
          <AchievementsPanel />
        </TabsContent>
        
        <TabsContent value="destinations" className="space-y-2 mt-4">
          {TIME_PERIODS.map((destination) => {
            const isUnlocked = unlockedDestinations.includes(destination.id);
            const isCurrent = currentDestination === destination.id;
            
            return (
              <Card
                key={destination.id}
                className="bg-gray-900/50 border-cyan-500/30 p-3"
                style={{
                  borderColor: isCurrent ? destination.color : undefined,
                  borderWidth: isCurrent ? 2 : 1
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: destination.color }}
                      />
                      {destination.name}
                    </div>
                    <div className="text-gray-400 text-sm">{destination.era}</div>
                    <div className="text-gray-500 text-xs">{destination.description}</div>
                    <div className="text-cyan-400 text-sm mt-1">Base Fare: {destination.baseFare}</div>
                  </div>
                  {!isUnlocked ? (
                    <Button
                      onClick={() => unlockDestination(destination.id)}
                      disabled={chronocoins < destination.unlockCost}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Unlock {formatNumber(destination.unlockCost)}
                    </Button>
                  ) : !isCurrent ? (
                    <Button
                      onClick={() => setDestination(destination.id)}
                      size="sm"
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Select
                    </Button>
                  ) : (
                    <div className="text-green-400 text-sm font-semibold">Active</div>
                  )}
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
