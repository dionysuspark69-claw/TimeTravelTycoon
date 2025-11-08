import { useEffect, useState } from "react";
import "@fontsource/inter";
import { GameScene } from "./components/GameScene";
import { GameUI } from "./components/GameUI";
import { UpgradePanel } from "./components/UpgradePanel";
import { GameLoop } from "./components/GameLoop";
import { SoundManager } from "./components/SoundManager";
import { OfflineEarningsDialog } from "./components/OfflineEarningsDialog";
import { AchievementChecker } from "./components/AchievementChecker";
import { FloatingTextManager } from "./components/FloatingTextManager";
import { ClickBoostTutorial } from "./components/ClickBoostTutorial";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    setShowGame(true);
  }, []);

  if (!showGame) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-white text-2xl font-bold">Loading ChronoTransit...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      <div className="flex-1 relative">
        <GameScene />
        <GameUI />
      </div>
      
      <UpgradePanel />
      
      <OfflineEarningsDialog />
      <ClickBoostTutorial />
      <AchievementChecker />
      <FloatingTextManager />
      <GameLoop />
      <SoundManager />
      <Toaster />
    </div>
  );
}

export default App;
