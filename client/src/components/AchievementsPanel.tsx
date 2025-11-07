import { useAchievements, ACHIEVEMENTS } from "@/lib/stores/useAchievements";
import { Card } from "./ui/card";
import { Trophy, Lock } from "lucide-react";

export function AchievementsPanel() {
  const { isUnlocked, getUnlockedCount } = useAchievements();
  
  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">Achievements</h3>
        <div className="text-cyan-400 text-sm">
          {getUnlockedCount()}/{ACHIEVEMENTS.length}
        </div>
      </div>
      
      {ACHIEVEMENTS.map((achievement) => {
        const unlocked = isUnlocked(achievement.id);
        
        return (
          <Card
            key={achievement.id}
            className={`p-3 ${
              unlocked
                ? "bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-500/50"
                : "bg-gray-900/50 border-gray-700/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {unlocked ? (
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                  <span
                    className={`font-semibold ${
                      unlocked ? "text-yellow-400" : "text-gray-400"
                    }`}
                  >
                    {achievement.name}
                  </span>
                </div>
                <div className={unlocked ? "text-gray-300 text-sm" : "text-gray-500 text-sm"}>
                  {achievement.description}
                </div>
                {unlocked && (
                  <div className="text-yellow-400 text-xs mt-1">
                    Reward: +{achievement.reward} coins
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
