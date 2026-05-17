/**
 * pixelEngine.ts
 * -----------------------------------------------------------------------------
 * Procedural pixel-art engine for ChronoTransit's cross-section world.
 *
 * Everything is data. Sprites are 2D arrays of palette keys, generated once at
 * module load. Rendering is pure Canvas 2D. No images. No WebGL. No three.js.
 *
 * Public API:
 *   PALETTE              — 24-slot shared palette
 *   ERA_PALETTES[era]    — { A, B, E } accent triplet per era (swap into PALETTE)
 *   ERA_META[era]        — { label, terrain }
 *   STRATA[]             — ordered { era, depth, landmark } list (top → bottom)
 *
 *   CHARACTERS[era][f]   — 3 frames (idle, walkL, walkR), 12×20
 *   MACHINES[`tier${1..5}`][f] — 2 frames each, 24×24 (top-down upgrade icons)
 *   TERRAIN[era]         — one 32×32 substrate tile
 *
 *   drawSprite(ctx, sprite, x, y, paletteOverride)
 *   drawLandmark(ctx, kind, x, y, pal)     — 40×28 era landmark silhouettes
 *   drawElevator(ctx, x, y, pal, frame)    — 16×28 cross-section capsule
 *   drawSky(ctx, era, x, y, w, h, frame)   — atmospheric pixel detail
 *   getEraPalette(era)
 *
 *   Sizes: CHAR_W, CHAR_H, MACH_W, MACH_H, TILE, LANDMARK_W, LANDMARK_H, ELEV_W, ELEV_H
 */

export const PALETTE: Record<string, string> = {
  _: "transparent",
  "0": "#0d0b14", "1": "#1d1b26", "2": "#33303d", "3": "#55525f",
  "4": "#8a8792", "5": "#c2bfc8", "6": "#ecebef", "7": "#ffffff",
  s: "#f4c9a0", S: "#c48a65", d: "#8b5a3c", D: "#5e3a25",
  m: "#6e7785", M: "#3b4150", g: "#d8c068", G: "#8a6e2a",
  A: "#4aa3df", B: "#1d5d8a", E: "#ffffff",
  f: "#ffcb5c", F: "#d56a2a", r: "#e64a4a", p: "#9b59b6", c: "#2ecc71",
};

export const ERA_PALETTES: Record<string, { A: string; B: string; E: string }> = {
  dinosaur:    { A: "#3c8a3c", B: "#1e4a1e", E: "#a8e063" },
  egypt:       { A: "#e8b94a", B: "#8a6014", E: "#fff2a8" },
  rome:        { A: "#b8453b", B: "#5e1f1a", E: "#f7c6a4" },
  medieval:    { A: "#7a5aa5", B: "#2f1e4a", E: "#cfb8e8" },
  viking:      { A: "#607d8b", B: "#263238", E: "#b0bec5" },
  renaissance: { A: "#c77d2e", B: "#6b3e12", E: "#f4c98a" },
  industrial:  { A: "#6a707a", B: "#2a2e36", E: "#c8c4c0" },
  wildwest:    { A: "#b46830", B: "#5a2d0f", E: "#f0c48a" },
  roaring20s:  { A: "#d9b44a", B: "#7a5e18", E: "#fff0b8" },
  spaceage:    { A: "#4aa3df", B: "#1d5d8a", E: "#b8e3ff" },
  future:      { A: "#1ab79a", B: "#0a5a4a", E: "#a0f0d8" },
  cyberpunk:   { A: "#e04a9b", B: "#6a1744", E: "#ff90d0" },
  atlantis:    { A: "#3a9bcc", B: "#145478", E: "#b0e3f0" },
  prehistoric: { A: "#8a6a4a", B: "#4a3020", E: "#d4b890" },
  mooncolony:  { A: "#9aa4b0", B: "#3a4048", E: "#e0e4ec" },
  aiutopia:    { A: "#1ab0c4", B: "#0a5068", E: "#a8e8f0" },
  mars:        { A: "#cc5a28", B: "#6a2810", E: "#f5a878" },
  timeorigin:  { A: "#8a5aff", B: "#3a1e8a", E: "#d0b8ff" },
  quantum:     { A: "#b04aff", B: "#5a1a8a", E: "#e8a8ff" },
  paradise:    { A: "#5ab870", B: "#1e5a30", E: "#b8f0c8" },
  timeloop:    { A: "#2ac4d0", B: "#0e6a74", E: "#a8f0f4" },
  multiversal: { A: "#c44ad0", B: "#6a1a74", E: "#f0a8f8" },
  temporal:    { A: "#ef5350", B: "#8a1a18", E: "#ffa8a4" },
};

export const ERA_META: Record<string, { label: string; terrain: string }> = {
  dinosaur:    { label: "Jurassic",      terrain: "jungle" },
  egypt:       { label: "Ancient Egypt", terrain: "sand" },
  rome:        { label: "Roman Empire",  terrain: "marble" },
  medieval:    { label: "Medieval",      terrain: "stone" },
  viking:      { label: "Viking Age",    terrain: "snow" },
  renaissance: { label: "Renaissance",   terrain: "cobble" },
  industrial:  { label: "Industrial",    terrain: "soot" },
  wildwest:    { label: "Wild West",     terrain: "desert" },
  roaring20s:  { label: "Roaring 20s",   terrain: "parquet" },
  spaceage:    { label: "Space Age",     terrain: "steel" },
  future:      { label: "Future",        terrain: "circuit" },
  cyberpunk:   { label: "Cyberpunk",     terrain: "neon" },
  atlantis:    { label: "Atlantis",      terrain: "coral" },
  prehistoric: { label: "Prehistoric",   terrain: "mud" },
  mooncolony:  { label: "Moon Colony",   terrain: "regolith" },
  aiutopia:    { label: "AI Utopia",     terrain: "hex" },
  mars:        { label: "Mars Colony",   terrain: "rust" },
  timeorigin:  { label: "Time Origin",   terrain: "void" },
  quantum:     { label: "Quantum",       terrain: "lattice" },
  paradise:    { label: "Paradise",      terrain: "grass" },
  timeloop:    { label: "Time Loop",     terrain: "loop" },
  multiversal: { label: "Multiverse",    terrain: "shard" },
  temporal:    { label: "Temporal Rift", terrain: "rift" },
};

