import { HERO_HITBOX, TILE_SIZE } from './config';
import { fbm, hash2 } from './noise';

export type TileType = 'grass' | 'sand' | 'tree' | 'water' | 'rock';

export const SOLID_TILES: ReadonlySet<TileType> = new Set(['tree', 'water', 'rock']);

/** Change to get a different world. */
export const WORLD_SEED = 1337;

const CHUNK = 16;
const MAX_CACHED_CHUNKS = 512;

function generateTile(col: number, row: number): TileType {
  const elevation = fbm(col * 0.04, row * 0.04, WORLD_SEED);
  const moisture = fbm(col * 0.07, row * 0.07, WORLD_SEED + 1);

  if (elevation < 0.4) return 'water';
  if (elevation < 0.44) return 'sand';
  if (elevation > 0.68) return 'rock';

  // Forests where it is humid; a few lone trees elsewhere.
  const density = moisture > 0.5 ? 0.15 + (moisture - 0.5) * 1.4 : 0.02;
  return hash2(col, row, WORLD_SEED + 2) < density ? 'tree' : 'grass';
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
      for (let c = 0; c < CHUNK; c++) chunk.push(generateTile(cx * CHUNK + c, cy * CHUNK + r));
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

/** Whether the world position (game units) is inside a solid tile. */
export function isSolidAt(px: number, py: number): boolean {
  return SOLID_TILES.has(getTile(Math.floor(px / TILE_SIZE), Math.floor(py / TILE_SIZE)));
}

/** Spiral out from the origin to find open ground with free tiles all around it. */
function findSpawn(): { x: number; y: number } {
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
        if (open) {
          return {
            x: dx * TILE_SIZE + (TILE_SIZE - HERO_HITBOX.width) / 2,
            y: dy * TILE_SIZE + (TILE_SIZE - HERO_HITBOX.height) / 2,
          };
        }
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
