/**
 * AntFarmScene.tsx
 * -----------------------------------------------------------------------------
 * Cross-section game viewport. Renders a vertical stack of era strata with a
 * central elevator shaft that the time-machine capsule rides between them.
 *
 * Props mirror what's available in useIdleGame:
 *   currentEra:   string  — which stratum the player is "visiting"
 *   unlockedEras: string[] — controls which strata appear unlocked
 *   queueSize:    number  — drives passengers waiting per stratum
 *   tier:         1..5    — visual tier of the capsule (cosmetic)
 *   onArrive?:    (era) => void  — fired when capsule lands on a stratum
 *
 * The viewport autonomously shows STRATUM_WINDOW strata at a time, centered
 * on currentEra. The elevator animates between unlocked strata.
 *
 * Perf: static layers (terrain tiles, landmarks, stratum labels, shaft body)
 * are pre-painted to an offscreen canvas when `visible` changes. The per-frame
 * loop blits the cache and overlays only the animated layers.
 */

import { useEffect, useMemo, useRef } from "react";
import {
  ERA_META, ERA_PALETTES, STRATA, TERRAIN, CHARACTERS,
  CHAR_W, CHAR_H, TILE, LANDMARK_H, ELEV_W, ELEV_H,
  drawSprite, drawLandmark, drawSky, drawElevator, getEraPalette,
} from "../lib/pixelEngine";

const STRATUM_WINDOW = 3; // strata visible at once
const STRATUM_H = 84;     // px per stratum
const SHAFT_W = 22;

interface Props {
  currentEra: string;
  unlockedEras?: string[];
  queueSize?: number;
  tier?: 1 | 2 | 3 | 4 | 5;
  width?: number;
  className?: string;
  onArrive?: (era: string) => void;
}

