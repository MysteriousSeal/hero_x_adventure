import { hash2 } from './noise';
import { generateTile, WORLD_SEED } from './terrain';

/** The world is cut into regions of this many tiles; each holds at most one village. */
export const REGION = 56;
const VILLAGE_CHANCE = 0.8;
const STREET_HALF = 13; // the main street spans hubCol ± this
const BOX_W = 14; // village clearing: hubCol ± this...
const BOX_UP = 6; // ...and this many rows above the street
const BOX_DOWN = 6; // ...and below it
const MAX_BRIDGE_TILES = 24; // a road needing more water than this is not built

export type BuildingKind = 'townhall' | 'tavern' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Houses picked at random. Kind 3 is left out: it has a tavern sign, and each village gets exactly one tavern. */
const HOUSE_KINDS: BuildingKind[] = [0, 1, 2, 4, 5, 6, 7];

/**
 * Sprite size in tiles, and how many of the bottom rows are solid. Only the walls block the
 * hero: he can walk on the tiles under the roof and is drawn behind it.
 */
const HOUSE = { w: 4, h: 4, solid: 2 };
export const BUILDING_SIZES: Record<BuildingKind, { w: number; h: number; solid: number }> = {
  0: HOUSE, 1: HOUSE, 2: HOUSE, 3: HOUSE, 4: HOUSE, 5: HOUSE, 6: HOUSE, 7: HOUSE,
  townhall: { w: 5, h: 5, solid: 2 },
  tavern: { w: 5, h: 5, solid: 2 },
};

export interface Building {
  kind: BuildingKind;
  /** Top-left tile and sprite size, in tiles (only the bottom rows are solid, see BUILDING_SIZES). */
  col: number;
  row: number;
  w: number;
  h: number;
}

export interface Village {
  /** Tile in front of the town hall where the main street and the roads start. */
  hubCol: number;
  hubRow: number;
  buildings: Building[];
  /** Solid tiles (the wall rows of every building). */
  footprint: Set<string>;
}