// Top → bottom strata order (top = future, bottom = deep past). Map your
// existing era IDs to these keys; the order here is the column order.
export const STRATA: { era: string; depth: string; landmark: LandmarkKind }[] = [
  { era: "temporal",    depth: "+∞",       landmark: "rift" },
  { era: "multiversal", depth: "+9999",    landmark: "shard" },
  { era: "timeloop",    depth: "+5555",    landmark: "loop" },
  { era: "quantum",     depth: "+4040",    landmark: "lattice" },
  { era: "timeorigin",  depth: "+3333",    landmark: "portal" },
  { era: "paradise",    depth: "+3050",    landmark: "palms" },
  { era: "aiutopia",    depth: "+3030",    landmark: "spire" },
  { era: "future",      depth: "+3025",    landmark: "monorail" },
  { era: "mars",        depth: "+2100",    landmark: "marsdome" },
  { era: "mooncolony",  depth: "+2080",    landmark: "moondome" },
  { era: "cyberpunk",   depth: "+2089",    landmark: "tower" },
  { era: "spaceage",    depth: "+1969",    landmark: "rocket" },
  { era: "roaring20s",  depth: "+1925",    landmark: "deco" },
  { era: "wildwest",    depth: "+1875",    landmark: "saloon" },
  { era: "industrial",  depth: "+1860",    landmark: "smokestack" },
  { era: "renaissance", depth: "+1500",    landmark: "dome" },
  { era: "medieval",    depth: "+1200",    landmark: "castle" },
  { era: "viking",      depth: "+0950",    landmark: "longboat" },
  { era: "rome",        depth: "+0100",    landmark: "columns" },
  { era: "atlantis",    depth: "−1000",    landmark: "atlantis" },
  { era: "egypt",       depth: "−2500",    landmark: "pyramid" },
  { era: "prehistoric", depth: "−10K",     landmark: "cave" },
  { era: "dinosaur",    depth: "−150M",    landmark: "trex" },
];

export const CHAR_W = 12, CHAR_H = 20;
export const MACH_W = 24, MACH_H = 24;
export const TILE = 32;
export const LANDMARK_W = 40, LANDMARK_H = 28;
export const ELEV_W = 16, ELEV_H = 28;

export type Sprite = (string | undefined)[][];
export type LandmarkKind =
  | "trex" | "cave" | "pyramid" | "atlantis" | "columns" | "longboat"
  | "castle" | "dome" | "smokestack" | "saloon" | "deco" | "rocket"
  | "tower" | "moondome" | "marsdome" | "monorail" | "spire" | "palms"
  | "portal" | "lattice" | "loop" | "shard" | "rift";

export function getEraPalette(era: string) {
  return ERA_PALETTES[era] || ERA_PALETTES.spaceage;
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  ox: number,
  oy: number,
  paletteOverride: Partial<typeof PALETTE> = {}
) {
  const P: Record<string, string> = { ...PALETTE, ...paletteOverride };
  for (let r = 0; r < sprite.length; r++) {
    const row = sprite[r];
    for (let c = 0; c < row.length; c++) {
      const k = row[c];
      if (!k || k === "_") continue;
      const col = P[k];
      if (!col || col === "transparent") continue;
      ctx.fillStyle = col;
      ctx.fillRect(ox + c, oy + r, 1, 1);
    }
  }
}

