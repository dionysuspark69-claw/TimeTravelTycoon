import { useEffect } from "react";
import { useIdleGame } from "@/lib/stores/useIdleGame";

export function GameLoop() {
  const update = useIdleGame(state => state.update);
  
  useEffect(() => {
    let lastTime = Date.now();
    let animationFrameId: number;
    
    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      update(deltaTime);
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    animationFrameId = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [update]);
  
  return null;
}
