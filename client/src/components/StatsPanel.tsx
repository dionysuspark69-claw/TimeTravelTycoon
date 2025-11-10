import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useManagers, MANAGER_TYPES } from "@/lib/stores/useManagers";
import { useArtifacts } from "@/lib/stores/useArtifacts";
import { useMissions } from "@/lib/stores/useMissions";
import { formatChronoValue } from "@/lib/utils";

export function StatsPanel() {
  const {
    totalEarned,
    totalTripsCompleted,
    totalCustomersServed,
    timeMachineLevel,
    timeMachineCapacity,
    timeMachineSpeed,
    customerGenerationRate,
    unlockedDestinations,
    prestigeLevel
  } = useIdleGame();
  
  const { getManagerLevel, getTotalManagerLevels } = useManagers();
  const { discoveries, totalDrops } = useArtifacts();
  const { completedMissionIds } = useMissions();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline"
          className="bg-gray-900/80 border-cyan-500/50 hover:bg-gray-800 text-white min-h-[44px]"
        >
          <BarChart3 className="w-4 h-4 mr-1" />
          Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-cyan-500/30 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400">Game Statistics</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <Card className="bg-gray-800/50 border-cyan-500/30 p-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Economy</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Total Earned</div>
                <div className="text-xl font-bold text-green-400">{formatChronoValue(totalEarned)}</div>
              </div>
              <div>
                <div className="text-gray-400">Prestige Level</div>
                <div className="text-xl font-bold text-purple-400">{prestigeLevel}</div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gray-800/50 border-cyan-500/30 p-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Operations</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Trips Completed</div>
                <div className="text-xl font-bold">{formatChronoValue(totalTripsCompleted)}</div>
              </div>
              <div>
                <div className="text-gray-400">Customers Served</div>
                <div className="text-xl font-bold">{formatChronoValue(totalCustomersServed)}</div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gray-800/50 border-cyan-500/30 p-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Time Machine</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Machine Level</div>
                <div className="text-xl font-bold">{timeMachineLevel}</div>
              </div>
              <div>
                <div className="text-gray-400">Capacity</div>
                <div className="text-xl font-bold">{timeMachineCapacity}</div>
              </div>
              <div>
                <div className="text-gray-400">Speed</div>
                <div className="text-xl font-bold">{timeMachineSpeed}</div>
              </div>
              <div>
                <div className="text-gray-400">Customer Rate</div>
                <div className="text-xl font-bold">{customerGenerationRate}</div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gray-800/50 border-cyan-500/30 p-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Progress</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Destinations Unlocked</div>
                <div className="text-xl font-bold text-orange-400">{unlockedDestinations.length}/6</div>
              </div>
              <div>
                <div className="text-gray-400">Manager Levels</div>
                <div className="text-xl font-bold text-blue-400">{getTotalManagerLevels()}</div>
              </div>
              <div>
                <div className="text-gray-400">Artifacts Found</div>
                <div className="text-xl font-bold text-purple-400">{discoveries.length}/30</div>
              </div>
              <div>
                <div className="text-gray-400">Missions Completed</div>
                <div className="text-xl font-bold text-green-400">{completedMissionIds.length}</div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gray-800/50 border-cyan-500/30 p-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Managers</h3>
            <div className="space-y-2">
              {MANAGER_TYPES.map(manager => {
                const level = getManagerLevel(manager.id);
                return (
                  <div key={manager.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{manager.name}</span>
                    <span className="font-bold">Level {level}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
