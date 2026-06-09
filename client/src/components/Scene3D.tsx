// The three.js render path, split into its own chunk so the ~500KB of
// three/@react-three/* only loads when a player turns OFF 2D mode. The default
// 2D canvas viewport (AntFarmViewport) never pulls this in.
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { TimeMachine } from "./TimeMachine";
import { CharacterManager } from "./CharacterManager";
import { Starfield } from "./Starfield";
import { useIdleGame } from "@/lib/stores/useIdleGame";

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
          <Text position={[0, 3.5, 0]} fontSize={0.4} color="#3498db" anchorX="center" anchorY="middle">
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
      <OrbitControls enablePan={false} minDistance={5} maxDistance={15} maxPolarAngle={Math.PI / 2.2} />
    </>
  );
}

export default function Scene3D({
  cameraPosition,
  cameraFov,
  bgColor,
}: {
  cameraPosition: [number, number, number];
  cameraFov: number;
  bgColor: string;
}) {
  return (
    <Canvas camera={{ position: cameraPosition, fov: cameraFov }} shadows>
      <color attach="background" args={[bgColor]} />
      <Scene />
    </Canvas>
  );
}
