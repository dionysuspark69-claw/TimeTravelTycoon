import { useEffect, useState } from "react";
import { Achievement } from "@/lib/stores/useAchievements";
import { Trophy } from "lucide-react";

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setVisible(false);
      const showTimer = setTimeout(() => setVisible(true), 30);
      const hideTimer = setTimeout(() => setVisible(false), 2500);
      const closeTimer = setTimeout(() => onClose(), 2900);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        clearTimeout(closeTimer);
      };
    } else {
      setVisible(false);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed right-3 z-50 transition-all duration-250 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      style={{ top: "72px" }}
    >
      <div className="flex items-center gap-2 bg-black/85 backdrop-blur-sm border border-yellow-500/40 rounded-full px-3 py-1.5 shadow-lg max-w-[260px]">
        <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
        <span className="text-yellow-300 text-xs font-semibold truncate">{achievement.name}</span>
        <span className="text-gray-400 text-xs shrink-0">+{achievement.reward}</span>
      </div>
    </div>
  );
}
