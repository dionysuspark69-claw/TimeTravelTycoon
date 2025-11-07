import { useEffect, useState } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Clock, Coins } from "lucide-react";

export function OfflineEarningsDialog() {
  const [show, setShow] = useState(false);
  const { calculateOfflineEarnings, claimOfflineEarnings } = useIdleGame();
  const [earnings, setEarnings] = useState(0);
  
  useEffect(() => {
    const offlineEarnings = calculateOfflineEarnings();
    if (offlineEarnings > 0) {
      setEarnings(offlineEarnings);
      setShow(true);
    }
  }, [calculateOfflineEarnings]);
  
  const handleClaim = () => {
    claimOfflineEarnings();
    setShow(false);
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return Math.floor(num).toString();
  };
  
  return (
    <Dialog open={show} onOpenChange={setShow}>
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
            {formatNumber(earnings)}
          </div>
          <div className="text-gray-400 text-sm mt-2">ChronoCoins</div>
        </div>
        
        <Button
          onClick={handleClaim}
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 h-12 text-lg font-bold"
        >
          Claim Earnings
        </Button>
      </DialogContent>
    </Dialog>
  );
}
