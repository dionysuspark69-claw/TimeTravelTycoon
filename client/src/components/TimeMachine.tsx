import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useIdleGame } from "@/lib/stores/useIdleGame";

export function TimeMachine() {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const ring4Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  const processingCustomers = useIdleGame(state => state.processingCustomers);
  const currentDestination = useIdleGame(state => state.currentDestination);
  const timeMachineLevel = useIdleGame(state => state.timeMachineLevel);
  const tripEndTime = useIdleGame(state => state.tripEndTime);
  const clickBoost = useIdleGame(state => state.clickBoost);
  
  const destinationColors: Record<string, string> = {
    dinosaur: "#2ecc71",
    egypt: "#f39c12",
    medieval: "#9b59b6",
    wildwest: "#e74c3c",
    future: "#3498db",
    farfuture: "#9b59b6"
  };
  
  const color = destinationColors[currentDestination] || "#3498db";
  const scale = 1 + (timeMachineLevel * 0.03);
  
  const isProcessing = processingCustomers > 0;
  
  useFrame((state) => {
    const spinSpeed = isProcessing ? 0.05 : 0.005;
    
    if (meshRef.current) {
      meshRef.current.rotation.y += spinSpeed;
      
      if (isProcessing) {
        const bounce = Math.sin(state.clock.elapsedTime * 5) * 0.1;
        meshRef.current.position.y = bounce;
      } else {
        const idleBob = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        meshRef.current.position.y = idleBob;
      }
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.y += isProcessing ? 0.1 : 0.02;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= isProcessing ? 0.08 : 0.015;
    }
    
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y += isProcessing ? 0.12 : 0.025;
    }
    
    if (ring4Ref.current) {
      ring4Ref.current.rotation.y -= isProcessing ? 0.15 : 0.03;
    }
    
    if (coreRef.current) {
      const intensity = isProcessing ? 2 : 1;
      const pulseSpeed = isProcessing ? 6 : 2;
      const pulseAmount = isProcessing ? 0.15 : 0.05;
      coreRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * pulseAmount * intensity);
    }
  });
  
  return (
    <group ref={meshRef} scale={scale}>
      <mesh 
        position={[0, 0, 0]} 
        onClick={(e) => {
          e.stopPropagation();
          clickBoost();
        }}
      >
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
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
          emissiveIntensity={isProcessing ? 1 : 0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isProcessing ? 0.8 : 0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {timeMachineLevel >= 5 && (
        <mesh ref={ring2Ref} rotation={[0.5, 0, 0]}>
          <torusGeometry args={[2, 0.08, 16, 100]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isProcessing ? 1 : 0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}
      
      {timeMachineLevel >= 10 && (
        <mesh ref={ring3Ref} rotation={[-0.5, 0, 0.5]}>
          <torusGeometry args={[2.2, 0.06, 16, 100]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isProcessing ? 1 : 0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}
      
      {timeMachineLevel >= 15 && (
        <mesh ref={ring4Ref} rotation={[0, 0, 0.8]}>
          <torusGeometry args={[2.4, 0.05, 16, 100]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isProcessing ? 1 : 0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}
      
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
        intensity={isProcessing ? 3 : 1.5}
        distance={isProcessing ? 15 : 10}
      />
      
      {timeMachineLevel >= 20 && (
        <>
          <pointLight position={[2, 0, 0]} color={color} intensity={0.5} distance={5} />
          <pointLight position={[-2, 0, 0]} color={color} intensity={0.5} distance={5} />
          <pointLight position={[0, 2, 0]} color={color} intensity={0.5} distance={5} />
        </>
      )}
    </group>
  );
}