function rng(seed: number) {
  let a = Math.floor(seed * 4294967296) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const key = (c: number, r: number) => `${c},${r}`;

function siteIsFlat(hubCol: number, hubRow: number): boolean {
  for (let r = hubRow - BOX_UP; r <= hubRow + BOX_DOWN; r++) {
    for (let c = hubCol - BOX_W; c <= hubCol + BOX_W; c++) {
      const t = generateTile(c, r);
      if (t === 'water' || t === 'rock') return false;
    }
  }
  return true;
}

function layout(hubCol: number, hubRow: number, rand: () => number): Building[] {
  const out: Building[] = [];
  const add = (kind: BuildingKind, col: number, row: number) => {
    const { w, h } = BUILDING_SIZES[kind];
    out.push({ kind, col, row, w, h });
  };
  add('townhall', hubCol - 2, hubRow - 5);

  const pick = () => HOUSE_KINDS[Math.floor(rand() * HOUSE_KINDS.length)];
  // North of the street, either side of the town hall; fronts sit on the street.
  // The first building on one randomly chosen side is the village's tavern.
  const tavernSide = rand() < 0.5 ? 1 : -1;
  for (const side of [1, -1]) {
    let edge = side === 1 ? hubCol + 4 : hubCol - 4; // first free column next to the hall
    for (let n = 1 + Math.floor(rand() * 3), first = true; n > 0; n--, first = false) {
      const kind: BuildingKind = first && side === tavernSide ? 'tavern' : pick();
      const { w, h } = BUILDING_SIZES[kind];
      const col = side === 1 ? edge : edge - w + 1;
      if (col < hubCol - STREET_HALF || col + w - 1 > hubCol + STREET_HALF) break;
      add(kind, col, hubRow - h);
      edge += side * (w + 1);
    }
  }
  // South of the street, with a strip of open ground between them and the road.
  let x = hubCol - STREET_HALF + Math.floor(rand() * 2);
  while (true) {
    const kind = pick();
    const { w } = BUILDING_SIZES[kind];
    if (x + w - 1 > hubCol + STREET_HALF) break;
    if (rand() < 0.7) add(kind, x, hubRow + 2);
    x += w + 1 + Math.floor(rand() * 2);
  }
  return out;
}

const villages = new Map<string, Village | null>();

/** The village of region (rx, ry), if that region has one. */
export function getVillage(rx: number, ry: number): Village | null {
  const k = key(rx, ry);
  if (villages.has(k)) return villages.get(k) ?? null;
  const rand = rng(hash2(rx, ry, WORLD_SEED + 30));
  let village: Village | null = null;
  if (rand() < VILLAGE_CHANCE) {
    for (let attempt = 0; attempt < 20 && !village; attempt++) {
      const hubCol = rx * REGION + 16 + Math.floor(rand() * (REGION - 32));
      const hubRow = ry * REGION + 16 + Math.floor(rand() * (REGION - 32));
      if (!siteIsFlat(hubCol, hubRow)) continue;
      const buildings = layout(hubCol, hubRow, rand);
      const footprint = new Set<string>();
      for (const b of buildings) {
        const { solid } = BUILDING_SIZES[b.kind];
        for (let r = b.row + b.h - solid; r < b.row + b.h; r++) for (let c = b.col; c < b.col + b.w; c++) footprint.add(key(c, r));
      }
      village = { hubCol, hubRow, buildings, footprint };
    }
  }
  villages.set(k, village);
  return village;
}

const regionOf = (v: number) => Math.floor(v / REGION);

function villageAtTile(col: number, row: number): Village | null {
  return getVillage(regionOf(col), regionOf(row));
}

export function buildingTileAt(col: number, row: number): boolean {
  return villageAtTile(col, row)?.footprint.has(key(col, row)) ?? false;
}

/** Inside a village's cleared area (trees are removed there). */
export function inClearing(col: number, row: number): boolean {
  const v = villageAtTile(col, row);
  return (
    !!v &&
    Math.abs(col - v.hubCol) <= BOX_W &&
    row >= v.hubRow - BOX_UP &&
    row <= v.hubRow + BOX_DOWN
  );
}

/** Villages whose buildings may overlap the given tile rectangle (inclusive). */
export function villagesInRect(col0: number, row0: number, col1: number, row1: number): Village[] {
  const out: Village[] = [];
  for (let ry = regionOf(row0); ry <= regionOf(row1); ry++) {
    for (let rx = regionOf(col0); rx <= regionOf(col1); rx++) {
      const v = getVillage(rx, ry);
      if (v) out.push(v);
    }
  }
  return out;
}

// Roads join each village to its east ('e') and south ('s') neighbour.
const roads = new Map<string, Set<string> | null>();

function roadTiles(rx: number, ry: number, dir: 'e' | 's'): Set<string> | null {
  const k = `${rx},${ry},${dir}`;
  if (roads.has(k)) return roads.get(k) ?? null;
  const a = getVillage(rx, ry);
  const b = getVillage(dir === 'e' ? rx + 1 : rx, dir === 's' ? ry + 1 : ry);
  let result: Set<string> | null = null;
  if (a && b) {
    const tiles = new Set<string>();
    const h = (row: number, c0: number, c1: number) => {
      for (let c = Math.min(c0, c1); c <= Math.max(c0, c1); c++) tiles.add(key(c, row));
    };
    const v = (col: number, r0: number, r1: number) => {
      for (let r = Math.min(r0, r1); r <= Math.max(r0, r1); r++) tiles.add(key(col, r));
    };
    // Leave along the street, turn once outside the clearings, arrive along the other street.
    const bend =
      dir === 'e'
        ? Math.min(
            Math.max(
              a.hubCol + Math.round((b.hubCol - a.hubCol) * (0.35 + 0.3 * hash2(rx, ry, WORLD_SEED + 31))),
              a.hubCol + BOX_W + 1,
            ),
            b.hubCol - BOX_W - 1,
          )
        : Math.max(a.hubCol, b.hubCol) + BOX_W + 2;
    h(a.hubRow, a.hubCol, bend);
    v(bend, a.hubRow, b.hubRow);
    h(b.hubRow, bend, b.hubCol);
    let water = 0;
    for (const t of tiles) {
      const [c, r] = t.split(',').map(Number);
      if (generateTile(c, r) === 'water') water++;
    }
    if (water <= MAX_BRIDGE_TILES) result = tiles;
  }
  roads.set(k, result);
  return result;
}

/** Whether this tile is on a village's main street (paved). */
export function isStreet(col: number, row: number): boolean {
  const v = villageAtTile(col, row);
  return !!v && row === v.hubRow && Math.abs(col - v.hubCol) <= STREET_HALF;
}

/** Whether a road, bridge or village street runs through this tile. */
export function isRoad(col: number, row: number): boolean {
  const rx = regionOf(col);
  const ry = regionOf(row);
  if (isStreet(col, row)) return true;
  const k = key(col, row);
  for (let oy = -1; oy <= 0; oy++) {
    for (let ox = -1; ox <= 0; ox++) {
      if (roadTiles(rx + ox, ry + oy, 'e')?.has(k) || roadTiles(rx + ox, ry + oy, 's')?.has(k)) return true;
    }
  }
  return false;
}

/**
 * Picks the road sprite and clockwise rotation (degrees) for a road-neighbour mask
 * (N=1, E=2, S=4, W=8).
 */
export function roadPiece(mask: number): { piece: 'dot' | 'end' | 'straight' | 'corner' | 'tee' | 'cross'; rotation: number } {
  const N = 1, E = 2, S = 4, W = 8;
  const open = [N, E, S, W].filter((d) => mask & d).length;
  switch (open) {
    case 0:
      return { piece: 'dot', rotation: 0 };
    case 1:
      return { piece: 'end', rotation: mask & N ? 0 : mask & E ? 90 : mask & S ? 180 : 270 };
    case 2:
      if (mask === (N | S)) return { piece: 'straight', rotation: 0 };
      if (mask === (E | W)) return { piece: 'straight', rotation: 90 };
      return { piece: 'corner', rotation: mask === (N | E) ? 0 : mask === (E | S) ? 90 : mask === (S | W) ? 180 : 270 };
    case 3:
      // the tee is drawn missing its west arm; rotating 90° moves the gap to north, 180° east, 270° south
      return { piece: 'tee', rotation: !(mask & W) ? 0 : !(mask & N) ? 90 : !(mask & E) ? 180 : 270 };
    default:
      return { piece: 'cross', rotation: 0 };
  }
}