// ── Character builder ──────────────────────────────────────────────────────
interface CharRecipe {
  hair?: string;
  hairStyle?: "short" | "long" | "bald" | "helmet" | "cap";
  skin?: string; skinShade?: string;
  shirt?: string; shirtShade?: string;
  pants?: string; pantsShade?: string;
  hat?: Record<number, string[]>;
  frame?: 0 | 1 | 2;
}
function buildChar(r: CharRecipe): Sprite {
  const {
    hair = "1", hairStyle = "short", skin = "s", skinShade = "S",
    shirt = "A", shirtShade = "B", pants = "M", pantsShade = "1",
    hat = null, frame = 0,
  } = r;
  const g: Sprite = Array.from({ length: CHAR_H }, () => Array(CHAR_W).fill("_"));
  const hairRows: Record<string, (string | undefined)[][]> = {
    short:  [[,,,,hair,hair,hair,hair], [,,,hair,hair,hair,hair,hair,hair], [,,,hair,skin,skin,skin,skin,hair]],
    long:   [[,,,hair,hair,hair,hair,hair,hair], [,,hair,hair,hair,hair,hair,hair,hair,hair], [,,hair,hair,skin,skin,skin,skin,hair,hair]],
    bald:   [[,,,,skin,skin,skin,skin], [,,,skin,skin,skin,skin,skin,skin], [,,,skin,skin,skin,skin,skin,skin]],
    helmet: [[,,,hair,hair,hair,hair,hair,hair], [,,hair,hair,hair,hair,hair,hair,hair,hair], [,,hair,hair,hair,hair,hair,hair,hair,hair]],
    cap:    [[,,,hair,hair,hair,hair,hair,hair,hair,hair], [,,,hair,hair,hair,hair,hair,hair,hair,hair], [,,,skin,skin,skin,skin,skin,skin]],
  };
  const topRows = hairRows[hairStyle] || hairRows.short;
  for (let rr = 0; rr < 3; rr++)
    for (let c = 0; c < CHAR_W; c++) {
      const v = topRows[rr][c];
      if (v !== undefined) g[rr + 1][c] = v;
    }
  g[4] = ["_","_","_",skinShade, skin, skin, skin, skin, skinShade,"_","_","_"];
  g[5] = ["_","_","_",skinShade, "0", skin, skin, "0", skinShade,"_","_","_"];
  g[6] = ["_","_","_","_", skinShade, skin, skin, skinShade,"_","_","_","_"];
  for (let rr = 7; rr <= 12; rr++) {
    g[rr][1] = shirtShade; g[rr][10] = shirtShade;
    for (let c = 2; c <= 9; c++) g[rr][c] = shirt;
  }
  g[7][1] = "_"; g[7][10] = "_"; g[7][2] = shirtShade; g[7][9] = shirtShade;
  g[13] = ["_","_", shirtShade, shirt, shirt, shirt, shirt, shirt, shirt, shirtShade,"_","_"];
  g[14] = ["_","_","_", shirtShade, shirt, shirt, shirt, shirt, shirtShade,"_","_","_"];
  const lArmOff = frame === 1 ? -1 : frame === 2 ? 1 : 0;
  const rArmOff = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  for (let rr = 8; rr <= 12; rr++) {
    const lr = rr + lArmOff, rr2 = rr + rArmOff;
    if (lr >= 0 && lr < CHAR_H) { g[lr][0] = shirtShade; g[lr][1] = shirt; }
    if (rr2 >= 0 && rr2 < CHAR_H) { g[rr2][10] = shirt; g[rr2][11] = shirtShade; }
  }
  for (let rr = 15; rr <= 18; rr++) {
    g[rr][3] = pantsShade; g[rr][8] = pantsShade; g[rr][6] = pantsShade;
    g[rr][4] = pants; g[rr][5] = pants; g[rr][7] = pants;
  }
  g[19] = ["_","_","_","_", "0", "0", "_", "0", "0","_","_","_"];
  const lLegLift = frame === 1 ? 1 : 0;
  const rLegLift = frame === 2 ? 1 : 0;
  if (lLegLift) { g[18][4] = "_"; g[18][5] = "_"; g[19][4] = "_"; g[19][5] = "_"; g[17][4] = "0"; g[17][5] = "0"; }
  if (rLegLift) { g[18][7] = "_"; g[18][8] = "_"; g[19][7] = "_"; g[19][8] = "_"; g[17][7] = "0"; g[17][8] = "0"; }
  if (hat) {
    for (const [rk, row] of Object.entries(hat)) {
      const ri = parseInt(rk);
      for (let c = 0; c < row.length; c++) {
        if (row[c] && row[c] !== "_") g[ri][c] = row[c];
      }
    }
  }
  return g;
}
const CHAR_RECIPES: Record<string, CharRecipe> = {
  dinosaur:    { hair: "F", hairStyle: "long", shirt: "A", shirtShade: "B", pants: "D", pantsShade: "0" },
  egypt:       { hair: "0", hairStyle: "long", shirt: "E", shirtShade: "A", pants: "E", pantsShade: "A",
                 hat: { 0: ["_","_","_","g","g","g","g","g","g","_","_","_"], 1: ["_","_","g","g","A","A","A","A","g","g","_","_"], 2: ["_","_","g","g","g","g","g","g","g","g","_","_"] } },
  rome:        { hair: "G", shirt: "6", shirtShade: "5", pants: "A", pantsShade: "B" },
  medieval:    { hair: "1", hairStyle: "helmet", shirt: "m", shirtShade: "M", pants: "M", pantsShade: "0",
                 hat: { 0: ["_","_","m","m","m","m","m","m","m","m","_","_"], 1: ["_","m","m","m","m","m","m","m","m","m","m","_"], 2: ["_","m","m","m","s","s","s","s","m","m","m","_"] } },
  viking:      { hair: "F", hairStyle: "long", shirt: "D", shirtShade: "0", pants: "D", pantsShade: "0",
                 hat: { 0: ["_","_","_","m","m","_","_","m","m","_","_","_"], 1: ["_","_","m","m","m","m","m","m","m","m","_","_"] } },
  renaissance: { hair: "G", hairStyle: "cap", shirt: "p", shirtShade: "1", pants: "A", pantsShade: "B" },
  industrial:  { hair: "2", hairStyle: "cap", shirt: "M", shirtShade: "0", pants: "M", pantsShade: "0" },
  wildwest:    { hair: "D", skin: "S", skinShade: "d", shirt: "A", shirtShade: "B", pants: "D", pantsShade: "0",
                 hat: { 0: ["_","_","D","D","D","D","D","D","D","D","_","_"], 1: ["_","D","D","D","D","D","D","D","D","D","D","_"], 2: ["_","_","_","D","D","D","D","D","D","_","_","_"] } },
  roaring20s:  { hair: "0", shirt: "0", shirtShade: "1", pants: "0", pantsShade: "1",
                 hat: { 0: ["_","_","0","0","0","0","0","0","0","0","_","_"], 1: ["_","0","0","0","0","A","0","0","0","0","0","_"], 2: ["_","_","_","0","0","0","0","0","0","_","_","_"] } },
  spaceage:    { hair: "6", hairStyle: "helmet", shirt: "6", shirtShade: "4", pants: "6", pantsShade: "4",
                 hat: { 0: ["_","_","6","6","6","6","6","6","6","6","_","_"], 1: ["_","6","6","6","6","6","6","6","6","6","6","_"], 2: ["_","6","6","A","A","A","A","A","A","6","6","_"] } },
  future:      { hair: "A", shirt: "7", shirtShade: "A", pants: "M", pantsShade: "0" },
  cyberpunk:   { hair: "A", hairStyle: "long", shirt: "0", shirtShade: "A", pants: "0", pantsShade: "A",
                 hat: { 0: ["_","_","_","A","A","A","A","A","A","A","A","_"], 1: ["_","_","A","A","A","A","A","A","A","A","A","_"] } },
  atlantis:    { hair: "A", hairStyle: "long", skin: "E", skinShade: "A", shirt: "B", shirtShade: "0", pants: "B", pantsShade: "0" },
  prehistoric: { hair: "0", hairStyle: "long", skin: "S", skinShade: "d", shirt: "D", shirtShade: "0", pants: "D", pantsShade: "0" },
  mooncolony:  { hair: "6", hairStyle: "helmet", shirt: "5", shirtShade: "3", pants: "5", pantsShade: "3",
                 hat: { 0: ["_","_","5","5","5","5","5","5","5","5","_","_"], 1: ["_","5","5","5","5","5","5","5","5","5","5","_"], 2: ["_","5","5","0","0","0","0","0","0","5","5","_"] } },
  aiutopia:    { hair: "A", hairStyle: "bald", skin: "6", skinShade: "5", shirt: "7", shirtShade: "A", pants: "7", pantsShade: "A" },
  mars:        { hair: "F", hairStyle: "helmet", shirt: "F", shirtShade: "B", pants: "F", pantsShade: "B",
                 hat: { 0: ["_","_","F","F","F","F","F","F","F","F","_","_"], 1: ["_","F","F","F","F","F","F","F","F","F","F","_"], 2: ["_","F","F","E","E","E","E","E","E","F","F","_"] } },
  timeorigin:  { hair: "E", hairStyle: "long", skin: "7", skinShade: "A", shirt: "A", shirtShade: "B", pants: "A", pantsShade: "B" },
  quantum:     { hair: "E", skin: "A", skinShade: "B", shirt: "0", shirtShade: "A", pants: "0", pantsShade: "A" },
  paradise:    { hair: "G", hairStyle: "long", shirt: "A", shirtShade: "B", pants: "g", pantsShade: "G" },
  timeloop:    { hair: "A", shirt: "E", shirtShade: "A", pants: "A", pantsShade: "B" },
  multiversal: { hair: "A", hairStyle: "long", shirt: "p", shirtShade: "A", pants: "A", pantsShade: "B" },
  temporal:    { hair: "r", hairStyle: "long", shirt: "0", shirtShade: "r", pants: "0", pantsShade: "r" },
};
export const CHARACTERS: Record<string, Sprite[]> = {};
for (const [era, recipe] of Object.entries(CHAR_RECIPES)) {
  CHARACTERS[era] = [0, 1, 2].map(f => buildChar({ ...recipe, frame: f as 0 | 1 | 2 }));
}

