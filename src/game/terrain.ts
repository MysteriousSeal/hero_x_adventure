import { fbm, hash2 } from './noise';

export type BaseTile = 'grass' | 'tallgrass' | 'sand' | 'tree' | 'water' | 'rock';

/** Change to get a different world. */
export const WORLD_SEED = 1337;

/** Elevation thresholds. Water is kept rare so it forms lakes, not oceans. */
const WATER_LEVEL = 0.29;
const SAND_LEVEL = WATER_LEVEL; // no sand: lakes have grass banks (shore tiles)
const ROCK_LEVEL = 0.68;

/** Whether this tile is inside a tall-grass patch. Trees can stand on tall grass too. */
export function isTallGrass(col: number, row: number): boolean {
  return fbm(col * 0.1, row * 0.1, WORLD_SEED + 4, 3) > 0.62;
}

/** Raw terrain (no villages or roads): a pure function of the tile coordinates. */
export function generateTile(col: number, row: number): BaseTile {
  const elevation = fbm(col * 0.05, row * 0.05, WORLD_SEED);
  const moisture = fbm(col * 0.07, row * 0.07, WORLD_SEED + 1);

  if (elevation < WATER_LEVEL) return 'water';
  if (elevation < SAND_LEVEL) return 'sand';
  if (elevation > ROCK_LEVEL) return 'rock';

  // Forests where it is humid; a few lone trees elsewhere.
  const density = moisture > 0.5 ? Math.min(0.9, 0.4 + (moisture - 0.5) * 2.5) : 0.02;
  if (hash2(col, row, WORLD_SEED + 2) < density) return 'tree';

  // Patches of tall grass in the open meadows.
  return isTallGrass(col, row) ? 'tallgrass' : 'grass';
}
