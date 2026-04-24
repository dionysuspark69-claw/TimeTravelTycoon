import { useEffect, useState, useMemo, Component, type ReactNode } from "react";
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
import { useGameSave, hasLocalSave } from "./lib/hooks/useGameSave";
import { NextGoalWidget } from "./components/NextGoalWidget";
import { NewsTicker } from "./components/NewsTicker";
import { PurchaseCelebration } from "./components/PurchaseCelebration";
import { OnboardingTutorial } from "./components/OnboardingTutorial";
import { PrestigePerkChoiceModal } from "./components/PrestigePerkChoiceModal";
import { ManagerPerkChoiceModal } from "./components/ManagerPerkChoiceModal";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
          <div className="text-2xl font-bold">Something went wrong</div>
          <button
            className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500"
            onClick={() => window.location.reload()}
          >
            Reload Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  // Returning users have game state in localStorage — show game immediately, no network wait.
  // New users (no localStorage) see a brief loading screen until the server send their save.
  const localSaveExists = useMemo(() => hasLocalSave(), []);
  const [showGame, setShowGame] = useState(localSaveExists);

  const { loading: authLoading, isAuthenticated } = useAuth();
  const { hasLoadedOnce } = useSaveState();

  useGameSave();

  // Fire auth check exactly once on mount.
  useEffect(() => {
    useAuth.getState().fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // For new users: show game once auth + server load resolve.
  useEffect(() => {
    if (localSaveExists) return; // already showing
    if (!authLoading && (hasLoadedOnce || !isAuthenticated)) {
      setShowGame(true);
    }
  }, [localSaveExists, authLoading, isAuthenticated, hasLoadedOnce]);

  // Hard fallback for new users: show game after 6s regardless of network state.
  // Does NOT set hasLoadedOnce — server sync can still finish and apply the save.
  useEffect(() => {
    if (localSaveExists) return;
    const fallback = setTimeout(() => setShowGame(true), 6000);
    return () => clearTimeout(fallback);
  }, [localSaveExists]);

  if (!showGame) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 gap-4">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-white text-xl font-bold animate-pulse">Loading ChronoTransit...</div>
        <div className="text-gray-400 text-sm">Connecting to time stream...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