// ── Machine builder (still used by upgrade UI / icons) ─────────────────────
function buildMachine(tier: number, frame: number): Sprite {
  const g: Sprite = Array.from({ length: MACH_H }, () => Array(MACH_W).fill("_"));
  for (let c = 4; c < 20; c++) {
    const dx = c - 11.5;
    if (Math.abs(dx) < 8 - (dx * dx) * 0.05) g[21][c] = "1";
  }
  for (let c = 6; c < 18; c++) g[22][c] = "0";
  for (let r = 14; r <= 18; r++) for (let c = 5; c <= 18; c++) g[r][c] = "2";
  for (let c = 6; c <= 17; c++) { g[13][c] = "1"; g[19][c] = "1"; }
  for (let r = 14; r <= 18; r++) { g[r][4] = "1"; g[r][19] = "1"; }
  for (let c = 7; c <= 14; c++) g[14][c] = "4";
  const coreY = 10 + (frame ? -1 : 0);
  drawCoreSprite(g, 11, coreY, frame);
  if (tier >= 2) drawRing(g, 11, coreY + 1, 7, 2);
  if (tier >= 3) drawChevronRing(g, 11, coreY, 9, frame);
  if (tier >= 4) drawCrown(g, 11, coreY, frame);
  if (tier >= 5) drawOrbs(g, coreY, frame);
  return g;
}
function drawCoreSprite(g: Sprite, cx: number, cy: number, frame: number) {
  const bright = frame === 0 ? "E" : "7";
  g[cy - 2][cx] = "A";
  g[cy - 1][cx - 1] = "A"; g[cy - 1][cx] = bright; g[cy - 1][cx + 1] = "A";
  g[cy][cx - 2] = "A"; g[cy][cx - 1] = bright; g[cy][cx] = "7"; g[cy][cx + 1] = bright; g[cy][cx + 2] = "A";
  g[cy + 1][cx - 1] = "A"; g[cy + 1][cx] = bright; g[cy + 1][cx + 1] = "A";
  g[cy + 2][cx] = "A";
}
function drawRing(g: Sprite, cx: number, cy: number, rw: number, rh: number) {
  for (let a = 0; a < 360; a += 6) {
    const rad = (a * Math.PI) / 180;
    const x = Math.round(cx + Math.cos(rad) * rw);
    const y = Math.round(cy + Math.sin(rad) * rh);
    if (y >= 0 && y < MACH_H && x >= 0 && x < MACH_W) g[y][x] = (a > 170 && a < 350) ? "B" : "A";
  }
}
function drawChevronRing(g: Sprite, cx: number, cy: number, r: number, frame: number) {
  const phase = frame * 30;
  for (let a = 0; a < 360; a += 15) {
    const rad = ((a + phase) * Math.PI) / 180;
    const x = Math.round(cx + Math.cos(rad) * r);
    const y = Math.round(cy + Math.sin(rad) * r * 0.4);
    if (y >= 0 && y < MACH_H && x >= 0 && x < MACH_W) g[y][x] = (a % 30 === 0) ? "A" : "B";
  }
}
function drawCrown(g: Sprite, cx: number, cy: number, frame: number) {
  const lift = frame === 0 ? 0 : 1;
  const spikes: [number, number][] = [
    [cx - 5, cy - 3 - lift], [cx - 3, cy - 5 - lift], [cx, cy - 6 - lift],
    [cx + 3, cy - 5 - lift], [cx + 5, cy - 3 - lift],
  ];
  for (const [x, y] of spikes) {
    if (y >= 0 && g[y] && g[y][x] !== undefined) {
      g[y][x] = "E";
      if (g[y + 1] && g[y + 1][x] !== undefined) g[y + 1][x] = "A";
    }
  }
}
function drawOrbs(g: Sprite, cy: number, frame: number) {
  const orbT = frame;
  const orbs: [number, number][] = [[4 + orbT, cy + 2], [19 - orbT, cy + 2], [11, cy - 5 + orbT]];
  for (const [c, r] of orbs) {
    if (r >= 0 && r < MACH_H && c >= 0 && c < MACH_W) {
      g[r][c] = "E";
      if (g[r - 1]) g[r - 1][c] = "A";
      if (g[r + 1]) g[r + 1][c] = "A";
      g[r][c - 1] = "A"; g[r][c + 1] = "A";
    }
  }
}
export const MACHINES: Record<string, Sprite[]> = {};
for (let t = 1; t <= 5; t++) MACHINES[`tier${t}`] = [buildMachine(t, 0), buildMachine(t, 1)];

