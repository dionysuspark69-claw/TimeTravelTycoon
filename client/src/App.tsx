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

function App() {
  const [showGame, setShowGame] = useState(false);
  const { loading: authLoading, isAuthenticated, fetchUser } = useAuth();
  const { hasLoadedOnce } = useSaveState();

  useGameSave();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Show game once:
  // 1. Auth has resolved (not loading), AND
  // 2. Either: not authenticated (no save to wait for), or the cloud save has been attempted
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      // Guest: no save to load, show immediately
      setShowGame(true);
      return;
    }

    // Authenticated: wait for load attempt (hasLoadedOnce flips after loadGame() completes)
    if (hasLoadedOnce) {
      setShowGame(true);
    }
  }, [authLoading, isAuthenticated, hasLoadedOnce]);

  // Hard fallback: never stay on loading screen longer than 10s
  // Auth timeout is 7s + load attempt, so 10s gives full chain room to complete
  useEffect(() => {
    const fallback = setTimeout(() => setShowGame(true), 10000);
    return () => clearTimeout(fallback);
  }, []);

  if (!showGame) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="flex flex-col items-center gap-4">
          <div className="text-white text-2xl font-bold">Loading ChronoTransit...</div>
          {isAuthenticated && !hasLoadedOnce && (
            <div className="text-cyan-400 text-sm">Restoring your save...</div>
          )}
        </div>
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
      <GameLoop />
      <SoundManager />
      <Toaster />
    </div>
  );
}

export default App;
