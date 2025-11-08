import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TimeMachine } from "./TimeMachine";
import { CharacterManager } from "./CharacterManager";
import { Starfield } from "./Starfield";
import { Spaceship } from "./Spaceship";

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
      
      <Spaceship 
        position={[-8, 2, -6]} 
        rotation={[0, Math.PI / 4, 0]}
        color="#3498db"
      />
      <Spaceship 
        position={[-9, 1.5, -3]} 
        rotation={[0, Math.PI / 6, 0]}
        color="#9b59b6"
      />
      <Spaceship 
        position={[-7, 2.2, -8]} 
        rotation={[0, Math.PI / 3, 0]}
        color="#e74c3c"
      />
      
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
