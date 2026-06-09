import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Gift, Flame } from "lucide-react";
import { useDailyReward } from "@/lib/stores/useDailyReward";
import { formatChronoValue } from "@/lib/utils";
import { toast } from "sonner";

function fmtCountdown(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

export function DailyRewardCard() {
  const { streak } = useDailyReward();
  // Re-render on a timer so the countdown and availability stay live.
  const [, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const canClaim = useDailyReward.getState().canClaim();
  const preview = useDailyReward.getState().previewReward();
  const nextStreak = useDailyReward.getState().nextStreak();
  const wait = useDailyReward.getState().msUntilNextClaim();

  const handleClaim = () => {
    const amount = useDailyReward.getState().claim();
    if (amount > 0) {
      toast.success("Daily reward claimed!", {
        description: `+${formatChronoValue(amount)} ChronoCoins · ${nextStreak}-day streak 🔥`,
        duration: 4000,
      });
      setTick(t => t + 1);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/40 border-purple-500/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-300 shrink-0" />
            <span className="text-white font-semibold text-sm">Daily Reward</span>
            {streak > 0 && (
              <span className="flex items-center gap-0.5 text-orange-300 text-xs">
                <Flame className="w-3 h-3" />{streak}
              </span>
            )}
          </div>
          <div className="text-gray-300 text-xs mt-0.5">
            {canClaim
              ? <>Claim <span className="text-yellow-300 font-semibold">+{formatChronoValue(preview)}</span> · day {nextStreak} streak</>
              : <>Next reward in <span className="text-cyan-300">{fmtCountdown(wait)}</span></>}
          </div>
        </div>
        <Button
          onClick={handleClaim}
          disabled={!canClaim}
          size="sm"
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 shrink-0 min-h-[44px]"
        >
          {canClaim ? "Claim" : "Claimed"}
        </Button>
      </div>
    </Card>
  );
}