// ── Terrain ────────────────────────────────────────────────────────────────
function hash2(x: number, y: number) {
  const h = Math.sin(x * 374.31 + y * 197.73) * 43758.5453;
  return h - Math.floor(h);
}
function buildTile(kind: string): Sprite {
  const g: Sprite = Array.from({ length: TILE }, () => Array(TILE).fill("_"));
  const paint = (base: string, mid: string, hi: string, speckle = 0.06) => {
    for (let y = 0; y < TILE; y++)
      for (let x = 0; x < TILE; x++) {
        const n = hash2(x, y);
        g[y][x] = n < 0.2 ? mid : n < 0.95 ? base : hi;
        if (n < speckle) g[y][x] = mid;
      }
  };
  switch (kind) {
    case "jungle": paint("A", "B", "E", 0.15); break;
    case "sand":
      paint("A", "B", "E", 0.08);
      for (let y = 4; y < TILE; y += 8)
        for (let x = 0; x < TILE; x++) {
          const yy = Math.round(y + Math.sin(x * 0.3) * 1.5);
          if (g[yy]) g[yy][x] = "B";
        }
      break;
    case "stone": case "marble": case "cobble":
      paint("4", "3", "5");
      for (let y = 0; y < TILE; y++)
        for (let x = 0; x < TILE; x++)
          if ((y % 8 === 0) || ((y % 16 < 8 ? x : x + 8) % 16 === 0)) g[y][x] = "2";
      break;
    case "snow": paint("7", "5", "7", 0.04); break;
    case "desert": paint("A", "B", "E", 0.1); break;
    case "parquet":
      for (let y = 0; y < TILE; y++)
        for (let x = 0; x < TILE; x++) {
          const s = Math.floor(y / 4) % 2;
          g[y][x] = s ? "G" : "g";
          if ((s ? x : x + 8) % 16 === 0) g[y][x] = "2";
        }
      break;
    case "steel":
      for (let y = 0; y < TILE; y++)
        for (let x = 0; x < TILE; x++) {
          g[y][x] = ((x + y) % 2 === 0) ? "3" : "2";
          if (x % 8 === 0 || y % 8 === 0) g[y][x] = "1";
          if (x % 8 === 0 && y % 8 === 0) g[y][x] = "A";
        }
      break;
    case "circuit":
      paint("1", "0", "A", 0.02);
      for (let x = 0; x < TILE; x += 8) for (let y = 0; y < TILE; y++) g[y][x] = "A";
      for (let y = 0; y < TILE; y += 8) for (let x = 0; x < TILE; x++) g[y][x] = "A";
      break;
    case "neon":
      paint("0", "1", "A", 0.04);
      for (let y = 0; y < TILE; y += 8) for (let x = 0; x < TILE; x++) g[y][x] = "A";
      for (let x = 0; x < TILE; x += 8) for (let y = 0; y < TILE; y++) g[y][x] = "A";
      break;
    case "coral":    paint("A", "B", "E", 0.15); break;
    case "mud":      paint("S", "D", "s", 0.1);  break;
    case "regolith": paint("4", "3", "5", 0.15); break;
    case "hex":      paint("6", "5", "7", 0.02); break;
    case "rust":     paint("F", "B", "E", 0.12); break;
    case "void":
      paint("0", "1", "p", 0.02);
      for (let i = 0; i < 14; i++) {
        const x = Math.floor(hash2(i + 11, 13) * TILE);
        const y = Math.floor(hash2(13, i + 11) * TILE);
        if (g[y]) g[y][x] = "7";
      }
      break;
    case "lattice":
      paint("0", "1", "A", 0.04);
      for (let y = 0; y < TILE; y += 4) for (let x = 0; x < TILE; x += 4) g[y][x] = "A";
      break;
    case "grass": paint("c", "B", "E", 0.15); break;
    case "loop":
      paint("1", "0", "A", 0.05);
      for (let y = 0; y < TILE; y++)
        for (let x = 0; x < TILE; x++) {
          const d = Math.sqrt((x - 16) ** 2 + (y - 16) ** 2);
          if (Math.abs(d - 10) < 1 || Math.abs(d - 14) < 1) g[y][x] = "A";
        }
      break;
    case "shard": paint("p", "1", "E", 0.08); break;
    case "rift":  paint("r", "0", "f", 0.1);  break;
    case "soot":  paint("2", "0", "3", 0.05); break;
    default:      paint("3", "2", "4");
  }
  return g;
}
export const TERRAIN: Record<string, Sprite> = {};
for (const era of Object.keys(ERA_META)) TERRAIN[era] = buildTile(ERA_META[era].terrain);

