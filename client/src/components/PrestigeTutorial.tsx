import { useEffect, useState } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, RefreshCcw } from "lucide-react";

export function PrestigeTutorial() {
  const totalEarned = useIdleGame(state => state.totalEarned);
  const prestigeLevel = useIdleGame(state => state.prestigeLevel);
  const prestigeTutorialShown = useIdleGame(state => state.prestigeTutorialShown);
  const setPrestigeTutorialShown = useIdleGame(state => state.setPrestigeTutorialShown);
  const prestige = useIdleGame(state => state.prestige);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!prestigeTutorialShown && totalEarned >= 100000 && prestigeLevel === 0) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [totalEarned, prestigeLevel, prestigeTutorialShown]);

  const handleDismiss = () => {
    setOpen(false);
    setPrestigeTutorialShown();
  };

  const handlePrestige = () => {
    setOpen(false);
    setPrestigeTutorialShown();
    prestige();
  };

  return (
    <Dialog open={open} onOpenChange={handleDismiss}>
      <DialogContent className="bg-gradient-to-br from-yellow-900 via-amber-900 to-yellow-900 border-yellow-500/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400 animate-pulse" />
            Prestige System Unlocked!
          </DialogTitle>
          <DialogDescription className="text-gray-200 space-y-3 text-base">
            <p className="mt-4">
              <strong className="text-yellow-300">What is Prestige?</strong>
            </p>
            <p>
              Prestige lets you <span className="text-cyan-400 font-semibold">reset your progress</span> in exchange for <span className="text-yellow-400 font-semibold">permanent bonuses</span> that make future runs much more powerful!
            </p>
            <div className="bg-black/30 p-3 rounded-lg border border-yellow-500/30 space-y-2">
              <p className="flex items-start gap-2">
                <RefreshCcw className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" />
                <span className="text-sm"><strong>What you lose:</strong> All ChronoCoins, upgrades, time machines, and unlocked destinations</span>
              </p>
              <p className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm"><strong>What you gain:</strong> +10% revenue permanently per prestige level (stacks!)</span>
              </p>
            </div>
            <p className="text-sm text-yellow-200">
              💡 <strong>Tip:</strong> The more ChronoCoins you've earned, the more prestige points you'll get. It's worth waiting to maximize your gains!
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white border-gray-600 min-h-[44px]"
          >
            Not Yet
          </Button>
          <Button
            onClick={handlePrestige}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold min-h-[44px]"
          >
            Prestige Now!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
