import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TimeMachine } from "./TimeMachine";
import { CharacterManager } from "./CharacterManager";
import { Starfield } from "./Starfield";
import { SpaceshipFleet } from "./SpaceshipFleet";
import { Component, ErrorInfo, ReactNode } from "react";

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
        <div style={{ width: "100%", height: "60vh", position: "relative", background: "#1a1a2e" }}>
        </div>
      );
    }

    return this.props.children;
  }
}

function Scene() {
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
      
      <TimeMachine />
      
      <CharacterManager />
      
      <SpaceshipFleet />
      
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

export function GameScene() {
  return (
    <WebGLErrorBoundary>
      <div style={{ width: "100%", height: "60vh", position: "relative" }}>
        <Canvas
          camera={{ position: [8, 6, 8], fov: 50 }}
          shadows
          onCreated={(state) => {
            console.log("WebGL context created successfully");
          }}
        >
          <color attach="background" args={["#1a1a2e"]} />
          <Scene />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}
