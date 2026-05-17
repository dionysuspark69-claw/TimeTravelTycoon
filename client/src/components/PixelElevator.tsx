/**
 * PixelElevator.tsx — single capsule sprite, animated. For lists / icons.
 */
import { useEffect, useRef } from "react";
import { drawElevator, getEraPalette, ELEV_W, ELEV_H } from "../lib/pixelEngine";

interface Props { era: string; scale?: number; className?: string; }

export default function PixelElevator({ era, scale = 3, className }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = ELEV_W + 4, H = ELEV_H + 4;
    c.width = W * scale * dpr; c.height = H * scale * dpr;
    c.style.width = `${W * scale}px`; c.style.height = `${H * scale}px`;
    const ctx = c.getContext("2d", { alpha: true })!;
    ctx.imageSmoothingEnabled = false;
    ctx.scale(scale * dpr, scale * dpr);
    const pal = getEraPalette(era);
    let raf = 0, t = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      drawElevator(ctx, 2, 2, pal, Math.floor(t / 16));
      t++; raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [era, scale]);
  return <canvas ref={ref} className={className} style={{ imageRendering: "pixelated" }} />;
}
