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
import { PrestigeTutorial } from "./components/PrestigeTutorial";
import { ActiveEventsDisplay } from "./components/ActiveEventsDisplay";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./lib/stores/useAuth";
import { useGameSave } from "./lib/hooks/useGameSave";
import { NextGoalWidget } from "./components/NextGoalWidget";
import { NewsTicker } from "./components/NewsTicker";
import { PurchaseCelebration } from "./components/PurchaseCelebration";

function App() {
  const [showGame, setShowGame] = useState(false);
  const { loading: authLoading, fetchUser } = useAuth();
  
  useGameSave();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    setShowGame(true);
  }, []);

  if (!showGame || authLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-white text-2xl font-bold">Loading ChronoTransit...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      <div className="flex-1 relative">
        <GameScene />
        <GameUI />
        <ActiveEventsDisplay />
        <NewsTicker />
      </div>
      
      <NextGoalWidget />
      <UpgradePanel />
      
      <OfflineEarningsDialog />
      <ClickBoostTutorial />
      <PrestigeTutorial />
      <AchievementChecker />
      <PurchaseCelebration />
      <FloatingTextManager />
      <GameLoop />
      <SoundManager />
      <Toaster />
    </div>
  );
}

export default App;
