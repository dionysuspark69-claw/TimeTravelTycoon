import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, Volume2, VolumeX, BarChart3, Trophy, Save, Cloud, CloudOff, User, LogIn, LogOut } from "lucide-react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useManagers, MANAGER_TYPES } from "@/lib/stores/useManagers";
import { useArtifacts } from "@/lib/stores/useArtifacts";
import { useMissions } from "@/lib/stores/useMissions";
import { useAudio } from "@/lib/stores/useAudio";
import { useAuth } from "@/lib/stores/useAuth";
import { useSaveState } from "@/lib/stores/useSaveState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatChronoValue } from "@/lib/utils";
import { toast } from "sonner";

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
  const { isAuthenticated, user, loginWithGoogle, logout } = useAuth();
  const { saveGame, isSaving, lastSaved } = useSaveState();
  
  const handleManualSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save your progress");
      return;
    }
    
    await saveGame();
  };
  
  const formatLastSaved = () => {
    if (!lastSaved) return "Never";
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return lastSaved.toLocaleTimeString();
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
            <TabsTrigger value="account" className="data-[state=active]:bg-cyan-600">
              <User className="w-4 h-4 mr-1" />
              Account
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
            
            <Card className="bg-gray-800/50 border-cyan-500/30 p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">Save Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold">Manual Save</div>
                    <div className="text-gray-400 text-sm">
                      {isAuthenticated ? "Save your game progress to the cloud" : "Sign in to enable cloud saves"}
                    </div>
                  </div>
                  <Button
                    onClick={handleManualSave}
                    disabled={!isAuthenticated || isSaving}
                    variant="outline"
                    size="lg"
                    className="bg-gray-700 border-cyan-500/30 hover:bg-gray-600 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Cloud className="w-5 h-5 mr-2 animate-pulse" />
                        Saving...
                      </>
                    ) : isAuthenticated ? (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Now
                      </>
                    ) : (
                      <>
                        <CloudOff className="w-5 h-5 mr-2" />
                        Disabled
                      </>
                    )}
                  </Button>
                </div>
                {isAuthenticated && (
                  <div className="text-xs text-gray-400">
                    Last saved: {formatLastSaved()}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4">
            <Card className="bg-gray-800/50 border-cyan-500/30 p-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-4">Account</h3>
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{user.username}</div>
                      <div className="text-gray-400 text-xs">Signed in{user.googleId ? " via Google" : ""}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => { logout(); }}
                    variant="outline"
                    className="w-full bg-red-900/20 border-red-500/30 hover:bg-red-900/40 text-red-300 min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">Sign in to save your progress and appear on the leaderboard.</p>
                  <Button
                    onClick={loginWithGoogle}
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold min-h-[44px] flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
