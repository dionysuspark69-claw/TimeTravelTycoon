import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useIdleGame } from "@/lib/stores/useIdleGame";

export function TimeMachine() {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  const processingCustomers = useIdleGame(state => state.processingCustomers);
  const currentDestination = useIdleGame(state => state.currentDestination);
  const timeMachineLevel = useIdleGame(state => state.timeMachineLevel);
  
  const destinationColors: Record<string, string> = {
    dinosaur: "#2ecc71",
    egypt: "#f39c12",
    medieval: "#9b59b6",
    wildwest: "#e74c3c",
    future: "#3498db"
  };
  
  const color = destinationColors[currentDestination] || "#3498db";
  const scale = 1 + (timeMachineLevel * 0.05);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.02;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    
    if (coreRef.current) {
      const intensity = processingCustomers > 0 ? 1.5 : 1;
      coreRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1 * intensity);
    }
  });
  
  return (
    <group ref={meshRef} scale={scale}>
      <mesh position={[0, 0, 0]} ref={coreRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={processingCustomers > 0 ? 1 : 0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh ref={ringRef}>
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI) / 2) * 1.5,
            0,
            Math.sin((i * Math.PI) / 2) * 1.5
          ]}
        >
          <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
          <meshStandardMaterial
            color="#2c3e50"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      ))}
      
      <pointLight
        color={color}
        intensity={processingCustomers > 0 ? 2 : 1}
        distance={10}
      />
    </group>
  );
}
