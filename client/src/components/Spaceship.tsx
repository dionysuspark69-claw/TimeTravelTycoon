import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SpaceshipProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  speedMultiplier?: number;
  isNew?: boolean;
}

export function Spaceship({ position, rotation = [0, 0, 0], color = "#3498db", speedMultiplier = 1, isNew = false }: SpaceshipProps) {
  const groupRef = useRef<THREE.Group>(null);
  const engineGlow1Ref = useRef<THREE.PointLight>(null);
  const engineGlow2Ref = useRef<THREE.PointLight>(null);
  
  const [scale, setScale] = useState(isNew ? 0.01 : 1);
  const baseY = position[1];
  const floatOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  
  useEffect(() => {
    if (isNew) {
      const targetScale = 1;
      const animationDuration = 1500;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setScale(0.01 + eased * (targetScale - 0.01));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [isNew]);
  
  useFrame((state) => {
    if (groupRef.current) {
      const floatHeight = Math.sin(state.clock.elapsedTime * 0.5 * speedMultiplier + floatOffset) * 0.15;
      groupRef.current.position.y = baseY + floatHeight;
      
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3 * speedMultiplier + floatOffset) * 0.05;
    }
    
    if (engineGlow1Ref.current && engineGlow2Ref.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 4 * speedMultiplier) * 0.5 + 1;
      engineGlow1Ref.current.intensity = pulse;
      engineGlow2Ref.current.intensity = pulse;
    }
  });
  
  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh position={[-0.5, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.6, 0.1, 0.3]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      <mesh position={[0.5, -0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.6, 0.1, 0.3]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color="#1abc9c"
          emissive="#1abc9c"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      <mesh position={[-0.3, -0.8, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 0.4, 8]} />
        <meshStandardMaterial
          color="#e74c3c"
          emissive="#e74c3c"
          emissiveIntensity={1}
        />
      </mesh>
      
      <mesh position={[0.3, -0.8, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 0.4, 8]} />
        <meshStandardMaterial
          color="#e74c3c"
          emissive="#e74c3c"
          emissiveIntensity={1}
        />
      </mesh>
      
      <pointLight
        ref={engineGlow1Ref}
        position={[-0.3, -1, 0]}
        color="#e74c3c"
        intensity={1}
        distance={2}
      />
      
      <pointLight
        ref={engineGlow2Ref}
        position={[0.3, -1, 0]}
        color="#e74c3c"
        intensity={1}
        distance={2}
      />
      
      <pointLight
        position={[0, 0.8, 0]}
        color="#1abc9c"
        intensity={0.5}
        distance={3}
      />
    </group>
  );
}
