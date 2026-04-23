/**
 * PixelCustomer.tsx — tiny standalone component for lists/tooltips/queue UI.
 * Renders one customer sprite animated. Use this wherever CustomerAvatar is today.
 */
import { useEffect, useRef } from "react";
import { CHARACTERS, CHAR_W, CHAR_H, drawSprite, getEraPalette } from "../lib/pixelEngine";

interface Props { era: string; scale?: number; animate?: boolean; className?: string; }

export default function PixelCustomer({ era, scale = 3, animate = true, className }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = CHAR_W * scale * dpr; c.height = CHAR_H * scale * dpr;
    c.style.width = `${CHAR_W * scale}px`; c.style.height = `${CHAR_H * scale}px`;
    const ctx = c.getContext("2d", { alpha: true })!;
    ctx.imageSmoothingEnabled = false;
    ctx.scale(scale * dpr, scale * dpr);
    const pal = getEraPalette(era);
    const frames = CHARACTERS[era] || CHARACTERS.spaceage;
    let raf = 0, t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, CHAR_W, CHAR_H);
      const f = animate ? Math.floor(t / 15) % 3 : 0;
      drawSprite(ctx, frames[f], 0, 0, { A: pal.A, B: pal.B, E: pal.E });
      t++; raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [era, scale, animate]);
  return <canvas ref={ref} className={className} style={{ imageRendering: "pixelated" }} />;
}
