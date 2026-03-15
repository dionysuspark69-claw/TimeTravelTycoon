import { useIdleGame } from "@/lib/stores/useIdleGame";

export function NextGoalWidget() {
  const {
    timeMachineCount,
    timeMachineLevel,
    unlockedDestinations,
    totalEarned,
    prestigeLevel,
  } = useIdleGame();

  let goal = "";
  let current = 0;
  let target = 1;

  if (timeMachineCount < 2) {
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
    goal = "⭐ Ready to Prestige!";
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

  return (
    <div className="h-8 bg-black/70 backdrop-blur flex items-center justify-between px-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-cyan-500 text-xs font-bold shrink-0">NEXT GOAL:</span>
        <span className="text-white text-xs truncate">{goal}</span>
      </div>
      <div className="w-24 h-1.5 bg-gray-700 rounded shrink-0 ml-2">
        <div
          className="h-full bg-cyan-400 rounded transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