export default function AntFarmScene({
  currentEra,
  unlockedEras,
  queueSize = 3,
  tier = 2,
  width = 720,
  className,
  onArrive,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ frame: 0, elevY: STRATUM_H, dir: 1, lastStratum: -1, raf: 0 });
  const onArriveRef = useRef(onArrive);
  onArriveRef.current = onArrive;

  const currentIdx = useMemo(
    () => Math.max(0, STRATA.findIndex(s => s.era === currentEra)),
    [currentEra],
  );

  // Window of visible strata, centered on currentEra.
  const { startIdx, visible } = useMemo(() => {
    const start = Math.max(0, Math.min(STRATA.length - STRATUM_WINDOW, currentIdx - 1));
    return { startIdx: start, visible: STRATA.slice(start, start + STRATUM_WINDOW) };
  }, [currentIdx]);

  const sceneH = STRATUM_H * visible.length;
  const shaftX = width - 130;
  const pal = getEraPalette(currentEra);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = sceneH * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.maxWidth = `${width}px`;
    canvas.style.display = "block";
    const ctx = canvas.getContext("2d", { alpha: false })!;
    ctx.imageSmoothingEnabled = false;
    ctx.scale(dpr, dpr);

    // Pre-paint static layers (terrain, landmarks, stratum labels, shaft
    // body) to an offscreen canvas. Rebuilt whenever this effect re-runs —
    // i.e. when `visible`/`width`/`sceneH` change.
    const cache = document.createElement("canvas");
    cache.width = width;
    cache.height = sceneH;
    const cctx = cache.getContext("2d", { alpha: false })!;
    cctx.imageSmoothingEnabled = false;
    renderStatic(cctx, visible, { width, sceneH, shaftX });

    const minY = 4;
    const maxY = sceneH - ELEV_H - 4;
    stateRef.current.elevY = Math.min(Math.max(minY, stateRef.current.elevY), maxY);

    function frame() {
      const s = stateRef.current;
      s.frame = (s.frame + 1) % 10000;

      // Drift elevator toward current stratum's middle.
      const targetStratum = currentIdx - startIdx;
      const targetY = targetStratum * STRATUM_H + (STRATUM_H - ELEV_H) / 2;
      const delta = targetY - s.elevY;
      s.elevY += Math.sign(delta) * Math.min(Math.abs(delta), 1.4);

      // Fire onArrive when settled on a new stratum.
      const stratIdx = Math.round(s.elevY / STRATUM_H);
      if (Math.abs(delta) < 1.5 && stratIdx !== s.lastStratum) {
        s.lastStratum = stratIdx;
        onArriveRef.current?.(visible[stratIdx]?.era);
      }

      ctx.drawImage(cache, 0, 0);
      renderDynamic(ctx, s, visible, currentIdx - startIdx, queueSize, tier, {
        width, sceneH, shaftX,
      });
      s.raf = requestAnimationFrame(frame);
    }
    stateRef.current.raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(stateRef.current.raf);
  }, [visible, currentIdx, startIdx, sceneH, width, shaftX, queueSize, tier]);

  return (
    <div className={className} style={{ position: "relative", display: "inline-block" }}>
      <canvas ref={canvasRef} style={{ imageRendering: "pixelated", display: "block" }} />
      {/* Glass sheen overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(115deg, rgba(255,255,255,0.05) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Era label ribbon (DOM, for sharp text) */}
      <div
        style={{
          position: "absolute",
          bottom: 10, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(13,11,20,0.92)",
          border: `1px solid ${pal.A}`,
          padding: "4px 12px",
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          letterSpacing: "0.12em",
          fontSize: 10,
          color: pal.E,
          pointerEvents: "none",
        }}
      >
        <span style={{ width: 6, height: 6, background: pal.A, boxShadow: `0 0 6px ${pal.A}` }} />
        STRATUM {String(currentIdx + 1).padStart(2, "0")} · {ERA_META[currentEra]?.label.toUpperCase()} · {STRATA[currentIdx].depth}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Static pass — terrain, sky gradients, landmarks, stratum labels, shaft
// body. Drawn once into an offscreen cache and blitted per frame.
function renderStatic(
  ctx: CanvasRenderingContext2D,
  strata: typeof STRATA,
  geom: { width: number; sceneH: number; shaftX: number },
) {
  const { width: W, sceneH: H, shaftX } = geom;

  ctx.fillStyle = "#06040a";
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < strata.length; i++) {
    const stratum = strata[i];
    const era = stratum.era;
    const pal = ERA_PALETTES[era];
    const tile = TERRAIN[era];
    const yTop = i * STRATUM_H;

    // Sky band gradient
    const skyH = Math.round(STRATUM_H * 0.42);
    const skyGrad = ctx.createLinearGradient(0, yTop, 0, yTop + skyH);
    skyGrad.addColorStop(0, "#06040a");
    skyGrad.addColorStop(1, pal.B);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, yTop, W, skyH);

    // Horizon
    ctx.fillStyle = pal.A;
    ctx.fillRect(0, yTop + skyH, W, 1);

    // Substrate (the expensive one — cached once)
    for (let ty = yTop + skyH + 1; ty < yTop + STRATUM_H; ty += TILE)
      for (let tx = 0; tx < W; tx += TILE)
        drawSprite(ctx, tile, tx, ty, pal);

    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, yTop + skyH + 1, W, STRATUM_H - skyH - 1);

    // Landmark
    drawLandmark(ctx, stratum.landmark, 80 + (i * 40) % 200, yTop + skyH - LANDMARK_H, pal);

    // Stratum label tab
    ctx.fillStyle = pal.B; ctx.fillRect(4, yTop + 4, 100, 14);
    ctx.fillStyle = pal.A;
    ctx.fillRect(4, yTop + 4, 100, 1);
    ctx.fillRect(4, yTop + 17, 100, 1);
    ctx.fillStyle = pal.E;
    ctx.font = "bold 7px 'JetBrains Mono', ui-monospace, monospace";
    ctx.textBaseline = "top";
    ctx.fillText(ERA_META[era].label.toUpperCase(), 8, yTop + 6);
    ctx.fillStyle = pal.A;
    ctx.font = "6px 'JetBrains Mono', ui-monospace, monospace";
    ctx.fillText(stratum.depth, 8, yTop + 14);

    if (i > 0) {
      ctx.fillStyle = "#0d0b14";
      ctx.fillRect(0, yTop - 1, W, 1);
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(0, yTop, W, 1);
    }
  }

  // Shaft body
  ctx.fillStyle = "#000";  ctx.fillRect(shaftX, 0, SHAFT_W, H);
  ctx.fillStyle = "#1a1218"; ctx.fillRect(shaftX + SHAFT_W, 0, 3, H);
  ctx.fillStyle = "#3a3640";
  ctx.fillRect(shaftX + 2, 0, 1, H);
  ctx.fillRect(shaftX + SHAFT_W - 3, 0, 1, H);

  // Shaft tick marks at stratum boundaries
  for (let i = 0; i <= strata.length; i++) {
    ctx.fillStyle = "#55525f";
    ctx.fillRect(shaftX + 1, i * STRATUM_H - 1, SHAFT_W - 2, 1);
  }
}

