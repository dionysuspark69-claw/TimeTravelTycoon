import { useMissions } from "@/lib/stores/useMissions";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

export function MissionsPanel() {
  const { missions, initializeMissions } = useMissions();
  const { addChronocoins } = useIdleGame();
  
  useEffect(() => {
    initializeMissions();
  }, [initializeMissions]);
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return Math.floor(num).toString();
  };
  
  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-white font-semibold text-lg mb-3">Missions</h3>
      <p className="text-gray-400 text-sm mb-4">Complete missions to earn ChronoCoin bonuses!</p>
      
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
                      Progress: {formatNumber(mission.progress)} / {formatNumber(mission.target)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isComplete && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                  <div className="text-right">
                    <div className="text-cyan-400 font-semibold">+{formatNumber(mission.reward)}</div>
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
