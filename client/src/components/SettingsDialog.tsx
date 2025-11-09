import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, Volume2, VolumeX, BarChart3, Trophy } from "lucide-react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useManagers, MANAGER_TYPES } from "@/lib/stores/useManagers";
import { useArtifacts } from "@/lib/stores/useArtifacts";
import { useMissions } from "@/lib/stores/useMissions";
import { useAudio } from "@/lib/stores/useAudio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GooglePlayTab } from "./GooglePlayTab";

export function SettingsDialog() {
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
  const { discoveries } = useArtifacts();
  const { completedMissionIds } = useMissions();
  const { isMuted, toggleMute } = useAudio();
  
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(2) + "K";
    return Math.floor(num).toString();
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="icon" 
          variant="outline"
          className="bg-black/80 backdrop-blur-sm border-cyan-500/30 min-h-[44px] min-w-[44px]"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-cyan-500/30 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan-400">Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="audio" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="audio" className="data-[state=active]:bg-cyan-600">
              Audio
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-cyan-600">
              <BarChart3 className="w-4 h-4 mr-1" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="googleplay" className="data-[state=active]:bg-cyan-600">
              <Trophy className="w-4 h-4 mr-1" />
              Play
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="audio" className="space-y-4">
            <Card className="bg-gray-800/50 border-cyan-500/30 p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">Audio Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">Sound</div>
                  <div className="text-gray-400 text-sm">Toggle game sound effects and music</div>
                </div>
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="lg"
                  className="bg-gray-700 border-cyan-500/30 hover:bg-gray-600 min-h-[44px]"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-5 h-5 mr-2" />
                      Muted
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 mr-2" />
                      Enabled
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <Card className="bg-gray-800/50 border-cyan-500/30 p-4">
              <h3 className="text-lg font-bold text-cyan-400 mb-3">Economy</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">Total Earned</div>
                  <div className="text-xl font-bold text-green-400">{formatNumber(totalEarned)}</div>
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
                  <div className="text-xl font-bold">{formatNumber(totalTripsCompleted)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Customers Served</div>
                  <div className="text-xl font-bold">{formatNumber(totalCustomersServed)}</div>
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
          </TabsContent>
          
          <TabsContent value="googleplay" className="space-y-4">
            <GooglePlayTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
