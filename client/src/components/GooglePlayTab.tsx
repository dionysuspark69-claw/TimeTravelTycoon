import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, LogOut, Upload, Download, Trophy } from "lucide-react";
import { useGooglePlay } from "@/lib/stores/useGooglePlay";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useState, useEffect } from "react";

export function GooglePlayTab() {
  const { 
    isSignedIn, 
    playerName, 
    playerAvatar, 
    signIn, 
    signOut, 
    syncProgress, 
    loadProgress,
    submitScore,
    getLeaderboard 
  } = useGooglePlay();
  
  const { chronocoins, totalEarned } = useIdleGame();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      loadLeaderboard();
    }
  }, [isSignedIn]);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn();
    } catch (error) {
      console.error("Sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const gameState = {
        chronocoins,
        totalEarned,
        timestamp: Date.now(),
      };
      await syncProgress(gameState);
      await submitScore(totalEarned);
      await loadLeaderboard();
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoad = async () => {
    setIsLoading(true);
    try {
      const savedState = await loadProgress();
      if (savedState) {
        console.log("Loaded progress:", savedState);
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return Math.floor(num).toString();
  };

  if (!isSignedIn) {
    return (
      <Card className="bg-gray-800/50 border-green-500/30 p-6">
        <h3 className="text-lg font-bold text-green-400 mb-4">Google Play Games</h3>
        <p className="text-gray-300 mb-4">
          Sign in with Google Play Games to sync your progress and compete on the leaderboard.
        </p>
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 w-full min-h-[44px]"
        >
          <LogIn className="w-4 h-4 mr-2" />
          {isLoading ? "Signing in..." : "Sign in with Google Play"}
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gray-800/50 border-green-500/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={playerAvatar || undefined} />
              <AvatarFallback>{playerName?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-green-400">{playerName}</div>
              <div className="text-xs text-gray-400">Signed in</div>
            </div>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="border-red-500/50 hover:bg-red-600/20 min-h-[44px]"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sign Out
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[44px]"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>
          <Button
            onClick={handleLoad}
            disabled={isLoading}
            variant="outline"
            className="flex-1 border-blue-500/50 min-h-[44px]"
          >
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? "Loading..." : "Load"}
          </Button>
        </div>
      </Card>

      <Card className="bg-gray-800/50 border-green-500/30 p-4">
        <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Leaderboard
        </h3>
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <div className="text-center text-gray-400 py-4 text-sm">
              No leaderboard data yet. Sync your progress to appear!
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-700/30 rounded"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                    index === 0 ? "bg-yellow-500 text-black" :
                    index === 1 ? "bg-gray-400 text-black" :
                    index === 2 ? "bg-orange-600 text-white" :
                    "bg-gray-600 text-white"
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-sm font-semibold">{entry.playerName}</div>
                </div>
                <div className="text-green-400 font-bold text-sm">
                  {formatNumber(entry.score)}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
}
