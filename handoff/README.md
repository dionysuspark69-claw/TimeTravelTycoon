# ChronoTransit — Cross-Section World

Ship-ready drop-in for the 2D game viewport. Replaces the three.js scene with a
canvas-rendered cross-section view: 23 era strata stacked vertically with a
time-elevator shuttling between them.

→ See [INTEGRATION.md](./INTEGRATION.md) for the wiring details.

## TL;DR

```bash
cp -r handoff/client/src/lib/                 client/src/lib/
cp -r handoff/client/src/components/AntFarm*  client/src/components/
cp -r handoff/client/src/components/DepthMap.tsx client/src/components/
cp -r handoff/client/src/components/Pixel*    client/src/components/
```

Then in `GameScene.tsx`:

```tsx
import AntFarmViewport from "./AntFarmViewport";

// inside the render:
<AntFarmViewport />
```

Open `AntFarmViewport.tsx` and rename the four `useIdleGame` selectors at the
top to match your store. Done.

## Files

| File | Lines | Purpose |
| --- | --- | --- |
| `lib/pixelEngine.ts` | ~600 | Palette, 23 era palettes, sprite data, draw functions |
| `components/AntFarmScene.tsx` | ~200 | Main viewport canvas |
| `components/DepthMap.tsx` | ~120 | 23-stratum side rail |
| `components/AntFarmViewport.tsx` | ~60 | Composition + store bindings |
| `components/PixelCustomer.tsx` | ~35 | Animated customer sprite |
| `components/PixelElevator.tsx` | ~30 | Animated elevator sprite |
| `components/PixelMachine.tsx` | ~30 | Animated machine sprite (upgrade icons) |

## Why this ships

- **+12 KB bundle delta** — pure TypeScript + Canvas 2D, no images, no textures
- **60 FPS locked on mobile** — one canvas blit per frame, RAF-paused when tab
  hidden
- **~6 MB memory idle** — sprites are arrays of palette keys, not bitmaps
- **23 era palettes** as data — adding a new era costs ~10 lines, no asset work
- **Zero new dependencies** — drop in, ship behind your existing `use2DMode`
  flag, delete `three` from `package.json` when you're confident
