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
import { Sparkles } from "lucide-react";

export function ClickBoostTutorial() {
  const tutorialShown = useIdleGame(state => state.tutorialShown);
  const setTutorialShown = useIdleGame(state => state.setTutorialShown);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!tutorialShown) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [tutorialShown]);

  const handleClose = () => {
    setOpen(false);
    setTutorialShown();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 border-pink-500/50 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            Welcome to ChronoTransit!
          </DialogTitle>
          <DialogDescription className="text-gray-200 space-y-3 text-base">
            <p className="mt-4">
              <strong className="text-pink-300">Click Boost Tutorial:</strong>
            </p>
            <p>
              Tap or click on the <span className="text-cyan-400 font-semibold">glowing time machine portal</span> in the center of the screen to earn bonus ChronoCoins instantly!
            </p>
            <p className="text-sm bg-black/30 p-3 rounded-lg border border-pink-500/30">
              💡 <strong>Pro tip:</strong> Each click gives you coins based on your current revenue rate. The more you upgrade, the more powerful your clicks become!
            </p>
          </DialogDescription>
        </DialogHeader>
        <Button
          onClick={handleClose}
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-lg py-6"
        >
          Got it! Let's start! ✨
        </Button>
      </DialogContent>
    </Dialog>
  );
}
