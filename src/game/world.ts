import { HERO_HITBOX, TILE_SIZE } from './config';
import { fbm } from './noise';
import { BaseTile, generateTile, WORLD_SEED } from './terrain';
import { buildingTileAt, getVillage, inClearing, isRoad } from './village';

export { WORLD_SEED };
export type TileType = BaseTile | 'road' | 'bridge' | 'building';

export const SOLID_TILES: ReadonlySet<TileType> = new Set(['tree', 'water', 'rock', 'building']);

const CHUNK = 16;
const MAX_CACHED_CHUNKS = 512;

/** Terrain, then villages on top of it: buildings, roads (bridges over water), cleared ground. */
function composeTile(col: number, row: number): TileType {
  if (buildingTileAt(col, row)) return 'building';
  const base = generateTile(col, row);
  if (isRoad(col, row)) return base === 'water' ? 'bridge' : 'road';
  if ((base === 'tree' || base === 'tallgrass') && inClearing(col, row)) return 'grass';
  return base;
}

// Tiles are a pure function of (col, row); chunks are just a cache.
const chunks = new Map<string, TileType[]>();

function getChunk(cx: number, cy: number): TileType[] {
  const key = `${cx},${cy}`;
  let chunk = chunks.get(key);
  if (!chunk) {
    if (chunks.size >= MAX_CACHED_CHUNKS) chunks.clear();
    chunk = [];
    for (let r = 0; r < CHUNK; r++) {
      for (let c = 0; c < CHUNK; c++) chunk.push(composeTile(cx * CHUNK + c, cy * CHUNK + r));
    }
    chunks.set(key, chunk);
  }
  return chunk;
}

export function getTile(col: number, row: number): TileType {
  const cx = Math.floor(col / CHUNK);
  const cy = Math.floor(row / CHUNK);
  return getChunk(cx, cy)[(row - cy * CHUNK) * CHUNK + (col - cx * CHUNK)];
}

/** Which of the 4 neighbours are road too: N=1, E=2, S=4, W=8. Used to pick road/bridge sprites. */
export function getRoadMask(col: number, row: number): number {
  return (
    (isRoad(col, row - 1) ? 1 : 0) |
    (isRoad(col + 1, row) ? 2 : 0) |
    (isRoad(col, row + 1) ? 4 : 0) |
    (isRoad(col - 1, row) ? 8 : 0)
  );
}

/** Whether the world position (game units) is inside a solid tile. */
export function isSolidAt(px: number, py: number): boolean {
  return SOLID_TILES.has(getTile(Math.floor(px / TILE_SIZE), Math.floor(py / TILE_SIZE)));
}

const tileCenter = (col: number, row: number) => ({
  x: col * TILE_SIZE + (TILE_SIZE - HERO_HITBOX.width) / 2,
  y: row * TILE_SIZE + (TILE_SIZE - HERO_HITBOX.height) / 2,
});

/** Start on the main street of the village closest to the origin; else on open ground. */
function findSpawn(): { x: number; y: number } {
  let best: { col: number; row: number; d: number } | null = null;
  for (let ry = -2; ry <= 2; ry++) {
    for (let rx = -2; rx <= 2; rx++) {
      const v = getVillage(rx, ry);
      if (!v) continue;
      const d = Math.hypot(v.hubCol, v.hubRow);
      if (!best || d < best.d) best = { col: v.hubCol, row: v.hubRow, d };
    }
  }
  if (best) return tileCenter(best.col, best.row);

  for (let radius = 0; radius < 200; radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        let open = true;
        for (let oy = -1; oy <= 1 && open; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            if (SOLID_TILES.has(getTile(dx + ox, dy + oy))) {
              open = false;
              break;
            }
          }
        }
        if (open) return tileCenter(dx, dy);
      }
    }
  }
  return { x: 0, y: 0 };
}

export const HERO_START = findSpawn();

export const TREE_VARIANTS = 3;

/**
 * Which kind of tree grows at a tile. It follows a very low-frequency noise field,
 * so every forest (and the trees around it) is made of one single kind of tree.
 */
export function getTreeVariant(col: number, row: number): number {
  const n = fbm(col * 0.015, row * 0.015, WORLD_SEED + 3, 2);
  return n < 0.45 ? 0 : n < 0.56 ? 1 : 2;
}
