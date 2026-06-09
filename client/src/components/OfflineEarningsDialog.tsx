import { useEffect, useRef, useState } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Clock, Coins, Play } from "lucide-react";
import { formatChronoValue } from "@/lib/utils";

const AD_MS = 5000; // simulated rewarded-ad duration

export function OfflineEarningsDialog() {
  const [show, setShow] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [watchingAd, setWatchingAd] = useState(false);
  const [adFill, setAdFill] = useState(false);
  const adTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const offlineEarnings = useIdleGame.getState().calculateOfflineEarnings();
    if (offlineEarnings > 0) {
      setEarnings(offlineEarnings);
      setShow(true);
    }
    return () => { if (adTimer.current) clearTimeout(adTimer.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClaim = () => {
    useIdleGame.getState().claimOfflineEarnings();
    setShow(false);
  };

  // Watch a (simulated) ad to claim 2×: grant the bonus, then the base claim.
  const handleDouble = () => {
    if (watchingAd) return;
    setWatchingAd(true);
    requestAnimationFrame(() => setAdFill(true)); // kick the width transition
    adTimer.current = setTimeout(() => {
      useIdleGame.getState().addChronocoins(earnings); // the bonus 1×
      useIdleGame.getState().claimOfflineEarnings();   // the base 1×
      setWatchingAd(false);
      setShow(false);
    }, AD_MS);
  };

  return (
    <Dialog open={show} onOpenChange={(o) => { if (!watchingAd) setShow(o); }}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-blue-900 border-cyan-500/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Welcome Back!
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            While you were away, your time machine kept working!
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 text-center">
          <div className="text-gray-400 text-sm mb-2">You earned</div>
          <div className="text-5xl font-bold text-yellow-400 flex items-center justify-center gap-3">
            <Coins className="w-12 h-12" />
            {formatChronoValue(earnings)}
          </div>
          <div className="text-gray-400 text-sm mt-2">ChronoCoins</div>
        </div>

        {watchingAd ? (
          <div className="text-center py-2">
            <div className="text-cyan-300 text-sm mb-2 animate-pulse">Playing ad…</div>
            <div className="h-2 bg-gray-700 rounded overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-[width] ease-linear"
                style={{ width: adFill ? "100%" : "0%", transitionDuration: `${AD_MS}ms` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={handleDouble}
              className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 h-12 text-lg font-bold"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch ad for 2× ({formatChronoValue(earnings * 2)})
            </Button>
            <Button
              onClick={handleClaim}
              variant="outline"
              className="w-full border-cyan-500/40 text-cyan-200 hover:bg-cyan-900/30 h-11"
            >
              Claim {formatChronoValue(earnings)}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
