import { useState } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Trophy, RefreshCcw, Star } from "lucide-react";
import { formatChronoValue, getPrestigeRequirements, getPrestigePoints } from "@/lib/utils";

// Persistent prestige surface: a control-cluster button that pulses gold when a
// prestige is available, opening the full requirements / confirmation dialog.
export function PrestigeDialog() {
  const [open, setOpen] = useState(false);
  const { totalEarned, timeMachineLevel, timeMachineCount, prestigeLevel, prestigePoints, prestige } = useIdleGame();

  const { earnReq: EARN_REQ, levelReq: LEVEL_REQ, countReq: COUNT_REQ } = getPrestigeRequirements(prestigeLevel);
  const earnPct = Math.min(1, totalEarned / EARN_REQ);
  const levelPct = Math.min(1, timeMachineLevel / LEVEL_REQ);
  const countPct = Math.min(1, timeMachineCount / COUNT_REQ);
  const ready = totalEarned >= EARN_REQ && timeMachineLevel >= LEVEL_REQ && timeMachineCount >= COUNT_REQ;
  const projectedPoints = getPrestigePoints(totalEarned);

  const handlePrestige = () => {
    prestige();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Prestige"
          className={`h-9 w-9 backdrop-blur-sm ${
            ready
              ? "bg-yellow-600/90 border-yellow-400 text-white animate-pulse"
              : "bg-black/80 border-cyan-500/30 text-cyan-200"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-amber-950/60 border-yellow-500/40">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-yellow-300 flex items-center gap-2">
            <Trophy className="w-5 h-5" /> Prestige
            {prestigeLevel > 0 && (
              <span className="ml-auto text-xs text-purple-300 bg-purple-900/40 border border-purple-500/30 px-2 py-0.5 rounded-full">
                Level {prestigeLevel} · +{prestigePoints * 10}% revenue
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {ready ? (
          <div className="space-y-3">
            <p className="text-sm text-yellow-200">
              You're ready to prestige! You'll earn{" "}
              <span className="font-bold text-yellow-400">+{projectedPoints * 10}% revenue</span> permanently.
            </p>
            <Card className="text-xs text-gray-300 bg-black/30 border-cyan-500/20 p-3 space-y-1">
              <div className="flex items-center gap-2"><RefreshCcw className="w-3.5 h-3.5 text-red-400" /> You lose: coins, upgrades, machines, destinations</div>
              <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-yellow-400" /> You keep: prestige bonuses (stack forever)</div>
            </Card>
            <Button
              onClick={handlePrestige}
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 font-bold min-h-[44px]"
            >
              <Trophy className="w-4 h-4 mr-2" /> Prestige Now (+{projectedPoints * 10}% revenue)
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">
              Complete all 3 requirements to unlock <span className="text-cyan-400 font-semibold">Prestige {prestigeLevel + 1}</span>:
            </p>
            {[
              { label: `Earn ${formatChronoValue(EARN_REQ)} CC`, pct: earnPct, done: totalEarned >= EARN_REQ, val: formatChronoValue(totalEarned) },
              { label: `Time Machine Lv.${LEVEL_REQ}`, pct: levelPct, done: timeMachineLevel >= LEVEL_REQ, val: `Lv.${timeMachineLevel}` },
              { label: `Own ${COUNT_REQ} Machines`, pct: countPct, done: timeMachineCount >= COUNT_REQ, val: `${timeMachineCount}` },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className={r.done ? "text-green-400" : "text-gray-400"}>{r.done ? "[+]" : "[ ]"} {r.label}</span>
                  <span className={r.done ? "text-green-400" : "text-gray-500"}>{r.val}</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${r.done ? "bg-green-500" : "bg-cyan-500"}`} style={{ width: `${r.pct * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
