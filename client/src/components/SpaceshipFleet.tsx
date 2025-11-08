import { useMemo } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { Spaceship } from "./Spaceship";

const SHIP_COLORS = ["#3498db", "#9b59b6", "#e74c3c", "#f39c12", "#1abc9c", "#e67e22", "#16a085", "#d35400"];

const BASE_POSITIONS: Array<[number, number, number]> = [
  [-8, 2, -6],
  [-9, 1.5, -3],
  [-7, 2.2, -8],
  [-8.5, 1.8, -4.5],
  [-7.5, 2.5, -7],
  [-9.5, 2.1, -5],
  [-8, 1.6, -7.5],
  [-7, 1.9, -4],
];

const BASE_ROTATIONS: Array<[number, number, number]> = [
  [0, Math.PI / 4, 0],
  [0, Math.PI / 6, 0],
  [0, Math.PI / 3, 0],
  [0, Math.PI / 5, 0],
  [0, Math.PI / 2.5, 0],
  [0, Math.PI / 3.5, 0],
  [0, Math.PI / 4.5, 0],
  [0, Math.PI / 7, 0],
];

export function SpaceshipFleet() {
  const customerGenerationRate = useIdleGame(state => state.customerGenerationRate);
  const timeMachineSpeed = useIdleGame(state => state.timeMachineSpeed);
  
  const shipCount = useMemo(() => {
    return Math.min(1 + Math.floor(customerGenerationRate / 3), 8);
  }, [customerGenerationRate]);
  
  const ships = useMemo(() => {
    return Array.from({ length: shipCount }, (_, i) => ({
      position: BASE_POSITIONS[i],
      rotation: BASE_ROTATIONS[i],
      color: SHIP_COLORS[i % SHIP_COLORS.length],
    }));
  }, [shipCount]);
  
  return (
    <>
      {ships.map((ship, i) => (
        <Spaceship
          key={i}
          position={ship.position}
          rotation={ship.rotation}
          color={ship.color}
          speedMultiplier={1 + (timeMachineSpeed - 1) * 0.1}
        />
      ))}
    </>
  );
}