// ── Landmarks ──────────────────────────────────────────────────────────────
// Each landmark is a 40×28 pixel silhouette drawn directly to ctx. Era palette
// (`pal.A`, `pal.B`, `pal.E`) plus a few global keys keep them visually rooted.
export function drawLandmark(
  ctx: CanvasRenderingContext2D,
  kind: LandmarkKind,
  x: number, y: number,
  pal: { A: string; B: string; E: string },
) {
  const rect = (cx: number, cy: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + cx, y + cy, w, h);
  };
  const set = (cx: number, cy: number, color: string) => rect(cx, cy, 1, 1, color);

  switch (kind) {
    case "trex":
      rect(2, 10, 4, 18, pal.B); rect(0, 8, 8, 4, pal.A);
      rect(2, 4, 4, 6, pal.A); rect(4, 0, 2, 4, pal.A);
      rect(20, 18, 14, 6, pal.B); rect(28, 12, 8, 8, pal.B);
      rect(34, 13, 4, 3, pal.B); set(36, 14, "#0d0b14");
      rect(19, 23, 2, 5, pal.B); rect(25, 23, 2, 5, pal.B);
      rect(13, 19, 7, 2, pal.B);
      set(36, 15, pal.E); set(38, 15, pal.E);
      return;
    case "cave":
      rect(4, 14, 30, 14, pal.B);
      for (let i = 0; i < 10; i++) {
        const cw = 8 - Math.abs(5 - i) * 0.6;
        rect(14, 18 + i, Math.round(cw * 2), 1, "#0d0b14");
      }
      rect(28, 22, 3, 3, pal.E); set(29, 21, "#d56a2a");
      return;
    case "pyramid":
      for (let r = 0; r < 22; r++) {
        const w = (22 - r) * 1.4;
        rect(Math.round(20 - w / 2), r + 6, Math.round(w), 1, r < 4 ? pal.E : pal.A);
      }
      rect(33, 2, 4, 4, "#d8c068");
      rect(2, 22, 1, 6, pal.B); rect(0, 20, 5, 2, "#2ecc71"); rect(1, 18, 3, 2, "#2ecc71");
      return;
    case "atlantis":
      // Underwater dome with antenna spire
      rect(4, 18, 32, 10, pal.B);
      for (let r = 0; r < 12; r++) {
        const w = Math.round(Math.sqrt(144 - r * r));
        rect(20 - w, 18 - r, w * 2, 1, pal.A);
      }
      rect(20, 4, 1, 4, pal.E);
      // bubbles
      rect(8, 12, 2, 2, pal.E); rect(30, 10, 2, 2, pal.E);
      for (let i = 0; i < 5; i++) rect(7 + i * 5, 22, 2, 3, pal.E);
      return;
    case "columns":
      for (let i = 0; i < 4; i++) {
        rect(4 + i * 8, 8, 4, 18, pal.E);
        rect(4 + i * 8, 7, 4, 1, pal.A);
        rect(3 + i * 8, 26, 6, 2, pal.A);
      }
      for (let r = 0; r < 6; r++) rect(2 + r, 6 - r, 36 - r * 2, 1, pal.A);
      return;
    case "longboat":
      for (let i = 0; i < 28; i++) {
        const h = 6 - Math.abs(14 - i) * 0.25;
        rect(6 + i, 22 - h, 1, h, pal.B);
      }
      rect(20, 6, 1, 16, pal.E);
      rect(14, 8, 14, 1, pal.E);
      rect(12, 9, 18, 8, pal.A);
      for (let i = 0; i < 5; i++) rect(8 + i * 5, 20, 3, 2, i % 2 ? pal.E : pal.A);
      return;
    case "castle":
      rect(2, 14, 36, 14, pal.B);
      for (let i = 0; i < 9; i++) rect(2 + i * 4, 12, 3, 2, pal.B);
      rect(16, 4, 8, 24, pal.B);
      rect(14, 4, 12, 2, pal.B);
      rect(20, 0, 1, 4, pal.E);
      rect(21, 1, 4, 3, pal.A);
      rect(18, 20, 4, 8, "#0d0b14");
      rect(19, 10, 2, 3, "#ffcb5c");
      return;
    case "dome":
      rect(4, 22, 32, 6, pal.B);
      for (let r = 0; r < 14; r++) {
        const w = Math.round(Math.sqrt(196 - r * r));
        rect(20 - w, 22 - r, w * 2, 1, pal.A);
      }
      rect(20, 4, 1, 4, pal.E);
      for (let i = 0; i < 6; i++) rect(7 + i * 5, 24, 2, 3, "#ffcb5c");
      return;
    case "smokestack":
      rect(2, 18, 36, 10, "#33303d");
      for (let i = 0; i < 7; i++) rect(4 + i * 5, 20, 3, 2, "#ffcb5c");
      rect(8, 8, 4, 12, "#33303d");
      rect(24, 4, 4, 16, "#33303d");
      rect(7, 4, 6, 4, "#55525f");
      rect(23, 0, 6, 4, "#55525f");
      rect(20, -2, 6, 4, "#8a8792");
      return;
    case "saloon":
      rect(2, 12, 36, 16, pal.B);
      rect(0, 10, 40, 2, pal.A);
      rect(10, 13, 20, 4, pal.E);
      ctx.fillStyle = "#0d0b14";
      ctx.font = "bold 5px monospace";
      ctx.textBaseline = "top";
      ctx.fillText("SALOON", x + 12, y + 13);
      rect(16, 19, 4, 9, "#0d0b14");
      rect(20, 19, 4, 9, "#0d0b14");
      rect(5, 20, 6, 4, "#ffcb5c"); rect(29, 20, 6, 4, "#ffcb5c");
      return;
    case "deco":
      rect(4, 10, 32, 18, pal.B);
      rect(10, 4, 20, 6, pal.B);
      rect(14, 0, 12, 4, pal.B);
      rect(4, 9, 32, 1, "#d8c068");
      rect(10, 3, 20, 1, "#d8c068");
      rect(14, -1, 12, 1, "#d8c068");
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 5; c++) rect(7 + c * 5, 13 + r * 3, 2, 2, "#ffcb5c");
      rect(20, -4, 1, 4, "#d8c068");
      return;
    case "rocket":
      rect(2, 24, 36, 4, "#33303d");
      rect(18, 4, 4, 20, pal.E);
      rect(19, 0, 2, 4, pal.A);
      rect(18, 2, 1, 2, pal.A); rect(21, 2, 1, 2, pal.A);
      rect(15, 20, 3, 4, pal.A); rect(22, 20, 3, 4, pal.A);
      rect(19, 24, 2, 2, "#ffcb5c"); rect(18, 26, 4, 2, "#d56a2a");
      rect(18, 10, 4, 1, pal.A); rect(18, 14, 4, 1, pal.A);
      rect(8, 8, 1, 16, "#55525f");
      rect(8, 10, 8, 1, "#55525f"); rect(8, 16, 8, 1, "#55525f");
      return;
    case "tower":
      rect(14, 0, 12, 28, pal.B);
      rect(13, 4, 1, 24, pal.A); rect(26, 4, 1, 24, pal.A);
      rect(19, -4, 2, 4, pal.E);
      for (let r = 0; r < 13; r++)
        for (let c = 0; c < 3; c++) rect(16 + c * 3, 2 + r * 2, 2, 1, (r + c) % 2 ? "#ffcb5c" : pal.E);
      rect(4, 10, 8, 18, pal.B);
      rect(28, 14, 8, 14, pal.B);
      rect(3, 12, 1, 16, pal.A); rect(36, 16, 1, 12, pal.A);
      return;
    case "moondome":
      rect(2, 24, 36, 4, pal.B);
      for (let r = 0; r < 10; r++) {
        const w = Math.round(Math.sqrt(100 - r * r));
        rect(20 - w, 24 - r, w * 2, 1, pal.A);
      }
      rect(4, 26, 2, 2, pal.E); rect(36, 26, 2, 2, pal.E);
      // stars
      rect(6, 4, 1, 1, pal.E); rect(28, 8, 1, 1, pal.E); rect(34, 2, 1, 1, pal.E);
      return;
    case "marsdome":
      rect(2, 24, 36, 4, pal.B);
      for (let r = 0; r < 12; r++) {
        const w = Math.round(Math.sqrt(144 - r * r));
        rect(20 - w, 24 - r, w * 2, 1, r % 3 === 0 ? pal.E : pal.A);
      }
      // tubes
      rect(0, 22, 4, 6, pal.A); rect(36, 22, 4, 6, pal.A);
      return;
    case "monorail":
      rect(0, 16, 40, 2, pal.A);
      rect(4, 18, 2, 10, pal.A);
      rect(30, 18, 2, 10, pal.A);
      rect(10, 10, 22, 6, pal.E);
      rect(8, 12, 2, 4, pal.A); rect(32, 12, 2, 4, pal.A);
      for (let i = 0; i < 5; i++) rect(12 + i * 4, 12, 2, 2, "#0d0b14");
      for (let i = 0; i < 6; i++) {
        const h = 4 + (i * 37) % 8;
        rect(2 + i * 6, 28 - h, 4, h, pal.B);
      }
      return;
    case "spire":
      // singular tall AI spire with halo
      rect(18, 0, 4, 28, pal.E);
      rect(17, 8, 6, 1, pal.A); rect(17, 18, 6, 1, pal.A);
      for (let r = 0; r < 4; r++) {
        const w = Math.round(8 - r);
        rect(20 - w, -1 + r, w * 2, 1, pal.A);
      }
      // halo
      for (let a = 0; a < 360; a += 12) {
        const rad = (a * Math.PI) / 180;
        set(Math.round(20 + Math.cos(rad) * 12), Math.round(4 + Math.sin(rad) * 4), pal.A);
      }
      return;
    case "palms":
      // palm trees + island
      rect(0, 22, 40, 6, pal.B);
      rect(8, 10, 1, 14, pal.B); rect(28, 12, 1, 12, pal.B);
      for (let i = 0; i < 5; i++) {
        rect(6 - i, 9 + i, 2, 1, pal.A); rect(9 + i, 9 + i, 2, 1, pal.A);
        rect(6 - i, 11 + i, 2, 1, pal.E); rect(9 + i, 11 + i, 2, 1, pal.E);
      }
      for (let i = 0; i < 4; i++) {
        rect(26 - i, 11 + i, 2, 1, pal.A); rect(29 + i, 11 + i, 2, 1, pal.A);
      }
      return;
    case "portal":
      // glowing rift portal
      for (let r = 12; r > 0; r -= 2) {
        ctx.strokeStyle = r % 4 ? pal.A : pal.E;
        ctx.beginPath();
        ctx.ellipse(x + 20, y + 14, r, r * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      rect(18, 12, 4, 4, pal.E);
      return;
    case "lattice":
      // floating cube lattice
      for (let i = 0; i < 4; i++) {
        const ox = 6 + i * 8;
        const oy = 10 + (i % 2) * 4;
        rect(ox, oy, 6, 6, pal.B);
        rect(ox, oy, 6, 1, pal.E);
        rect(ox, oy + 5, 6, 1, pal.A);
      }
      return;
    case "loop":
      // möbius track
      for (let a = 0; a < 360; a += 6) {
        const rad = (a * Math.PI) / 180;
        const cx = 20 + Math.cos(rad) * 14;
        const cy = 14 + Math.sin(rad) * 8;
        set(Math.round(cx), Math.round(cy), a < 180 ? pal.E : pal.A);
      }
      return;
    case "shard":
      // floating shards
      for (let i = 0; i < 5; i++) {
        const sx = 4 + i * 7;
        const sy = 10 + (i % 3) * 5;
        for (let j = 0; j < 4; j++) {
          rect(sx + j, sy + j, 4 - j, 1, j === 0 ? pal.E : pal.A);
        }
      }
      return;
    case "rift":
      // jagged time rift
      for (let i = 0; i < 28; i++) {
        const wx = 18 + (i % 2 ? 2 : -2) * (1 + (i % 4) / 4);
        rect(Math.round(wx), i, 4, 1, i % 2 ? pal.E : pal.A);
      }
      return;
  }
}

