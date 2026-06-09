import { EraDisplay } from "./EraDisplay";
import { TemporalAnomaly } from "./TemporalAnomaly";
import { ComboClick } from "./ComboClick";
import { ArtifactOverlay } from "./ArtifactOverlay";
import AntFarmViewport from "./AntFarmViewport";
import { Component, ErrorInfo, ReactNode, Suspense, lazy } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useSettings } from "@/lib/stores/useSettings";

// three.js path lives in its own chunk; only fetched when 2D mode is off.
const Scene3D = lazy(() => import("./Scene3D"));

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log("WebGL Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[50vh] md:h-[60vh] relative bg-[#1a1a2e]">
        </div>
      );
    }

    return this.props.children;
  }
}

const ERA_BG_COLORS: Record<string, string> = {
  dinosaur:    "#0d2b1a",
  egypt:       "#2b1e0a",
  rome:        "#2b0f0f",
  medieval:    "#1a0d2b",
  viking:      "#141a1f",
  renaissance: "#2b1800",
  industrial:  "#1a1a1a",
  wildwest:    "#2b1200",
  roaring20s:  "#2b2200",
  spaceage:    "#0a1628",
  future:      "#071f1f",
  cyberpunk:   "#1f0a2b",
  atlantis:    "#071528",
  prehistoric: "#2b1400",
  mooncolony:  "#121418",
  aiutopia:    "#071a2b",
  mars:        "#2b0e00",
  timeorigin:  "#0a0d2b",
  quantum:     "#130a2b",
  paradise:    "#072b14",
  timeloop:    "#072b0f",
  multiversal: "#1a072b",
  temporal:    "#2b0720",
};

export function GameScene() {
  const isMobile = useIsMobile();
  const currentDestination = useIdleGame(s => s.currentDestination);
  const use2DMode = useSettings(s => s.use2DMode);

  // AntFarmViewport (cross-section world) is the default; Three.js only when 2D mode is off
  if (use2DMode) {
    return (
      <div className="w-full h-[50vh] md:h-[60vh] relative overflow-hidden flex items-center justify-center">
        <ComboClick />
        <WebGLErrorBoundary>
          <AntFarmViewport />
        </WebGLErrorBoundary>
        <EraDisplay />
        <TemporalAnomaly />
        <ArtifactOverlay />
      </div>
    );
  }
  
  const cameraPosition: [number, number, number] = isMobile 
    ? [10, 8, 10]
    : [8, 6, 8];
  
  const cameraFov = isMobile ? 60 : 50;
  const bgColor = ERA_BG_COLORS[currentDestination] || "#1a1a2e";
  
  return (
    <WebGLErrorBoundary>
      <div className="w-full h-[50vh] md:h-[60vh] relative">
        <ComboClick />
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-cyan-300 text-sm">Loading 3D scene…</div>}>
          <Scene3D cameraPosition={cameraPosition} cameraFov={cameraFov} bgColor={bgColor} />
        </Suspense>
        <EraDisplay />
        <TemporalAnomaly />
        <ArtifactOverlay />
      </div>
    </WebGLErrorBoundary>
  );
}