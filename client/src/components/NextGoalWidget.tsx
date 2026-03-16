import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useMissions } from "@/lib/stores/useMissions";
import { formatChronoValue } from "@/lib/utils";

export function NextGoalWidget() {
  const {
    timeMachineCount,
    timeMachineLevel,
    unlockedDestinations,
    totalEarned,
    prestigeLevel,
  } = useIdleGame();

  const { missions } = useMissions();

  // Prefer the first incomplete active mission
  const activeMission = missions.find((m) => m.progress < m.target);

  let goal = "";
  let current = 0;
  let target = 1;
  let isMission = false;

  if (activeMission) {
    isMission = true;
    goal = activeMission.description;
    current = activeMission.progress;
    target = activeMission.target;
  } else if (timeMachineCount < 2) {
    goal = "Buy 2nd Time Machine";
    current = timeMachineCount;
    target = 2;
  } else if (unlockedDestinations.length < 3) {
    goal = "Unlock More Destinations";
    current = unlockedDestinations.length;
    target = 3;
  } else if (timeMachineLevel < 10) {
    goal = "Upgrade Time Machine to Lv.10";
    current = timeMachineLevel;
    target = 10;
  } else if (totalEarned < 1_000_000) {
    goal = "Earn 1M ChronoCoins";
    current = totalEarned;
    target = 1_000_000;
  } else if (timeMachineCount < 5) {
    goal = `Buy ${timeMachineCount + 1}th Time Machine`;
    current = timeMachineCount;
    target = 5;
  } else if (prestigeLevel === 0 && totalEarned >= 10_000_000) {
    goal = "Ready to Prestige!";
    current = 1;
    target = 1;
  } else if (timeMachineLevel < 50) {
    goal = "Upgrade Time Machine to Lv.50";
    current = timeMachineLevel;
    target = 50;
  } else {
    goal = "You're a Chrono Legend!";
    current = 1;
    target = 1;
  }

  const progress = Math.min(1, current / target);

  // Format current/target for missions
  const progressLabel = isMission && activeMission
    ? `${activeMission.type === "earn_coins" || activeMission.type === "earn_in_time"
        ? formatChronoValue(current)
        : Math.floor(current)} / ${activeMission.type === "earn_coins" || activeMission.type === "earn_in_time"
        ? formatChronoValue(target)
        : target}`
    : null;

  return (
    <div className="h-8 bg-black/70 backdrop-blur flex items-center justify-between px-3 gap-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={`text-xs font-bold shrink-0 ${isMission ? "text-yellow-400" : "text-cyan-500"}`}>
          {isMission ? "MISSION:" : "NEXT GOAL:"}
        </span>
        {isMission && activeMission && (
          <span className="text-gray-500 text-xs shrink-0">{activeMission.icon}</span>
        )}
        <span className="text-white text-xs truncate">{goal}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {progressLabel && (
          <span className="text-yellow-300 text-xs font-mono">{progressLabel}</span>
        )}
        <div className="w-20 h-1.5 bg-gray-700 rounded">
          <div
            className={`h-full rounded transition-all duration-500 ${isMission ? "bg-yellow-400" : "bg-cyan-400"}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
