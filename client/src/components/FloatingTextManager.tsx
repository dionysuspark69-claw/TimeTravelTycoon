import { useState, useCallback, useEffect, useRef } from "react";
import { FloatingText } from "./FloatingText";
import { useIdleGame } from "@/lib/stores/useIdleGame";

interface FloatingTextItem {
  id: number;
  text: string;
  x: number;
  y: number;
  color?: string;
}

let nextId = 0;

export function FloatingTextManager() {
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const chronocoins = useIdleGame((state) => state.chronocoins);
  const previousCoinsRef = useRef(chronocoins);
  
  useEffect(() => {
    if (chronocoins > previousCoinsRef.current) {
      const diff = chronocoins - previousCoinsRef.current;
      
      if (diff >= 1) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight * 0.3;
        
        const randomX = centerX + (Math.random() - 0.5) * 100;
        const randomY = centerY + (Math.random() - 0.5) * 50;
        
        addFloatingText(`+${Math.floor(diff)} ChronoCoins!`, randomX, randomY);
      }
    }
    previousCoinsRef.current = chronocoins;
  }, [chronocoins]);
  
  const addFloatingText = useCallback((text: string, x: number, y: number, color?: string) => {
    const id = nextId++;
    setFloatingTexts((prev) => [...prev, { id, text, x, y, color }]);
  }, []);
  
  const removeFloatingText = useCallback((id: number) => {
    setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
  }, []);
  
  return (
    <>
      {floatingTexts.map((item) => (
        <FloatingText
          key={item.id}
          text={item.text}
          x={item.x}
          y={item.y}
          color={item.color}
          onComplete={() => removeFloatingText(item.id)}
        />
      ))}
    </>
  );
}
