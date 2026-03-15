import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { TimeMachine } from "./TimeMachine";
import { CharacterManager } from "./CharacterManager";
import { Starfield } from "./Starfield";
import { EraDisplay } from "./EraDisplay";
import { TemporalAnomaly } from "./TemporalAnomaly";
import { ComboClick } from "./ComboClick";
import { Component, ErrorInfo, ReactNode } from "react";
import { useIdleGame, TIME_PERIODS } from "@/lib/stores/useIdleGame";
import { useIsMobile } from "@/hooks/use-is-mobile";

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

function Scene() {
  const timeMachineCount = useIdleGame(state => state.timeMachineCount);
  
  const MAX_RENDERED = 12;
  const TIER_SIZE = 5;
  
  const tiers: Array<{ count: number; scale: number }> = [];
  let remainingMachines = timeMachineCount;
  
  while (remainingMachines > 0 && tiers.length < MAX_RENDERED) {
    const tierCount = Math.min(remainingMachines, TIER_SIZE);
    const scale = 1 + (tierCount - 1) * 0.2;
    tiers.push({ count: tierCount, scale });
    remainingMachines -= tierCount;
  }
  
  const hiddenMachines = remainingMachines;
  
  const timeMachines = [];
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const angle = (i / tiers.length) * Math.PI * 2;
    const radius = tiers.length === 1 ? 0 : 4 + (tier.scale - 1) * 1.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    timeMachines.push(
      <group key={i} position={[x, 0, z]} scale={tier.scale}>
        <TimeMachine />
        {tier.count > 1 && (
          <Text
            position={[0, 3.5, 0]}
            fontSize={0.4}
            color="#3498db"
            anchorX="center"
            anchorY="middle"
          >
            x{tier.count}
          </Text>
        )}
      </group>
    );
  }
  
  return (
    <>
      <Starfield />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} roughness={0.8} />
      </mesh>
      
      {timeMachines}
      
      <CharacterManager />
      
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
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
  
  const cameraPosition: [number, number, number] = isMobile 
    ? [10, 8, 10]
    : [8, 6, 8];
  
  const cameraFov = isMobile ? 60 : 50;
  const bgColor = ERA_BG_COLORS[currentDestination] || "#1a1a2e";
  
  return (
    <WebGLErrorBoundary>
      <div className="w-full h-[50vh] md:h-[60vh] relative">
        <ComboClick />
        <Canvas
          camera={{ position: cameraPosition, fov: cameraFov }}
          shadows
          onCreated={(state) => {
            console.log("WebGL context created successfully");
          }}
        >
          <color attach="background" args={[bgColor]} />
          <Scene />
        </Canvas>
        <EraDisplay />
        <TemporalAnomaly />
      </div>
    </WebGLErrorBoundary>
  );
}