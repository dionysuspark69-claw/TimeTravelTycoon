import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowUp, MapPin, Users, Trophy, Settings, Plus, Minus, Target, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { ManagersPanel } from "./ManagersPanel";
import { AchievementsPanel } from "./AchievementsPanel";
import { MissionsPanel } from "./MissionsPanel";
import { CollectionsPanel } from "./CollectionsPanel";
import { useState } from "react";

export function UpgradePanel() {
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div className="w-full bg-black/80 backdrop-blur-sm border-t border-cyan-500/30">
      <div className="flex items-center justify-between p-2 border-b border-cyan-500/20">
        <div className="text-cyan-400 font-semibold text-sm">Game Menu</div>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          size="sm"
          className="text-cyan-400 hover:text-cyan-300"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Hide
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Show
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 max-h-[40vh] overflow-y-auto">
          <Tabs defaultValue="upgrades" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger value="upgrades" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Upgrades</span>
          </TabsTrigger>
          <TabsTrigger value="managers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Managers</span>
          </TabsTrigger>
          <TabsTrigger value="destinations" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Destinations</span>
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Collections</span>
          </TabsTrigger>
          <TabsTrigger value="missions" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Missions</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
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
        
        <TabsContent value="collections" className="space-y-2 mt-4">
          <CollectionsPanel />
        </TabsContent>
        
        <TabsContent value="missions" className="space-y-2 mt-4">
          <MissionsPanel />
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
                  <div className="flex-1">
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
                    
                    {destination.pros.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {destination.pros.map((pro, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-green-400 text-xs">
                            <Plus className="w-3 h-3" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {destination.cons.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {destination.cons.map((con, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-red-400 text-xs">
                            <Minus className="w-3 h-3" />
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
      )}
    </div>
  );
}
