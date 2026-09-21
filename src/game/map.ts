import { TILE_SIZE } from './config';

export type TileType = 'grass' | 'path' | 'tree' | 'water' | 'wall';

const LEGEND: Record<string, TileType> = {
  '.': 'grass',
  '=': 'path',
  T: 'tree',
  '~': 'water',
  '#': 'wall',
};

export const SOLID_TILES: ReadonlySet<TileType> = new Set(['tree', 'water', 'wall']);

const LAYOUT = [
  'TTTTTTTTTTTTTTTTTTTT',
  'T..................T',
  'T..####............T',
  'T..#..#....~~~.....T',
  'T..#==#...~~~~~....T',
  'T...==.....~~~.....T',
  'T...==.............T',
  'T...=======........T',
  'T.........=....T...T',
  'T.........=........T',
  'T..T......=====....T',
  'T.........=........T',
  'T....~~~..=....TT..T',
  'T....~~~.......TT..T',
  'TTTTTTTTTTTTTTTTTTTT',
];

export const MAP: TileType[][] = LAYOUT.map((row) =>
  [...row].map((ch) => LEGEND[ch] ?? 'grass'),
);

export const MAP_COLS = MAP[0].length;
export const MAP_ROWS = MAP.length;
export const MAP_WIDTH = MAP_COLS * TILE_SIZE;
export const MAP_HEIGHT = MAP_ROWS * TILE_SIZE;

/** Hero start position (pixels, top-left of the hitbox), on the path. */
export const HERO_START = { x: 5 * TILE_SIZE + 6, y: 6 * TILE_SIZE + 8 };

export function isSolidAt(px: number, py: number): boolean {
  const col = Math.floor(px / TILE_SIZE);
  const row = Math.floor(py / TILE_SIZE);
  if (col < 0 || row < 0 || col >= MAP_COLS || row >= MAP_ROWS) return true;
  return SOLID_TILES.has(MAP[row][col]);
}
