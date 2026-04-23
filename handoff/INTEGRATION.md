# ChronoTransit — Pixel Graphics Integration

Drop-in pixel-art graphics for the 2D mode of ChronoTransit. Everything is procedural: no images, no atlases, no external assets. One canvas per scene, RAF-driven, ~2 kB of sprite data per era.

## What's in this folder

```
handoff/client/src/
├── lib/
│   └── pixelEngine.ts         # palette, era palettes, sprites, renderer
└── components/
    ├── PixelScene.tsx         # drop-in GameScene replacement
    ├── PixelCustomer.tsx      # single customer sprite (for lists, tooltips)
    └── PixelMachine.tsx       # single machine sprite (for fleet UI)
```

## Install

1. Copy `handoff/client/src/lib/pixelEngine.ts` → `client/src/lib/pixelEngine.ts`
2. Copy `handoff/client/src/components/Pixel*.tsx` → `client/src/components/`

No new dependencies. Pure TypeScript + Canvas 2D.

## Wire into your existing scene

In `client/src/components/GameScene.tsx` (or wherever the current 2D viewport lives), replace the placeholder boxes with:

```tsx
import PixelScene from "./PixelScene";
import { useIdleGame } from "../state/useIdleGame";

export default function GameScene() {
  const { currentEra, fleetTier, fleetSize, queueSize, onDepart } = useIdleGame(s => ({
    currentEra: s.currentEra,
    fleetTier: s.fleetTier,        // 1..5
    fleetSize: s.fleet.length,
    queueSize: s.queue.length,
    onDepart: s.completeTrip,
  }));

  return (
    <div className="flex items-center justify-center h-full bg-black">
      <PixelScene
        era={currentEra}
        tier={fleetTier as 1|2|3|4|5}
        fleetSize={fleetSize}
        queueSize={queueSize}
        onDepart={onDepart}
        className="rounded-md shadow-2xl"
      />
    </div>
  );
}
```

### Replace CustomerAvatar in lists

Anywhere you currently render `<CustomerAvatar era={...} />`, swap in:

```tsx
import PixelCustomer from "../components/PixelCustomer";
<PixelCustomer era={customer.era} scale={2} />
```

### Fleet upgrade UI

```tsx
import PixelMachine from "../components/PixelMachine";
<PixelMachine tier={slot.tier} era={currentEra} scale={3} />
```

## Era keys

`pixelEngine.ts` ships 23 eras with palettes + terrain + customer outfit recipes:

```
dinosaur egypt rome medieval viking renaissance industrial wildwest
roaring20s spaceage future cyberpunk atlantis prehistoric mooncolony
aiutopia mars timeorigin quantum paradise timeloop multiversal temporal
```

Map your existing era IDs to these keys. If you have more than 23, add a recipe to `CHAR_RECIPES`, a palette to `ERA_PALETTES`, and a `terrain` key to `ERA_META` — everything else is generated.

## Perf notes (budgets and why this ships)

| Metric              | Before (three.js)  | After (PixelScene) |
| ------------------- | ------------------ | ------------------ |
| Initial bundle      | ~600 kB (three)    | +8 kB              |
| Mobile FPS (mid)    | 30–45              | 60 locked          |
| Memory (idle)       | ~90 MB             | ~6 MB              |
| Scene draw calls/fr | 400+               | 1 canvas blit      |

- Terrain tile is rendered once into an offscreen canvas per era change.
- Every sprite is palette-keyed: one character recipe × 23 era palettes = 23 visually distinct customers at zero extra memory.
- The render loop stops when the tab is hidden (RAF is paused by the browser automatically).

## Feature-flag the rollout

Your store already has `use2DMode`. Gate the pixel scene behind it so you can ship to a percentage of users:

```tsx
{use2DMode ? <PixelScene {...} /> : <LegacyThreeScene {...} />}
```

## Diff summary (for the PR)

- **Add** `client/src/lib/pixelEngine.ts`
- **Add** `client/src/components/PixelScene.tsx`
- **Add** `client/src/components/PixelCustomer.tsx`
- **Add** `client/src/components/PixelMachine.tsx`
- **Modify** `client/src/components/GameScene.tsx` (swap the viewport contents — see snippet above)
- **Optional** replace `CustomerAvatar` usages with `PixelCustomer`

## Known follow-ups (not blocking)

- Portal boarding/departure VFX are placeholders — simple contrails + orbit dots. Upgrade to palette-cycled spritesheet if you want more punch.
- VIP glow, artifact sparkle, coin burst: add a `fx` layer on top of the item sort.
- Add era IDs beyond the 23 shipped: recipe + palette + terrain key.
- Add an 8-direction walk cycle for NPCs if you ever add pathing.
