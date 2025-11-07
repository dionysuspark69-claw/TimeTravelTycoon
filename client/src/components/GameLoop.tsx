import { useEffect } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";
import { useManagers } from "@/lib/stores/useManagers";

export function GameLoop() {
  const update = useIdleGame(state => state.update);
  const { getCustomerRateBonus, getSpeedBonus, getRevenueBonus } = useManagers();
  
  useEffect(() => {
    let lastTime = Date.now();
    let animationFrameId: number;
    
    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      const bonuses = {
        customerRate: getCustomerRateBonus(),
        speed: getSpeedBonus(),
        revenue: getRevenueBonus()
      };
      
      update(deltaTime, bonuses);
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [update, getCustomerRateBonus, getSpeedBonus, getRevenueBonus]);
  
  return null;
}
