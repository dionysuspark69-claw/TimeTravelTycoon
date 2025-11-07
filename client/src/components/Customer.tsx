import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CustomerProps {
  position: [number, number, number];
  index: number;
}

export function Customer({ position, index }: CustomerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = useMemo(() => {
    const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];
    return colors[index % colors.length];
  }, [index]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.3, 0.5, 0.3]} />
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}
