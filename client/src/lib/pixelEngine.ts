/**
 * pixelEngine.ts
 * -----------------------------------------------------------------------------
 * Procedural pixel-art engine for ChronoTransit.
 *
 * Everything is data — sprites are 2D arrays of palette keys, generated once
 * at module load. Rendering is pure Canvas 2D. No images. No WebGL. No three.js.
 *
 * Public API:
 *   PALETTE, ERA_PALETTES, ERA_META
 *   CHARACTERS[era][frame]  — 3 frames each (idle, walkL, walkR)
 *   MACHINES[`tier${1..5}`][frame] — 2 frames each (bob)
 *   TERRAIN[era] — one 32x32 tile
 *   drawSprite(ctx, sprite, x, y, paletteOverride)
 *   getEraPalette(era)
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

export const CHAR_W = 12, CHAR_H = 20;
export const MACH_W = 24, MACH_H = 24;
export const TILE = 32;

export type Sprite = (string | undefined)[][];

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
  const P: Record<string, string> = { ...PALETTE, ...(paletteOverride as Record<string, string>) };
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
  skin?: string;
  skinShade?: string;
  shirt?: string;
  shirtShade?: string;
  pants?: string;
  pantsShade?: string;
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
    short: [
      [,,,,hair,hair,hair,hair],
      [,,,hair,hair,hair,hair,hair,hair],
      [,,,hair,skin,skin,skin,skin,hair],
    ],
    long: [
      [,,,hair,hair,hair,hair,hair,hair],
      [,,hair,hair,hair,hair,hair,hair,hair,hair],
      [,,hair,hair,skin,skin,skin,skin,hair,hair],
    ],
    bald: [
      [,,,,skin,skin,skin,skin],
      [,,,skin,skin,skin,skin,skin,skin],
      [,,,skin,skin,skin,skin,skin,skin],
    ],
    helmet: [
      [,,,hair,hair,hair,hair,hair,hair],
      [,,hair,hair,hair,hair,hair,hair,hair,hair],
      [,,hair,hair,hair,hair,hair,hair,hair,hair],
    ],
    cap: [
      [,,,hair,hair,hair,hair,hair,hair,hair,hair],
      [,,,hair,hair,hair,hair,hair,hair,hair,hair],
      [,,,skin,skin,skin,skin,skin,skin],
    ],
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
  dinosaur:    { hair: "F", hairStyle: "long",   skin: "s", skinShade: "S", shirt: "A", shirtShade: "B", pants: "D", pantsShade: "0" },
  egypt:       { hair: "0", hairStyle: "long",   shirt: "E", shirtShade: "A", pants: "E", pantsShade: "A",
                 hat: { 0: ["_","_","_","g","g","g","g","g","g","_","_","_"], 1: ["_","_","g","g","A","A","A","A","g","g","_","_"], 2: ["_","_","g","g","g","g","g","g","g","g","_","_"] } },
  rome:        { hair: "G", skin: "s", shirt: "6", shirtShade: "5", pants: "A", pantsShade: "B" },
  medieval:    { hair: "1", hairStyle: "helmet", shirt: "m", shirtShade: "M", pants: "M", pantsShade: "0",
                 hat: { 0: ["_","_","m","m","m","m","m","m","m","m","_","_"], 1: ["_","m","m","m","m","m","m","m","m","m","m","_"], 2: ["_","m","m","m","s","s","s","s","m","m","m","_"] } },
  viking:      { hair: "F", hairStyle: "long",   shirt: "D", shirtShade: "0", pants: "D", pantsShade: "0",
                 hat: { 0: ["_","_","_","m","m","_","_","m","m","_","_","_"], 1: ["_","_","m","m","m","m","m","m","m","m","_","_"] } },
  renaissance: { hair: "G", hairStyle: "cap",    shirt: "p", shirtShade: "1", pants: "A", pantsShade: "B" },
  industrial:  { hair: "2", hairStyle: "cap",    shirt: "M", shirtShade: "0", pants: "M", pantsShade: "0" },
  wildwest:    { hair: "D", skin: "S", skinShade: "d", shirt: "A", shirtShade: "B", pants: "D", pantsShade: "0",
                 hat: { 0: ["_","_","D","D","D","D","D","D","D","D","_","_"], 1: ["_","D","D","D","D","D","D","D","D","D","D","_"], 2: ["_","_","_","D","D","D","D","D","D","_","_","_"] } },
  roaring20s:  { hair: "0", shirt: "0", shirtShade: "1", pants: "0", pantsShade: "1",
                 hat: { 0: ["_","_","0","0","0","0","0","0","0","0","_","_"], 1: ["_","0","0","0","0","A","0","0","0","0","0","_"], 2: ["_","_","_","0","0","0","0","0","0","_","_","_"] } },
  spaceage:    { hair: "6", hairStyle: "helmet", shirt: "6", shirtShade: "4", pants: "6", pantsShade: "4",
                 hat: { 0: ["_","_","6","6","6","6","6","6","6","6","_","_"], 1: ["_","6","6","6","6","6","6","6","6","6","6","_"], 2: ["_","6","6","A","A","A","A","A","A","6","6","_"] } },
  future:      { hair: "A", shirt: "7", shirtShade: "A", pants: "M", pantsShade: "0" },
  cyberpunk:   { hair: "A", hairStyle: "long",   shirt: "0", shirtShade: "A", pants: "0", pantsShade: "A",
                 hat: { 0: ["_","_","_","A","A","A","A","A","A","A","A","_"], 1: ["_","_","A","A","A","A","A","A","A","A","A","_"] } },
  atlantis:    { hair: "A", hairStyle: "long",   skin: "E", skinShade: "A", shirt: "B", shirtShade: "0", pants: "B", pantsShade: "0" },
  prehistoric: { hair: "0", hairStyle: "long",   skin: "S", skinShade: "d", shirt: "D", shirtShade: "0", pants: "D", pantsShade: "0" },
  mooncolony:  { hair: "6", hairStyle: "helmet", shirt: "5", shirtShade: "3", pants: "5", pantsShade: "3",
                 hat: { 0: ["_","_","5","5","5","5","5","5","5","5","_","_"], 1: ["_","5","5","5","5","5","5","5","5","5","5","_"], 2: ["_","5","5","0","0","0","0","0","0","5","5","_"] } },
  aiutopia:    { hair: "A", hairStyle: "bald",   skin: "6", skinShade: "5", shirt: "7", shirtShade: "A", pants: "7", pantsShade: "A" },
  mars:        { hair: "F", hairStyle: "helmet", shirt: "F", shirtShade: "B", pants: "F", pantsShade: "B",
                 hat: { 0: ["_","_","F","F","F","F","F","F","F","F","_","_"], 1: ["_","F","F","F","F","F","F","F","F","F","F","_"], 2: ["_","F","F","E","E","E","E","E","E","F","F","_"] } },
  timeorigin:  { hair: "E", hairStyle: "long",   skin: "7", skinShade: "A", shirt: "A", shirtShade: "B", pants: "A", pantsShade: "B" },
  quantum:     { hair: "E", skin: "A", skinShade: "B", shirt: "0", shirtShade: "A", pants: "0", pantsShade: "A" },
  paradise:    { hair: "G", hairStyle: "long",   shirt: "A", shirtShade: "B", pants: "g", pantsShade: "G" },
  timeloop:    { hair: "A", shirt: "E", shirtShade: "A", pants: "A", pantsShade: "B" },
  multiversal: { hair: "A", hairStyle: "long",   shirt: "p", shirtShade: "A", pants: "A", pantsShade: "B" },
  temporal:    { hair: "r", hairStyle: "long",   shirt: "0", shirtShade: "r", pants: "0", pantsShade: "r" },
};

export const CHARACTERS: Record<string, Sprite[]> = {};
for (const [era, recipe] of Object.entries(CHAR_RECIPES)) {
  CHARACTERS[era] = [0, 1, 2].map(f => buildChar({ ...recipe, frame: f as 0 | 1 | 2 }));
}

// ── Machine builder ────────────────────────────────────────────────────────
function buildMachine(tier: number, frame: number): Sprite {
  const g: Sprite = Array.from({ length: MACH_H }, () => Array(MACH_W).fill("_"));
  for (let c = 4; c < 20; c++) {
    const dx = c - 11.5;
    if (Math.abs(dx) < 8 - (dx * dx) * 0.05) g[21][c] = "1";
  }
  for (let c = 6; c < 18; c++) g[22][c] = "0";
  for (let r = 14; r <= 18; r++)
    for (let c = 5; c <= 18; c++) g[r][c] = "2";
  for (let c = 6; c <= 17; c++) { g[13][c] = "1"; g[19][c] = "1"; }
  for (let r = 14; r <= 18; r++) { g[r][4] = "1"; g[r][19] = "1"; }
  for (let c = 7; c <= 14; c++) g[14][c] = "4";
  const coreY = 10 + (frame ? -1 : 0);
  drawCore(g, 11, coreY, frame);
  if (tier >= 2) drawRing(g, 11, coreY + 1, 7, 2);
  if (tier >= 3) drawChevronRing(g, 11, coreY, 9, frame);
  if (tier >= 4) drawCrown(g, 11, coreY, frame);
  if (tier >= 5) drawOrbs(g, coreY, frame);
  return g;
}
function drawCore(g: Sprite, cx: number, cy: number, frame: number) {
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
    if (y >= 0 && y < MACH_H && x >= 0 && x < MACH_W)
      g[y][x] = (a > 170 && a < 350) ? "B" : "A";
  }
}
function drawChevronRing(g: Sprite, cx: number, cy: number, r: number, frame: number) {
  const phase = frame * 30;
  for (let a = 0; a < 360; a += 15) {
    const rad = ((a + phase) * Math.PI) / 180;
    const x = Math.round(cx + Math.cos(rad) * r);
    const y = Math.round(cy + Math.sin(rad) * r * 0.4);
    if (y >= 0 && y < MACH_H && x >= 0 && x < MACH_W)
      g[y][x] = (a % 30 === 0) ? "A" : "B";
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
  const orbs: [number, number][] = [
    [4 + orbT, cy + 2], [19 - orbT, cy + 2], [11, cy - 5 + orbT],
  ];
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
    case "sand":   paint("A", "B", "E", 0.08);
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
    case "snow":   paint("7", "5", "7", 0.04); break;
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
