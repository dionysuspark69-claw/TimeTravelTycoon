import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FloatingTextProps {
  text: string;
  x: number;
  y: number;
  color?: string;
  onComplete: () => void;
}

export function FloatingText({ text, x, y, color = "#10b981", onComplete }: FloatingTextProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.8 }}
      animate={{ opacity: 0, y: -80, scale: 1.2 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      style={{
        position: "fixed",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 1000,
        fontSize: "24px",
        fontWeight: "bold",
        color: color,
        textShadow: "0 0 10px rgba(16, 185, 129, 0.8), 0 2px 4px rgba(0,0,0,0.5)",
      }}
    >
      {text}
    </motion.div>
  );
}
