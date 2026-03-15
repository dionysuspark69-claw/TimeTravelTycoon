import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { ArrowUp, MapPin, Users, Trophy, Settings, Plus, Minus, Sparkles, ChevronDown, ChevronUp, Medal, Star, RefreshCcw } from "lucide-react";
import { ManagersPanel } from "./ManagersPanel";
import { AchievementsPanel } from "./AchievementsPanel";
import { MissionsPanel } from "./MissionsPanel";
import { CollectionsPanel } from "./CollectionsPanel";
import { AdBoostPanel } from "./AdBoostPanel";
import { LeaderboardPanel } from "./LeaderboardPanel";
import { useAchievements } from "@/lib/stores/useAchievements";
import { useState } from "react";
import { formatChronoValue } from "@/lib/utils";

function PrestigeCard() {
  const { totalEarned, timeMachineLevel, timeMachineCount, prestigeLevel, prestigePoints, prestige } = useIdleGame();

  const EARN_REQ = 50_000_000;
  const LEVEL_REQ = 25;
  const COUNT_REQ = 5;

  const earnPct   = Math.min(1, totalEarned / EARN_REQ);
  const levelPct  = Math.min(1, timeMachineLevel / LEVEL_REQ);
  const countPct  = Math.min(1, timeMachineCount / COUNT_REQ);
  const ready     = totalEarned >= EARN_REQ && timeMachineLevel >= LEVEL_REQ && timeMachineCount >= COUNT_REQ;
  const projectedPoints = Math.max(1, Math.floor(totalEarned / 10_000_000));

  return (
    <Card className={`p-3 border ${ready ? "border-yellow-500/60 bg-gradient-to-br from-yellow-900/40 to-amber-900/30" : "border-cyan-500/20 bg-black/30"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Trophy className={`w-4 h-4 ${ready ? "text-yellow-400" : "text-gray-500"}`} />
        <span className={`text-sm font-bold ${ready ? "text-yellow-300" : "text-gray-300"}`}>Prestige</span>
        {prestigeLevel > 0 && (
          <span className="ml-auto text-xs text-purple-300 bg-purple-900/40 border border-purple-500/30 px-2 py-0.5 rounded-full">
            Level {prestigeLevel} ┬╖ +{prestigePoints * 10}% revenue
          </span>
        )}
      </div>

      {ready ? (
        <div className="space-y-2">
          <p className="text-xs text-yellow-200">You're ready to prestige! You'll earn <span className="font-bold text-yellow-400">+{projectedPoints * 10}% revenue</span> permanently.</p>
          <div className="text-xs text-gray-400 bg-black/30 rounded p-2 space-y-0.5">
            <div className="flex items-center gap-1"><RefreshCcw className="w-3 h-3 text-red-400" /> You lose: coins, upgrades, machines, destinations</div>
            <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> You keep: prestige bonuses (stacks forever)</div>
          </div>
          <Button
            onClick={prestige}
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 font-bold text-sm min-h-[40px]"
          >
            <Trophy className="w-4 h-4 mr-2" /> Prestige Now (+{projectedPoints * 10}% revenue)
          </Button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400 mb-2">Complete all 3 requirements to unlock prestige:</p>
          {[
            { label: `Earn ${formatChronoValue(EARN_REQ)} CC`, pct: earnPct, done: totalEarned >= EARN_REQ, val: formatChronoValue(totalEarned) },
            { label: `Time Machine Lv.${LEVEL_REQ}`, pct: levelPct, done: timeMachineLevel >= LEVEL_REQ, val: `Lv.${timeMachineLevel}` },
            { label: `Own ${COUNT_REQ} Machines`, pct: countPct, done: timeMachineCount >= COUNT_REQ, val: `${timeMachineCount}` },
          ].map(r => (
            <div key={r.label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className={r.done ? "text-green-400" : "text-gray-400"}>{r.done ? "Γ£à" : "Γ¼£"} {r.label}</span>
                <span className={r.done ? "text-green-400" : "text-gray-500"}>{r.val}</span>
              </div>
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${r.done ? "bg-green-500" : "bg-cyan-500"}`} style={{ width: `${r.pct * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function UpgradePanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [multiplier, setMultiplier] = useState<number | 'max'>(1);
  
  const {
    chronocoins,
    timeMachineLevel,
    timeMachineCapacity,
    timeMachineSpeed,
    timeMachineCount,
    customerGenerationRate,
    unlockedDestinations,
    currentDestination,
    
    upgradeTimeMachine,
    upgradeCapacity,
    upgradeSpeed,
    upgradeCustomerRate,
    buyTimeMachine,
    unlockDestination,
    setDestination,
    
    getTimeMachineUpgradeCost,
    getCapacityUpgradeCost,
    getSpeedUpgradeCost,
    getCustomerRateUpgradeCost,
    getTimeMachineBuyCost,
    
    computeMaxAffordable,
  } = useIdleGame();
  
  const { getUnclaimedAchievements } = useAchievements();
  const unclaimedCount = getUnclaimedAchievements().length;
  
  const timeMachineEffectiveMultiplier = multiplier === 'max' 
    ? computeMaxAffordable(100, 1.7, timeMachineLevel, chronocoins)
    : multiplier;
  const timeMachineCost = getTimeMachineUpgradeCost(timeMachineEffectiveMultiplier);
  const canAffordTimeMachine = chronocoins >= timeMachineCost && timeMachineEffectiveMultiplier > 0;
  
  const capacityEffectiveMultiplier = multiplier === 'max'
    ? computeMaxAffordable(50, 1.6, timeMachineCapacity, chronocoins)
    : multiplier;
  const capacityCost = getCapacityUpgradeCost(capacityEffectiveMultiplier);
  const canAffordCapacity = chronocoins >= capacityCost && capacityEffectiveMultiplier > 0;
  
  const speedEffectiveMultiplier = multiplier === 'max'
    ? computeMaxAffordable(75, 1.65, timeMachineSpeed, chronocoins)
    : multiplier;
  const speedCost = getSpeedUpgradeCost(speedEffectiveMultiplier);
  const canAffordSpeed = chronocoins >= speedCost && speedEffectiveMultiplier > 0;
  
  const customerRateEffectiveMultiplier = multiplier === 'max'
    ? computeMaxAffordable(200, 1.8, customerGenerationRate, chronocoins)
    : multiplier;
  const customerRateCost = getCustomerRateUpgradeCost(customerRateEffectiveMultiplier);
  const canAffordCustomerRate = chronocoins >= customerRateCost && customerRateEffectiveMultiplier > 0;
  
  const buyTimeMachineEffectiveMultiplier = multiplier === 'max'
    ? computeMaxAffordable(10000, 3, timeMachineCount, chronocoins)
    : multiplier;
  const buyTimeMachineCost = getTimeMachineBuyCost(buyTimeMachineEffectiveMultiplier);
  const canAffordBuyTimeMachine = chronocoins >= buyTimeMachineCost && buyTimeMachineEffectiveMultiplier > 0;
  
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
        <TabsList className="grid w-full grid-cols-5 bg-gray-900">
          <TabsTrigger value="upgrades" className="flex items-center gap-2 text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Upgrades</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2 text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="destinations" className="flex items-center gap-2 text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Destinations</span>
          </TabsTrigger>
          <TabsTrigger value="awards" className="flex items-center gap-2 relative text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Awards</span>
            {unclaimedCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-gray-900" />
            )}
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2 text-xs sm:text-sm px-1 sm:px-3 min-h-[44px]">
            <Medal className="w-4 h-4" />
            <span className="hidden sm:inline">Ranks</span>
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
                1x
              </ToggleGroupItem>
              <ToggleGroupItem value="5" className="text-xs px-2 py-1 min-h-[32px] data-[state=on]:bg-cyan-600 data-[state=on]:text-white">
                5x
              </ToggleGroupItem>
              <ToggleGroupItem value="10" className="text-xs px-2 py-1 min-h-[32px] data-[state=on]:bg-cyan-600 data-[state=on]:text-white">
                10x
              </ToggleGroupItem>
              <ToggleGroupItem value="100" className="text-xs px-2 py-1 min-h-[32px] data-[state=on]:bg-cyan-600 data-[state=on]:text-white">
                100x
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
                Buy {timeMachineEffectiveMultiplier}x - {formatChronoValue(timeMachineCost)}
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
                Buy {capacityEffectiveMultiplier}x - {formatChronoValue(capacityCost)}
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
                Buy {speedEffectiveMultiplier}x - {formatChronoValue(speedCost)}
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
                Buy {customerRateEffectiveMultiplier}x - {formatChronoValue(customerRateCost)}
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
                Buy {buyTimeMachineEffectiveMultiplier}x - {formatChronoValue(buyTimeMachineCost)}
              </Button>
            </div>
          </Card>

          <div className="border-t border-cyan-500/20 my-2 pt-2">
            <AdBoostPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-2 mt-4 max-h-[40vh] md:max-h-[45vh] overflow-y-auto pr-2 pb-4">
          <ManagersPanel />
          <div className="border-t border-cyan-500/20 my-2 pt-2">
            <MissionsPanel />
          </div>
        </TabsContent>
        
        <TabsContent value="awards" className="space-y-2 mt-4 max-h-[40vh] md:max-h-[45vh] overflow-y-auto pr-2 pb-4">
          {/* Prestige Progress Card */}
          <PrestigeCard />
          <AchievementsPanel />
          <div className="border-t border-cyan-500/20 my-2 pt-2">
            <CollectionsPanel />
          </div>
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

        <TabsContent value="leaderboard" className="space-y-2 mt-4 max-h-[40vh] md:max-h-[45vh] overflow-y-auto pr-2 pb-4">
          <LeaderboardPanel />
        </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
