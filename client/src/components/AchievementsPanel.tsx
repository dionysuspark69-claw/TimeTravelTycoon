import { useAchievements, ACHIEVEMENTS } from "@/lib/stores/useAchievements";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useAudio } from "@/lib/stores/useAudio";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Trophy, Lock, Gift } from "lucide-react";
import { toast } from "sonner";

export function AchievementsPanel() {
  const { isUnlocked, isClaimed, getUnlockedCount, claimAchievement } = useAchievements();
  const addChronocoins = useIdleGame(state => state.addChronocoins);
  
  const handleClaim = (achievementId: string, achievementName: string) => {
    const reward = claimAchievement(achievementId);
    if (reward > 0) {
      addChronocoins(reward);
      useAudio.getState().playAchievement();
      toast.success(`${achievementName} claimed!`, {
        description: `+${reward} ChronoCoins`,
        duration: 3000,
      });
    }
  };
  
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
        const claimed = isClaimed(achievement.id);
        
        return (
          <Card
            key={achievement.id}
            className={`p-3 ${
              unlocked && !claimed
                ? "bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/70 shadow-lg shadow-yellow-500/20"
                : unlocked && claimed
                ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50"
                : "bg-gray-900/50 border-gray-700/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {unlocked && claimed ? (
                    <Trophy className="w-4 h-4 text-green-400" />
                  ) : unlocked ? (
                    <Gift className="w-4 h-4 text-yellow-400 animate-pulse" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                  <span
                    className={`font-semibold ${
                      unlocked && !claimed ? "text-yellow-400" : unlocked ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {achievement.name}
                  </span>
                </div>
                <div className={unlocked ? "text-gray-300 text-sm" : "text-gray-500 text-sm"}>
                  {achievement.description}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className={`${unlocked && !claimed ? "text-yellow-400" : "text-gray-500"} text-xs`}>
                    Reward: +{achievement.reward} coins
                  </div>
                  {unlocked && !claimed && (
                    <Button
                      onClick={() => handleClaim(achievement.id, achievement.name)}
                      size="sm"
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-xs px-3 py-1 h-7"
                    >
                      <Gift className="w-3 h-3 mr-1" />
                      Claim
                    </Button>
                  )}
                  {claimed && (
                    <span className="text-green-400 text-xs flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Claimed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
