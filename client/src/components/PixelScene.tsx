/**
 * PixelScene.tsx
 * -----------------------------------------------------------------------------
 * Drop-in replacement for the 2D game viewport. Uses a single <canvas> and
 * procedural sprites from pixelEngine. Zero images, one render loop, RAF-driven.
 *
 * Props mirror what your existing GameScene consumes from useIdleGame:
 *   era:       string   (key into ERA_META/ERA_PALETTES/TERRAIN/CHARACTERS)
 *   tier:      1..5     (machine tier in MACHINES)
 *   fleetSize: number   (how many machines to show; capped at 4 on screen)
 *   queueSize: number   (customers in the waiting line; animates in/out)
 *   onDepart?: () => void   called each time a machine completes a trip
 *
 * Usage (patch): see INTEGRATION.md. In short:
 *   <PixelScene era={currentEra} tier={fleetTier} fleetSize={n} queueSize={q} />
 */

import { useEffect, useRef } from "react";
import {
  PALETTE, ERA_META, ERA_PALETTES,
  CHARACTERS, MACHINES, TERRAIN,
  CHAR_W, CHAR_H, MACH_W, MACH_H, TILE,
  drawSprite, getEraPalette,
} from "../lib/pixelEngine";

interface Props {
  era: string;
  tier: 1 | 2 | 3 | 4 | 5;
  fleetSize: number;
  queueSize: number;
  onDepart?: () => void;
  className?: string;
}

type Cust = { era: string; x: number; y: number; phase: number; speed: number; boarding: number };
type Mach = { tier: 1|2|3|4|5; x: number; y: number; state: "idle"|"boarding"|"departing"; t: number; passengers: number };

const SCENE_W = 320, SCENE_H = 180;       // internal canvas resolution
const PIXEL_SCALE = 3;                    // upscale factor; device pixel ratio is applied on top

