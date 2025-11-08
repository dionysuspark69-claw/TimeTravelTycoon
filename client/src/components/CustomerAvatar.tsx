import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CustomerEntity } from "@/lib/stores/useIdleGame";

interface CustomerAvatarProps {
  entity: CustomerEntity;
  position: [number, number, number];
  targetPosition?: [number, number, number];
  onReachedTarget?: (entityId: string) => void;
}

const COLORS = [
  "#3498db",
  "#e74c3c", 
  "#f39c12",
  "#2ecc71",
  "#9b59b6"
];

export function CustomerAvatar({ entity, position, targetPosition, onReachedTarget }: CustomerAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  
  const color = useMemo(() => COLORS[entity.colorIndex % COLORS.length], [entity.colorIndex]);
  
  const currentPos = useRef(new THREE.Vector3(...position));
  const walkPhase = useRef(0);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    if (targetPosition && entity.state === "approaching") {
      const target = new THREE.Vector3(...targetPosition);
      const distance = currentPos.current.distanceTo(target);
      
      if (distance > 0.1) {
        const direction = target.clone().sub(currentPos.current).normalize();
        const speed = 2;
        const step = speed * delta;
        
        currentPos.current.add(direction.multiplyScalar(Math.min(step, distance)));
        groupRef.current.position.copy(currentPos.current);
        
        const angle = Math.atan2(direction.x, direction.z);
        groupRef.current.rotation.y = angle;
        
        walkPhase.current += delta * 8;
        
        if (leftLegRef.current) {
          leftLegRef.current.rotation.x = Math.sin(walkPhase.current) * 0.5;
        }
        if (rightLegRef.current) {
          rightLegRef.current.rotation.x = Math.sin(walkPhase.current + Math.PI) * 0.5;
        }
        if (leftArmRef.current) {
          leftArmRef.current.rotation.x = Math.sin(walkPhase.current + Math.PI) * 0.3;
        }
        if (rightArmRef.current) {
          rightArmRef.current.rotation.x = Math.sin(walkPhase.current) * 0.3;
        }
      } else {
        if (!entity.hasReachedTarget && onReachedTarget) {
          onReachedTarget(entity.id);
        }
        
        currentPos.current.copy(target);
        groupRef.current.position.copy(currentPos.current);
        
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
      }
    } else if (entity.state === "waiting") {
      groupRef.current.position.set(...position);
      
      const idleBob = Math.sin(Date.now() * 0.002) * 0.05;
      groupRef.current.position.y = position[1] + idleBob;
      
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    } else if (entity.state === "boarding" || entity.state === "traveling") {
      const target = new THREE.Vector3(...position);
      const distance = currentPos.current.distanceTo(target);
      
      if (distance > 0.1) {
        const direction = target.clone().sub(currentPos.current).normalize();
        const speed = 4;
        const step = speed * delta;
        
        currentPos.current.add(direction.multiplyScalar(Math.min(step, distance)));
        groupRef.current.position.copy(currentPos.current);
        
        const angle = Math.atan2(direction.x, direction.z);
        groupRef.current.rotation.y = angle;
      } else {
        currentPos.current.copy(target);
        groupRef.current.position.copy(currentPos.current);
      }
      
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    } else {
      groupRef.current.position.set(...position);
      
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }
    
    if (entity.state === "boarding") {
      const scale = 1 - Math.min((Date.now() - entity.stateChangedTime) / 500, 1);
      groupRef.current.scale.setScalar(Math.max(scale, 0.01));
    } else if (entity.state === "spawning") {
      const scale = Math.min((Date.now() - entity.stateChangedTime) / 200, 1);
      groupRef.current.scale.setScalar(scale);
    } else {
      groupRef.current.scale.set(1, 1, 1);
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <mesh ref={leftLegRef} position={[-0.08, 0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <mesh ref={rightLegRef} position={[0.08, 0.05, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <mesh ref={leftArmRef} position={[-0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      <mesh ref={rightArmRef} position={[0.2, 0.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