// ─────────────────────────────────────────────────────────────
// Dynamic pass — anything that depends on frame or elevator position.
function renderDynamic(
  ctx: CanvasRenderingContext2D,
  state: { frame: number; elevY: number },
  strata: typeof STRATA,
  currentRelIdx: number,
  queueSize: number,
  tier: number,
  geom: { width: number; sceneH: number; shaftX: number },
) {
  const { width: W, sceneH: H, shaftX } = geom;

  for (let i = 0; i < strata.length; i++) {
    const stratum = strata[i];
    const era = stratum.era;
    const pal = ERA_PALETTES[era];
    const yTop = i * STRATUM_H;
    const skyH = Math.round(STRATUM_H * 0.42);

    // Animated sky particles (drawn over cached sky gradient)
    drawSky(ctx, era, 0, yTop, W, skyH, state.frame);

    // Passengers on surface (scale with queueSize for active stratum)
    const surfY = yTop + skyH - CHAR_H + 1;
    const count = i === currentRelIdx ? Math.min(4, Math.max(1, queueSize)) : 1;
    for (let p = 0; p < count; p++) {
      const cx = 20 + p * 18 + (i * 60) % 200;
      if (cx + CHAR_W > shaftX) continue;
      const f = (state.frame / 12 + i + p) | 0;
      drawSprite(ctx, CHARACTERS[era][f % 3], cx, surfY, pal);
    }
  }

  // Shaft scanlines (purple beam pulse)
  for (let y = 0; y < H; y += 4) {
    const phase = (y + state.frame * 2) % 16;
    if (phase < 3) {
      ctx.fillStyle = "#b04aff";
      ctx.fillRect(shaftX + (SHAFT_W / 2 | 0), y, 1, 2);
    }
  }

  // Elevator + side rails above it
  const idx = Math.max(0, Math.min(strata.length - 1, Math.floor((state.elevY + ELEV_H / 2) / STRATUM_H)));
  const elevPal = ERA_PALETTES[strata[idx].era];
  ctx.fillStyle = "#3a3640";
  ctx.fillRect(shaftX + 5, 0, 1, state.elevY);
  ctx.fillRect(shaftX + SHAFT_W - 6, 0, 1, state.elevY);
  drawElevator(ctx, shaftX + (SHAFT_W - ELEV_W) / 2, state.elevY, elevPal, (state.frame / 8) | 0);

  ctx.globalAlpha = Math.min(0.25, 0.12 + tier * 0.025);
  ctx.fillStyle = elevPal.E;
  ctx.fillRect(shaftX - 4, state.elevY - 2, SHAFT_W + 8, ELEV_H + 4);
  ctx.globalAlpha = 1;

  // Glass scanlines (canvas-wide, last so they sit on top)
  ctx.fillStyle = "rgba(255,255,255,0.015)";
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
}
