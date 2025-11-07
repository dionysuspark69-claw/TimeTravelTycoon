import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TimeMachine } from "./TimeMachine";
import { Customer } from "./Customer";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useMemo } from "react";

function Scene() {
  const waitingCustomers = useIdleGame(state => state.waitingCustomers);
  
  const customerPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const maxDisplay = Math.min(waitingCustomers, 20);
    
    for (let i = 0; i < maxDisplay; i++) {
      const angle = (i / maxDisplay) * Math.PI * 2;
      const radius = 3 + Math.floor(i / 8) * 0.5;
      positions.push([
        Math.cos(angle) * radius,
        0.25,
        Math.sin(angle) * radius
      ]);
    }
    
    return positions;
  }, [waitingCustomers]);
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 5, -5]} intensity={0.5} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} roughness={0.8} />
      </mesh>
      
      <TimeMachine />
      
      {customerPositions.map((pos, i) => (
        <Customer key={i} position={pos} index={i} />
      ))}
      
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
    <div style={{ width: "100%", height: "60vh", position: "relative" }}>
      <Canvas
        camera={{ position: [8, 6, 8], fov: 50 }}
        shadows
      >
        <color attach="background" args={["#1a1a2e"]} />
        <Scene />
      </Canvas>
    </div>
  );
}