export default function PixelScene({ era, tier, fleetSize, queueSize, onDepart, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<{ machs: Mach[]; custs: Cust[]; frame: number; lastT: number; tileCache?: ImageData }>({
    machs: [], custs: [], frame: 0, lastT: 0,
  });

  // Rebuild machines when tier/fleetSize changes.
  useEffect(() => {
    const s = stateRef.current;
    const N = Math.min(4, Math.max(1, fleetSize));
    const slotY = 110;
    const margin = 40;
    const gap = (SCENE_W - margin * 2) / Math.max(1, N);
    s.machs = Array.from({ length: N }, (_, i) => ({
      tier, x: margin + gap * i + gap / 2 - MACH_W / 2, y: slotY,
      state: "idle" as const, t: Math.random() * 3, passengers: 0,
    }));
  }, [tier, fleetSize]);

  // Sync customer count to queueSize.
  useEffect(() => {
    const s = stateRef.current;
    const target = Math.min(12, queueSize);
    while (s.custs.length < target) s.custs.push(spawnCust(era, s.custs.length));
    while (s.custs.length > target) s.custs.pop();
  }, [queueSize, era]);

  // Main loop.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SCENE_W * PIXEL_SCALE * dpr;
    canvas.height = SCENE_H * PIXEL_SCALE * dpr;
    // Let CSS scale the canvas to fit the container width on any screen size.
    // height: auto maintains the correct 16:9 aspect ratio automatically.
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    const ctx = canvas.getContext("2d", { alpha: false })!;
    ctx.imageSmoothingEnabled = false;
    ctx.scale(PIXEL_SCALE * dpr, PIXEL_SCALE * dpr);

    // Pre-render terrain to an offscreen canvas once.
    const terr = document.createElement("canvas");
    terr.width = SCENE_W; terr.height = SCENE_H;
    const tctx = terr.getContext("2d", { alpha: false })!;
    tctx.imageSmoothingEnabled = false;
    paintTerrain(tctx, era);

    let raf = 0;
    const pal = getEraPalette(era);
    const paletteOverride = { A: pal.A, B: pal.B, E: pal.E };

    const loop = (t: number) => {
      const s = stateRef.current;
      const dt = Math.min(0.05, (t - s.lastT) / 1000);
      s.lastT = t;
      s.frame = (s.frame + 1) % 10000;

      // Tick machines.
      for (const m of s.machs) {
        m.t += dt;
        if (m.state === "idle" && m.t > 3 && s.custs.length > 0) {
          m.state = "boarding"; m.t = 0;
        } else if (m.state === "boarding") {
          if (m.t > 1.5) {
            m.state = "departing"; m.t = 0; m.passengers = Math.min(3, s.custs.length);
            s.custs.splice(0, m.passengers);
            onDepart?.();
          }
        } else if (m.state === "departing") {
          if (m.t > 1.5) { m.state = "idle"; m.t = 0; m.passengers = 0; }
        }
      }

      // Tick customers (drift toward queue slot).
      for (let i = 0; i < s.custs.length; i++) {
        const c = s.custs[i];
        const targetX = 32 + (i % 6) * 14;
        const targetY = 60 + Math.floor(i / 6) * 18;
        c.x += (targetX - c.x) * Math.min(1, dt * 4);
        c.y += (targetY - c.y) * Math.min(1, dt * 4);
        c.phase += dt * c.speed * 6;
      }

      // Render.
      ctx.drawImage(terr, 0, 0);
      drawSkyband(ctx, era, s.frame);
      drawPortal(ctx, era, s.frame);

      // Sort customers + machines by Y for painter's algorithm.
      const items: { y: number; draw: () => void }[] = [];
      for (const c of s.custs) {
        items.push({ y: c.y, draw: () => {
          const f = Math.floor(c.phase) % 3;
          const sprite = CHARACTERS[c.era]?.[f] || CHARACTERS.spaceage[f];
          const cpal = getEraPalette(c.era);
          drawSprite(ctx, sprite, Math.round(c.x), Math.round(c.y), { A: cpal.A, B: cpal.B, E: cpal.E });
        }});
      }
      for (const m of s.machs) {
        items.push({ y: m.y + 18, draw: () => {
          const bob = m.state === "departing" ? -Math.floor(m.t * 24) : Math.floor(Math.sin(m.t * 3) * 2);
          const f = Math.floor(s.frame / 6) % 2;
          const sprite = MACHINES[`tier${m.tier}`][f];
          drawSprite(ctx, sprite, Math.round(m.x), Math.round(m.y + bob), paletteOverride);
          if (m.state === "boarding") drawBoardGlow(ctx, m.x, m.y, s.frame, pal.E);
          if (m.state === "departing") drawContrail(ctx, m.x, m.y + bob, s.frame, pal.A);
        }});
      }
      items.sort((a, b) => a.y - b.y);
      for (const it of items) it.draw();

      // HUD — era label ribbon.
      drawRibbon(ctx, ERA_META[era]?.label || era, pal);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [era, onDepart]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "pixelated", background: PALETTE["0"] }}
    />
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function spawnCust(era: string, i: number): Cust {
  return {
    era: pickCustomerEra(era, i),
    x: -20 + Math.random() * 10, y: 60 + (i % 3) * 18,
    phase: Math.random() * 3, speed: 0.8 + Math.random() * 0.4, boarding: 0,
  };
}
function pickCustomerEra(current: string, i: number): string {
  // Mix in a few tourists from other eras for flavor.
  const eras = Object.keys(ERA_PALETTES);
  if (i % 3 === 0) return current;
  return eras[(i * 7 + 3) % eras.length];
}

function paintTerrain(ctx: CanvasRenderingContext2D, era: string) {
  const tile = TERRAIN[era] || TERRAIN.spaceage;
  const pal = getEraPalette(era);
  // Fill floor half with tile, top half with a skyband we'll overlay per-frame.
  for (let y = 96; y < SCENE_H; y += TILE)
    for (let x = 0; x < SCENE_W; x += TILE)
      drawSprite(ctx, tile, x, y, { A: pal.A, B: pal.B, E: pal.E });
  // Top-half backdrop.
  ctx.fillStyle = PALETTE["0"]; ctx.fillRect(0, 0, SCENE_W, 96);
  // A horizon gradient band.
  const grad = ctx.createLinearGradient(0, 40, 0, 96);
  grad.addColorStop(0, PALETTE["0"]); grad.addColorStop(1, pal.B);
  ctx.fillStyle = grad; ctx.fillRect(0, 40, SCENE_W, 56);
}

function drawSkyband(ctx: CanvasRenderingContext2D, era: string, frame: number) {
  // Era-flavored parallax elements (clouds, stars, neon lines).
  const pal = getEraPalette(era);
  const kind = ERA_META[era]?.terrain;
  ctx.save();
  if (kind === "jungle" || kind === "grass" || kind === "cobble" || kind === "mud") {
    // Clouds
    ctx.fillStyle = PALETTE["6"];
    for (let i = 0; i < 4; i++) {
      const x = ((i * 90 + frame * 0.2) % (SCENE_W + 40)) - 20;
      ctx.fillRect(x, 20 + i * 4, 20, 2); ctx.fillRect(x + 3, 18 + i * 4, 14, 2);
    }
  } else if (kind === "circuit" || kind === "neon" || kind === "steel" || kind === "lattice" || kind === "regolith" || kind === "hex") {
    // Stars
    ctx.fillStyle = PALETTE["7"];
    for (let i = 0; i < 40; i++) {
      const x = (i * 37) % SCENE_W;
      const y = (i * 17) % 90;
      if ((i + Math.floor(frame / 20)) % 11 < 9) ctx.fillRect(x, y, 1, 1);
    }
  } else if (kind === "sand" || kind === "desert" || kind === "rust") {
    // Dunes silhouette
    ctx.fillStyle = pal.B;
    for (let x = 0; x < SCENE_W; x++) {
      const h = Math.floor(Math.sin(x * 0.05) * 6 + Math.sin(x * 0.12) * 3);
      ctx.fillRect(x, 88 - h, 1, h + 1);
    }
  } else if (kind === "void" || kind === "rift" || kind === "shard" || kind === "loop") {
    // Swirling particles
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2 + frame * 0.01;
      const r = 20 + (i % 5) * 8;
      const x = SCENE_W / 2 + Math.cos(a) * r;
      const y = 48 + Math.sin(a) * r * 0.5;
      ctx.fillStyle = i % 2 ? pal.A : pal.E;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
  }
  ctx.restore();
}

function drawPortal(ctx: CanvasRenderingContext2D, era: string, frame: number) {
  const pal = getEraPalette(era);
  const cx = SCENE_W / 2, cy = 80;
  for (let r = 22; r > 10; r -= 2) {
    ctx.strokeStyle = r % 4 ? pal.A : pal.E;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.5, (frame / 30 + r) % (Math.PI * 2), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = pal.B;
  ctx.beginPath(); ctx.ellipse(cx, cy, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
}

function drawBoardGlow(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, color: string) {
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + frame * 0.1;
    const px = x + MACH_W / 2 + Math.cos(a) * 18;
    const py = y + MACH_H / 2 + Math.sin(a) * 8;
    ctx.fillRect(Math.round(px), Math.round(py), 1, 1);
  }
}
function drawContrail(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, color: string) {
  ctx.fillStyle = color;
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(x + MACH_W / 2 - 1 + (i % 2), y + MACH_H + i + (frame % 3), 2, 1);
  }
}

function drawRibbon(ctx: CanvasRenderingContext2D, label: string, pal: { A: string; B: string; E: string }) {
  ctx.fillStyle = pal.B; ctx.fillRect(6, 6, label.length * 6 + 12, 14);
  ctx.fillStyle = pal.A; ctx.fillRect(6, 6, label.length * 6 + 12, 1);
  ctx.fillStyle = pal.A; ctx.fillRect(6, 19, label.length * 6 + 12, 1);
  ctx.fillStyle = pal.E;
  ctx.font = "8px monospace";
  ctx.textBaseline = "top";
  ctx.fillText(label.toUpperCase(), 12, 9);
}
