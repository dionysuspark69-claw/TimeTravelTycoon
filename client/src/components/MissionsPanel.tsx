import { useMissions } from "@/lib/stores/useMissions";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { CheckCircle2, Flame, TrendingUp, Zap } from "lucide-react";
import { useEffect } from "react";
import { formatChronoValue } from "@/lib/utils";

export function MissionsPanel() {
  const { missions, initializeMissions, missionStreak, getStreakBonus } = useMissions();
  const { addChronocoins } = useIdleGame();
  
  useEffect(() => {
    initializeMissions();
  }, [initializeMissions]);
  
  const streakBonus = getStreakBonus();
  const hasActiveStreak = missionStreak > 0;
  const bonusPercent = Math.round(streakBonus.revenueBonus * 100);
  
  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">Missions</h3>
        {hasActiveStreak && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/50 rounded-lg px-3 py-1">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-orange-400 font-bold">{missionStreak}x Streak</span>
          </div>
        )}
      </div>
      
      {hasActiveStreak && (
        <Card className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30 p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 font-semibold text-sm">Active Streak Bonuses</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-green-400" />
              <span className="text-gray-300">Revenue: <span className="text-green-400 font-bold">+{bonusPercent}%</span></span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="text-gray-300">Speed: <span className="text-cyan-400 font-bold">+{bonusPercent}%</span></span>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-2">Keep completing missions to maintain your streak!</p>
        </Card>
      )}
      
      <p className="text-gray-400 text-sm mb-4">Complete missions to earn ChronoCoin bonuses and build your streak!</p>
      
      {missions.length === 0 ? (
        <Card className="bg-gray-900/50 border-cyan-500/30 p-4">
          <p className="text-gray-400 text-center">No active missions. Keep playing to unlock new challenges!</p>
        </Card>
      ) : (
        missions.map((mission) => {
          const progressPercent = (mission.progress / mission.target) * 100;
          const isComplete = mission.progress >= mission.target;
          
          return (
            <Card
              key={mission.id}
              className={`bg-gray-900/50 border-cyan-500/30 p-3 transition-all ${
                isComplete ? "border-green-500 bg-green-900/20" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-2xl">{mission.icon}</span>
                  <div>
                    <div className="text-white font-semibold">{mission.description}</div>
                    <div className="text-gray-400 text-xs">
                      Progress: {formatChronoValue(mission.progress)} / {formatChronoValue(mission.target)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isComplete && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                  <div className="text-right">
                    <div className="text-cyan-400 font-semibold">+{formatChronoValue(mission.reward)}</div>
                    <div className="text-gray-500 text-xs">ChronoCoins</div>
                  </div>
                </div>
              </div>
              
              <Progress 
                value={progressPercent} 
                className="h-2"
              />
            </Card>
          );
        })
      )}
    </div>
  );
}
