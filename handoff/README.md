# ChronoTransit Pixel Graphics — Handoff

Ship-ready drop-in for the 2D mode. See [INTEGRATION.md](./INTEGRATION.md).

## TL;DR

```
cp -r handoff/client/src/lib/pixelEngine.ts         client/src/lib/
cp -r handoff/client/src/components/Pixel*.tsx      client/src/components/
```

Then in `GameScene.tsx`:

```tsx
import PixelScene from "./PixelScene";
<PixelScene era={currentEra} tier={fleetTier} fleetSize={fleetSize} queueSize={queueSize} />
```

That's it. No new dependencies, no asset pipeline, no external images.

## Files

| File | Purpose |
|---|---|
| `client/src/lib/pixelEngine.ts` | Palette, 23 era palettes, sprite data for customers + machines + terrain, `drawSprite()` |
| `client/src/components/PixelScene.tsx` | Main viewport — replaces GameScene internals |
| `client/src/components/PixelCustomer.tsx` | One customer sprite (for queue list, tooltips) |
| `client/src/components/PixelMachine.tsx` | One machine sprite (for fleet/upgrade UI) |

## Perf

- Bundle: **+8 kB** vs. +600 kB for three.js
- Memory: **~6 MB** idle
- FPS: **60 locked** on mid-range mobile
- Scales: 23 eras × 1 character recipe × era palette swap = 23 distinct looks at zero extra memory
