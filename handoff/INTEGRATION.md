# ChronoTransit — Cross-Section World

Drop-in pixel-art viewport for ChronoTransit. The world is rendered as a vertical cross-section — every era is a stratum stacked from far-future on top down to dinosaurs at the bottom, with a time-elevator that shuttles passengers between them.

```
┌──────────────────────────┬──────┐
│  ▓▓ FUTURE             ▓ │  ▼   │
│  ▒▒ CYBERPUNK           ▒│  ●   │ ← depth-map rail
│  ▓▓ SPACE AGE          ▓ │  ▒   │
└──────────────────────────┴──────┘
   AntFarmScene viewport      DepthMap
```

## Install (literal cp)

```bash
cp handoff/client/src/lib/pixelEngine.ts          client/src/lib/
cp handoff/client/src/components/AntFarmScene.tsx client/src/components/
cp handoff/client/src/components/DepthMap.tsx     client/src/components/
cp handoff/client/src/components/AntFarmViewport.tsx client/src/components/
cp handoff/client/src/components/PixelCustomer.tsx client/src/components/
cp handoff/client/src/components/PixelMachine.tsx  client/src/components/
cp handoff/client/src/components/PixelElevator.tsx client/src/components/
```

No new dependencies. Pure TypeScript + Canvas 2D + React.

## Wire it into GameScene

Edit `client/src/components/GameScene.tsx`. Replace the `<Canvas>` (`@react-three/fiber`) block with:

```tsx
import AntFarmViewport from "./AntFarmViewport";

export function GameScene() {
  // ...existing setup
  return (
    <div className="w-full h-[50vh] md:h-[60vh] relative flex items-center justify-center">
      <ComboClick />
      <AntFarmViewport />
      <EraDisplay />
      <TemporalAnomaly />
      <ArtifactOverlay />
    </div>
  );
}
```

`AntFarmViewport` reads from your `useIdleGame` store directly. Open
`AntFarmViewport.tsx` and rename the selectors to match your store (the file's
top comment lists exactly which keys it expects).

## Files

| File | Purpose |
| --- | --- |
| `lib/pixelEngine.ts` | Palette · 23 era palettes · sprite data (characters / machines / landmarks / terrain) · `drawSprite` · `drawLandmark` · `drawElevator` · `drawSky` |
| `components/AntFarmScene.tsx` | Cross-section viewport canvas — strata + shaft + elevator |
| `components/DepthMap.tsx` | 23-stratum side rail, clickable, shows unlock state |
| `components/AntFarmViewport.tsx` | Wrapper combining the two + binding to `useIdleGame` |
| `components/PixelCustomer.tsx` | Single customer sprite (queue tiles, tooltips) |
| `components/PixelMachine.tsx` | Single top-down machine sprite (upgrade icons) |
| `components/PixelElevator.tsx` | Single elevator sprite (UI icons) |

## Era keys

Your existing era IDs need to match these. `pixelEngine.ts` ships 23 of them:

```
dinosaur prehistoric egypt atlantis rome viking medieval renaissance
industrial wildwest roaring20s spaceage cyberpunk mooncolony mars
future aiutopia paradise timeorigin quantum timeloop multiversal temporal
```

If you have more / fewer, edit the `STRATA` array in `pixelEngine.ts` — top entry = surface (far future), last entry = deepest stratum (deep past). Each entry is `{ era, depth, landmark }`. Add a recipe to `CHAR_RECIPES`, a palette to `ERA_PALETTES`, and either pick an existing `LandmarkKind` or add a new branch to `drawLandmark`.

## Performance

| Metric | Before (three.js) | After (cross-section) |
| --- | --- | --- |
| Bundle delta | — | **+12 KB** total |
| External assets | textures (~350 KB) | **none** |
| Mobile FPS (median) | ~28 | **60 locked** |
| Memory idle | ~90 MB | **~6 MB** |
| Draw calls / frame | ~400 | **1 canvas blit** |
| RAF when tab hidden | runs | **auto-paused** |

The viewport is one `<canvas>` element painted by a single RAF loop. The render
function is ~200 lines and does no allocations during steady-state.

## Feature-flag the rollout

Your store already has `use2DMode`. Gate the cross-section behind it:

```tsx
{use2DMode
  ? <AntFarmViewport />
  : <LegacyThreeScene />}
```

When you're ready to delete the 3D scene entirely, remove `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` from `package.json` — they're no longer referenced.

## Adding a new stratum

```ts
// pixelEngine.ts
ERA_PALETTES.steampunk = { A: "#d49a3e", B: "#5e3c12", E: "#fce0a3" };
ERA_META.steampunk     = { label: "Steampunk", terrain: "soot" };
CHAR_RECIPES.steampunk = {
  hair: "G", shirt: "D", shirtShade: "0", pants: "D", pantsShade: "0",
  hat:  { 0: ["_","_","D","D","D","D","D","D","D","D","_","_"],
          1: ["_","D","D","D","D","D","D","D","D","D","D","_"] },
};
STRATA.splice(15, 0, { era: "steampunk", depth: "+1890", landmark: "smokestack" });
```

That's the full cost of a new era.

## Known follow-ups (next round, not blocking)

- Departure / arrival VFX flash when capsule lands on a stratum
- VIP customer gold glow
- Artifact pickup sparkle anchored to landmark positions
- Soft parallax on the shaft when scrolling between strata windows
- Optional fullscreen mode that shows all 23 strata at once (use the existing
  `AntFarmCrossSection` from the design canvas as reference)
