import { useEffect, useState } from "react";
import { Achievement } from "@/lib/stores/useAchievements";
import { Card } from "./ui/card";
import { Trophy, X, Gift } from "lucide-react";
import { Button } from "./ui/button";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (achievement) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 3500);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);
  
  if (!achievement) return null;
  
  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-400 p-4 min-w-[300px] shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-200" />
              <span className="text-white font-bold text-sm">Achievement Unlocked!</span>
            </div>
            <div className="text-white font-semibold">{achievement.name}</div>
            <div className="text-yellow-100 text-sm">{achievement.description}</div>
            <div className="text-yellow-200 text-sm mt-2 flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
              <Gift className="w-3 h-3" />
              Claim {achievement.reward} coins in Achievements tab!
            </div>
          </div>
          <Button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
