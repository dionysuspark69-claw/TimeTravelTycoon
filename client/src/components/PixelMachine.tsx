/**
 * PixelMachine.tsx — single top-down machine sprite (5 tiers).
 * Useful for upgrade-cards / fleet lists. NOT used in the cross-section viewport.
 */
import { useEffect, useRef } from "react";
import { MACHINES, MACH_W, MACH_H, drawSprite, getEraPalette } from "../lib/pixelEngine";

interface Props { tier: 1|2|3|4|5; era: string; scale?: number; className?: string; }

export default function PixelMachine({ tier, era, scale = 3, className }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = MACH_W * scale * dpr; c.height = MACH_H * scale * dpr;
    c.style.width = `${MACH_W * scale}px`; c.style.height = `${MACH_H * scale}px`;
    const ctx = c.getContext("2d", { alpha: true })!;
    ctx.imageSmoothingEnabled = false;
    ctx.scale(scale * dpr, scale * dpr);
    const pal = getEraPalette(era);
    const frames = MACHINES[`tier${tier}`];
    let raf = 0, t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, MACH_W, MACH_H);
      const f = Math.floor(t / 20) % 2;
      drawSprite(ctx, frames[f], 0, 0, pal);
      t++; raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [tier, era, scale]);
  return <canvas ref={ref} className={className} style={{ imageRendering: "pixelated" }} />;
}