// ── Sky atmosphere ────────────────────────────────────────────────────────
export function drawSky(
  ctx: CanvasRenderingContext2D,
  era: string, x: number, y: number, w: number, h: number, frame: number,
) {
  const pal = getEraPalette(era);
  const kind = ERA_META[era]?.terrain;

  if (["circuit", "neon", "steel", "lattice", "regolith", "hex", "void"].includes(kind)) {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 30; i++) {
      const sx = x + (((i * 53 + (frame / 4) | 0)) % w + w) % w;
      const sy = y + (i * 17) % h;
      ctx.fillRect(sx, sy, 1, 1);
    }
  } else if (["jungle", "grass", "mud"].includes(kind)) {
    ctx.fillStyle = "#ecebef";
    for (let i = 0; i < 3; i++) {
      const cx = x + (((i * 240 + (frame / 2) | 0)) % (w + 80) + (w + 80)) % (w + 80) - 40;
      const cy = y + 12 + i * 8;
      ctx.fillRect(cx, cy, 24, 3); ctx.fillRect(cx + 4, cy - 2, 16, 2);
    }
  } else if (["sand", "desert", "rust"].includes(kind)) {
    ctx.fillStyle = pal.E; ctx.fillRect(x + w - 50, y + 8, 14, 14);
    ctx.fillStyle = pal.A; ctx.globalAlpha = 0.3;
    ctx.fillRect(x + w - 58, y + 4, 30, 22); ctx.globalAlpha = 1;
  } else if (["loop", "shard", "rift"].includes(kind)) {
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2 + frame / 60;
      const sx = x + w / 2 + Math.cos(a) * 60;
      const sy = y + h / 2 + Math.sin(a) * 12;
      ctx.fillStyle = i % 2 ? pal.A : pal.E;
      ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
    }
  } else if (kind === "snow") {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 20; i++) {
      const sx = x + (i * 37) % w;
      const sy = y + (((i * 11 + (frame / 3) | 0)) % h + h) % h;
      ctx.fillRect(sx, sy, 1, 1);
    }
  } else if (kind === "coral") {
    ctx.fillStyle = pal.E;
    for (let i = 0; i < 6; i++) {
      const bx = x + (i * 53 + frame / 5) % w;
      const by = y + 20 - (frame / 4 + i * 7) % 30;
      if (by > y) ctx.fillRect(Math.round(bx), Math.round(by), 1, 1);
    }
  }
}

// ── Elevator capsule ──────────────────────────────────────────────────────
export function drawElevator(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  pal: { A: string; B: string; E: string },
  frame: number,
) {
  const rect = (cx: number, cy: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + cx, y + cy, w, h);
  };
  // outline
  for (let r = 0; r < ELEV_H; r++) {
    const inset = r < 2 || r > ELEV_H - 3 ? 2 : 0;
    rect(2 + inset, r, ELEV_W - 4 - inset * 2, 1, pal.B);
  }
  // body
  rect(4, 2, ELEV_W - 8, ELEV_H - 4, pal.A);
  // window
  rect(5, 5, ELEV_W - 10, 8, pal.B);
  rect(5, 6, ELEV_W - 10, 6, "#0d0b14");
  // passengers inside (silhouettes)
  rect(6, 8, 1, 3, "#f4c9a0");
  rect(8, 8, 1, 3, "#f4c9a0");
  // glow strips (animated)
  const glow = frame % 2 ? pal.E : pal.A;
  rect(5, 1, ELEV_W - 10, 1, glow);
  rect(5, ELEV_H - 2, ELEV_W - 10, 1, glow);
  // base stripe
  rect(4, ELEV_H - 8, ELEV_W - 8, 1, pal.E);
}
