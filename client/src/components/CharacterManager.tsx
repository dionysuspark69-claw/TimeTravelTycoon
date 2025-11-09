import { useMemo, useCallback } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { CustomerAvatar } from "./CustomerAvatar";

const SPAWN_POINT: [number, number, number] = [-8, 0, -5];
const QUEUE_START: [number, number, number] = [-6, 0, -2];

const getMachinePosition = (machineIndex: number, totalMachines: number): [number, number, number] => {
  if (totalMachines === 1) return [0, 0, 0];
  const angle = (machineIndex / totalMachines) * Math.PI * 2;
  const radius = 4;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return [x, 0, z];
};

export function CharacterManager() {
  const customerEntities = useIdleGame((state) => state.customerEntities);
  const timeMachineCount = useIdleGame((state) => state.timeMachineCount);
  const markEntityReachedTarget = useIdleGame((state) => state.markEntityReachedTarget);
  
  const handleReachedTarget = useCallback((entityId: string) => {
    markEntityReachedTarget(entityId);
  }, [markEntityReachedTarget]);
  
  const entityPositions = useMemo(() => {
    const positions = new Map<string, {
      current: [number, number, number];
      target?: [number, number, number];
    }>();
    
    customerEntities.forEach((entity) => {
      const machinePos = getMachinePosition(entity.assignedMachineIndex || 0, timeMachineCount);
      
      if (entity.state === "spawning") {
        positions.set(entity.id, {
          current: SPAWN_POINT,
          target: undefined
        });
      } else if (entity.state === "approaching") {
        positions.set(entity.id, {
          current: SPAWN_POINT,
          target: entity.targetPosition || QUEUE_START
        });
      } else if (entity.state === "waiting") {
        positions.set(entity.id, {
          current: entity.targetPosition || QUEUE_START,
          target: undefined
        });
      } else if (entity.state === "boarding") {
        positions.set(entity.id, {
          current: entity.targetPosition || QUEUE_START,
          target: machinePos
        });
      } else if (entity.state === "traveling") {
        positions.set(entity.id, {
          current: machinePos,
          target: undefined
        });
      }
    });
    
    return positions;
  }, [customerEntities, timeMachineCount]);
  
  return (
    <>
      {customerEntities.map(entity => {
        const posData = entityPositions.get(entity.id);
        if (!posData) return null;
        
        return (
          <CustomerAvatar
            key={entity.id}
            entity={entity}
            position={posData.current}
            targetPosition={posData.target}
            onReachedTarget={handleReachedTarget}
          />
        );
      })}
    </>
  );
}
