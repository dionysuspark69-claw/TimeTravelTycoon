import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { ArrowUp, MapPin, Users, Trophy, Settings, Plus, Minus, Target, Sparkles, ChevronDown, ChevronUp, Tv, Star } from "lucide-react";
import { ManagersPanel } from "./ManagersPanel";
import { AchievementsPanel } from "./AchievementsPanel";
import { MissionsPanel } from "./MissionsPanel";
import { CollectionsPanel } from "./CollectionsPanel";
import { AdBoostPanel } from "./AdBoostPanel";
import { useAchievements } from "@/lib/stores/useAchievements";
import { useState, useMemo } from "react";
import { formatChronoValue } from "@/lib/utils";

export function UpgradePanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [multiplier, setMultiplier] = useState<number | 'max'>(1);
  
  const {
    chronocoins,
    totalEarned,
    timeMachineLevel,
    timeMachineCapacity,
    timeMachineSpeed,
    timeMachineCount,
    customerGenerationRate,
    unlockedDestinations,
    currentDestination,
    prestigeLevel,
    prestigePoints,
    
    upgradeTimeMachine,
    upgradeCapacity,
    upgradeSpeed,
    upgradeCustomerRate,
    buyTimeMachine,
    unlockDestination,
    setDestination,
    prestige,
    
    getTimeMachineUpgradeCost,
    getCapacityUpgradeCost,
    getSpeedUpgradeCost,
    getCustomerRateUpgradeCost,
    getTimeMachineBuyCost,
    
    computeMaxAffordable,
  } = useIdleGame();
  
  const { getUnclaimedAchievements } = useAchievements();
  const unclaimedCount = getUnclaimedAchievements().length;

  const PRESTIGE_EARNED_REQ = 50000000;
  const PRESTIGE_LEVEL_REQ = 25;
  const PRESTIGE_COUNT_REQ = 5;
  const prestigeReady =
    totalEarned >= PRESTIGE_EARNED_REQ &&
    timeMachineLevel >= PRESTIGE_LEVEL_REQ &&
    timeMachineCount >= PRESTIGE_COUNT_REQ;
  
  const upgrades = useMemo(() => {
    const timeMachineEffectiveMultiplier = multiplier === 'max'
      ? computeMaxAffordable(100, 1.7, timeMachineLevel, chronocoins)
      : multiplier;
    const timeMachineCost = getTimeMachineUpgradeCost(timeMachineEffectiveMultiplier);

    const capacityEffectiveMultiplier = multiplier === 'max'
      ? computeMaxAffordable(50, 1.6, timeMachineCapacity, chronocoins)
      : multiplier;
    const capacityCost = getCapacityUpgradeCost(capacityEffectiveMultiplier);

    const speedEffectiveMultiplier = multiplier === 'max'
      ? computeMaxAffordable(75, 1.65, timeMachineSpeed, chronocoins)
      : multiplier;
    const speedCost = getSpeedUpgradeCost(speedEffectiveMultiplier);

    const customerRateEffectiveMultiplier = multiplier === 'max'
      ? computeMaxAffordable(200, 1.8, customerGenerationRate, chronocoins)
      : multiplier;
    const customerRateCost = getCustomerRateUpgradeCost(customerRateEffectiveMultiplier);

    const buyTimeMachineEffectiveMultiplier = multiplier === 'max'
      ? computeMaxAffordable(10000, 3, timeMachineCount, chronocoins)
      : multiplier;
    const buyTimeMachineCost = getTimeMachineBuyCost(buyTimeMachineEffectiveMultiplier);

    return {
      timeMachineEffectiveMultiplier,
      timeMachineCost,
      canAffordTimeMachine: chronocoins >= timeMachineCost && timeMachineEffectiveMultiplier > 0,
      capacityEffectiveMultiplier,
      capacityCost,
      canAffordCapacity: chronocoins >= capacityCost && capacityEffectiveMultiplier > 0,
      speedEffectiveMultiplier,
      speedCost,
      canAffordSpeed: chronocoins >= speedCost && speedEffectiveMultiplier > 0,
      customerRateEffectiveMultiplier,
      customerRateCost,
      canAffordCustomerRate: chronocoins >= customerRateCost && customerRateEffectiveMultiplier > 0,
      buyTimeMachineEffectiveMultiplier,
      buyTimeMachineCost,
      canAffordBuyTimeMachine: chronocoins >= buyTimeMachineCost && buyTimeMachineEffectiveMultiplier > 0,
    };
  }, [
    multiplier, chronocoins,
    timeMachineLevel, timeMachineCapacity, timeMachineSpeed, customerGenerationRate, timeMachineCount,
    computeMaxAffordable, getTimeMachineUpgradeCost, getCapacityUpgradeCost,
    getSpeedUpgradeCost, getCustomerRateUpgradeCost, getTimeMachineBuyCost,
  ]);

  const {
    timeMachineEffectiveMultiplier, timeMachineCost, canAffordTimeMachine,
    capacityEffectiveMultiplier, capacityCost, canAffordCapacity,
    speedEffectiveMultiplier, speedCost, canAffordSpeed,
    customerRateEffectiveMultiplier, customerRateCost, canAffordCustomerRate,
    buyTimeMachineEffectiveMultiplier, buyTimeMachineCost, canAffordBuyTimeMachine,
  } = upgrades;
  
  return (
    <div className="w-full bg-black/80 backdrop-blur-sm border-t border-cyan-500/30" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
        <div className="p-2 md:p-4">
          <Tabs defaultValue="upgrades" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900">
          <TabsTrigger value="upgrades" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Upgrades</span>
          </TabsTrigger>
          <TabsTrigger value="managers" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Managers</span>
          </TabsTrigger>
          <TabsTrigger value="destinations" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Destinations</span>
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Collections</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-1 relative text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Progress</span>
            {unclaimedCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-gray-900" />
            )}
          </TabsTrigger>
          <TabsTrigger value="prestige" className="flex items-center gap-1 relative text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <Star className={`w-4 h-4 ${prestigeReady ? "text-yellow-400" : ""}`} />
            <span className="hidden sm:inline">Prestige</span>
            {prestigeReady && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-gray-900" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upgrades" className="space-y-2 mt-4 max-h-[40vh] md:max-h-[45vh] overflow-y-auto pr-2 pb-4">
          <div className="mb-3">
            <div className="text-cyan-400 text-xs font-semibold mb-2">Purchase Quantity</div>
            <ToggleGroup 
              type="single" 
              value={String(multiplier)} 
              onValueChange={(value) => value && setMultiplier(value === 'max' ? 'max' : Number(value))}
              className="justify-start flex-wrap gap-1"
            >
              <ToggleGroupItem value="1" className="text-xs px-2 py-1 min-h-[32px] data-[state=on]:bg-cyan-600 data-[state=on]:text-white">
                1├ù
              </ToggleGroupItem>
              <ToggleGroupItem value="5" className="text-xs px-2 py-1 min-h-[32px] data-[state=on]:bg-cyan-600 data-[state=on]:text-white">
                5├ù
              </ToggleGroupItem>
              <ToggleGroupItem value="10" className="text-xs px-2 py-1 min-h-[32px] data-[state=on]:bg-cyan-600 data-[state=on]:text-white">
                10├ù
              </ToggleGroupItem>
              <ToggleGroupItem value="100" className="text-xs px-2 py-1 min-h-[32px] data-[state=on]:bg-cyan-600 data-[state=on]:text-white">
                100├ù
              </ToggleGroupItem>
              <ToggleGroupItem value="max" className="text-xs px-2 py-1 min-h-[32px] data-[state=on]:bg-purple-600 data-[state=on]:text-white">
                Max
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <Card className="bg-gray-900/50 border-cyan-500/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold">Time Machine Level</div>
                <div className="text-gray-400 text-sm">Level {timeMachineLevel} - Increase fare per trip</div>
                {multiplier !== 1 && !canAffordTimeMachine && timeMachineEffectiveMultiplier === 0 && (
                  <div className="text-yellow-400 text-xs mt-1">Max: 0 (need more coins)</div>
                )}
                {typeof multiplier === 'number' && canAffordTimeMachine && timeMachineEffectiveMultiplier < multiplier && (
                  <div className="text-yellow-400 text-xs mt-1">Max: {timeMachineEffectiveMultiplier}</div>
                )}
              </div>
              <Button
                onClick={() => upgradeTimeMachine(timeMachineEffectiveMultiplier)}
                disabled={!canAffordTimeMachine}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                Buy {timeMachineEffectiveMultiplier}├ù - {formatChronoValue(timeMachineCost)}
              </Button>
            </div>
          </Card>
          
          <Card className="bg-gray-900/50 border-cyan-500/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold">Capacity</div>
                <div className="text-gray-400 text-sm">Level {timeMachineCapacity} - Customers per trip</div>
                {multiplier !== 1 && !canAffordCapacity && capacityEffectiveMultiplier === 0 && (
                  <div className="text-yellow-400 text-xs mt-1">Max: 0 (need more coins)</div>
                )}
                {typeof multiplier === 'number' && canAffordCapacity && capacityEffectiveMultiplier < multiplier && (
                  <div className="text-yellow-400 text-xs mt-1">Max: {capacityEffectiveMultiplier}</div>
                )}
              </div>
              <Button
                onClick={() => upgradeCapacity(capacityEffectiveMultiplier)}
                disabled={!canAffordCapacity}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                Buy {capacityEffectiveMultiplier}├ù - {formatChronoValue(capacityCost)}
              </Button>
            </div>
          </Card>
          
          <Card className="bg-gray-900/50 border-cyan-500/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold">Speed</div>
                <div className="text-gray-400 text-sm">Level {timeMachineSpeed} - Faster trips</div>
                {multiplier !== 1 && !canAffordSpeed && speedEffectiveMultiplier === 0 && (
                  <div className="text-yellow-400 text-xs mt-1">Max: 0 (need more coins)</div>
                )}
                {typeof multiplier === 'number' && canAffordSpeed && speedEffectiveMultiplier < multiplier && (
                  <div className="text-yellow-400 text-xs mt-1">Max: {speedEffectiveMultiplier}</div>
                )}
              </div>
              <Button
                onClick={() => upgradeSpeed(speedEffectiveMultiplier)}
                disabled={!canAffordSpeed}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                Buy {speedEffectiveMultiplier}├ù - {formatChronoValue(speedCost)}
              </Button>
            </div>
          </Card>
          
          <Card className="bg-gray-900/50 border-cyan-500/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold">Customer Generation</div>
                <div className="text-gray-400 text-sm">Level {customerGenerationRate} - More customers</div>
                {multiplier !== 1 && !canAffordCustomerRate && customerRateEffectiveMultiplier === 0 && (
                  <div className="text-yellow-400 text-xs mt-1">Max: 0 (need more coins)</div>
                )}
                {typeof multiplier === 'number' && canAffordCustomerRate && customerRateEffectiveMultiplier < multiplier && (
                  <div className="text-yellow-400 text-xs mt-1">Max: {customerRateEffectiveMultiplier}</div>
                )}
              </div>
              <Button
                onClick={() => upgradeCustomerRate(customerRateEffectiveMultiplier)}
                disabled={!canAffordCustomerRate}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                Buy {customerRateEffectiveMultiplier}├ù - {formatChronoValue(customerRateCost)}
              </Button>
            </div>
          </Card>
          
          <Card className="bg-purple-900/50 border-purple-500/30 p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Time Machines
                </div>
                <div className="text-gray-400 text-sm">Own {timeMachineCount} - {timeMachineCount * timeMachineCapacity} total capacity</div>
                {multiplier !== 1 && !canAffordBuyTimeMachine && buyTimeMachineEffectiveMultiplier === 0 && (
                  <div className="text-yellow-400 text-xs mt-1">Max: 0 (need more coins)</div>
                )}
                {typeof multiplier === 'number' && canAffordBuyTimeMachine && buyTimeMachineEffectiveMultiplier < multiplier && (
                  <div className="text-yellow-400 text-xs mt-1">Max: {buyTimeMachineEffectiveMultiplier}</div>
                )}
              </div>
              <Button
                onClick={() => buyTimeMachine(buyTimeMachineEffectiveMultiplier)}
                disabled={!canAffordBuyTimeMachine}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Buy {buyTimeMachineEffectiveMultiplier}├ù - {formatChronoValue(buyTimeMachineCost)}
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="managers" className="space-y-2 mt-4 max-h-[40vh] md:max-h-[45vh] overflow-y-auto pr-2 pb-4">
          <ManagersPanel />
          <div className="border-t border-cyan-500/20 mt-4 pt-4">
            <AdBoostPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="collections" className="space-y-2 mt-4 max-h-[40vh] md:max-h-[45vh] overflow-y-auto pr-2 pb-4">
          <CollectionsPanel />
        </TabsContent>

        <TabsContent value="progress" className="mt-4 max-h-[40vh] md:max-h-[45vh] overflow-y-auto pr-2 pb-4">
          <MissionsPanel />
          <div className="border-t border-cyan-500/20 mt-4 pt-2">
            <AchievementsPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="prestige" className="space-y-4 mt-4 max-h-[40vh] md:max-h-[45vh] overflow-y-auto pr-2 pb-4">
          {prestigeLevel > 0 && (
            <Card className="bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border-yellow-500/50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <div className="text-yellow-400 font-bold text-lg">Prestige {prestigeLevel}</div>
              </div>
              <div className="text-gray-300 text-sm">
                +{prestigePoints * 10}% revenue bonus active across all destinations.
              </div>
            </Card>
          )}

          <Card className="bg-gray-900/50 border-cyan-500/30 p-4">
            <div className="text-white font-semibold text-base mb-3">Requirements</div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Total Earned</span>
                  <span className={totalEarned >= PRESTIGE_EARNED_REQ ? "text-green-400 font-bold" : "text-gray-400"}>
                    {formatChronoValue(totalEarned)} / {formatChronoValue(PRESTIGE_EARNED_REQ)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${totalEarned >= PRESTIGE_EARNED_REQ ? "bg-green-500" : "bg-cyan-500"}`}
                    style={{ width: `${Math.min((totalEarned / PRESTIGE_EARNED_REQ) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Time Machine Level</span>
                  <span className={timeMachineLevel >= PRESTIGE_LEVEL_REQ ? "text-green-400 font-bold" : "text-gray-400"}>
                    {timeMachineLevel} / {PRESTIGE_LEVEL_REQ}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${timeMachineLevel >= PRESTIGE_LEVEL_REQ ? "bg-green-500" : "bg-cyan-500"}`}
                    style={{ width: `${Math.min((timeMachineLevel / PRESTIGE_LEVEL_REQ) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Time Machines Owned</span>
                  <span className={timeMachineCount >= PRESTIGE_COUNT_REQ ? "text-green-400 font-bold" : "text-gray-400"}>
                    {timeMachineCount} / {PRESTIGE_COUNT_REQ}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${timeMachineCount >= PRESTIGE_COUNT_REQ ? "bg-green-500" : "bg-cyan-500"}`}
                    style={{ width: `${Math.min((timeMachineCount / PRESTIGE_COUNT_REQ) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-900/50 border-purple-500/30 p-4">
            <div className="text-white font-semibold text-base mb-1">What You Get</div>
            <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
              <li>Permanent <span className="text-yellow-400 font-semibold">+10% revenue</span> per prestige level</li>
              <li>Bonuses stack with each prestige</li>
              <li>Next bonus: <span className="text-yellow-400 font-semibold">+{(prestigeLevel + 1) * 10}% total revenue</span></li>
            </ul>
            <div className="text-red-400 text-xs mt-3">Warning: Resets coins, upgrades, and destinations (prestige level kept)</div>
          </Card>

          <Button
            onClick={prestige}
            disabled={!prestigeReady}
            className={`w-full h-14 text-base font-bold ${
              prestigeReady
                ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Star className="w-5 h-5 mr-2" />
            {prestigeReady ? "Prestige Now!" : "Requirements not met yet"}
          </Button>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-2 mt-4 max-h-[40vh] md:max-h-[45vh] overflow-y-auto pr-2 pb-4">
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
                      Unlock {formatChronoValue(destination.unlockCost)}
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
