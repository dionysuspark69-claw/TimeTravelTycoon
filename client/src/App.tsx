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
import { PrestigeTutorial } from "./components/PrestigeTutorial";
import { ActiveEventsDisplay } from "./components/ActiveEventsDisplay";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./lib/stores/useAuth";
import { useSaveState } from "./lib/stores/useSaveState";
import { useGameSave } from "./lib/hooks/useGameSave";
import { NextGoalWidget } from "./components/NextGoalWidget";
import { NewsTicker } from "./components/NewsTicker";
import { PurchaseCelebration } from "./components/PurchaseCelebration";
import { OnboardingTutorial } from "./components/OnboardingTutorial";
import { PrestigePerkChoiceModal } from "./components/PrestigePerkChoiceModal";
import { ManagerPerkChoiceModal } from "./components/ManagerPerkChoiceModal";

function App() {
  const [showGame, setShowGame] = useState(false);
  const { loading: authLoading, isAuthenticated, fetchUser } = useAuth();
  const { hasLoadedOnce } = useSaveState();

  useGameSave();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Show game as soon as auth resolves - don't block on cloud load
  // Cloud save loads in background and merges into state when ready
  useEffect(() => {
    if (!authLoading) {
      setShowGame(true);
    }
  }, [authLoading]);

  // Hard fallback: show game after 5s no matter what
  useEffect(() => {
    const fallback = setTimeout(() => setShowGame(true), 5000);
    return () => clearTimeout(fallback);
  }, []);

  if (!showGame) {
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
      <PrestigeTutorial />
      <AchievementChecker />
      <PurchaseCelebration />
      <FloatingTextManager />
      <OnboardingTutorial />
      <PrestigePerkChoiceModal />
      <ManagerPerkChoiceModal />
      <GameLoop />
      <SoundManager />
      <Toaster />
    </div>
  );
}

export default App;
