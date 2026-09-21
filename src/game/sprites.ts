import type { ImageSourcePropType } from 'react-native';
import type { Direction } from './hero';
import type { TileType } from './world';

/**
 * Game Boy Color style: every sprite is drawn on a 16px grid and shown at 2x, so one tile
 * (32 game units) is 16 native pixels. Tiles without an entry use a placeholder colour.
 */
export const TILE_SPRITES: Partial<Record<TileType, ImageSourcePropType>> = {
  sand: require('../../assets/sprites/sand.png'),
  rock: require('../../assets/sprites/rock.png'),
};

/** Ground variants, picked per tile so the meadow doesn't look tiled. */
export const GRASS_SPRITES: ImageSourcePropType[] = [
  require('../../assets/sprites/grass_0.png'),
  require('../../assets/sprites/grass_1.png'),
  require('../../assets/sprites/grass_2.png'),
  require('../../assets/sprites/grass_3.png'),
];

/** Tall-grass tiles, drawn over a grass tile. */
export const TALL_GRASS_SPRITES: ImageSourcePropType[] = [
  require('../../assets/sprites/tallgrass_0.png'),
  require('../../assets/sprites/tallgrass_1.png'),
  require('../../assets/sprites/tallgrass_2.png'),
  require('../../assets/sprites/tallgrass_3.png'),
];

/** Water ripple animation, one image per frame (see waterClock.ts). */
export const WATER_SPRITES: ImageSourcePropType[] = [
  require('../../assets/sprites/water_0.png'),
  require('../../assets/sprites/water_1.png'),
  require('../../assets/sprites/water_2.png'),
  require('../../assets/sprites/water_3.png'),
];

/**
 * Transparent bank pieces drawn over water where it meets land. All are drawn for the north
 * side / north-east corner and rotated clockwise for the other sides.
 */
export const SHORE_SPRITES = {
  edge: require('../../assets/sprites/shore_edge.png'),
  corner: require('../../assets/sprites/shore_corner.png'),
  inner: require('../../assets/sprites/shore_inner.png'),
} as const;

/**
 * Tall-grass blades drawn on a short-grass tile where it touches a tall-grass patch, so the
 * patch edge looks ragged instead of square. Same layout as SHORE_SPRITES.
 */
export const FRINGE_SPRITES = {
  edge: require('../../assets/sprites/fringe_edge.png'),
  corner: require('../../assets/sprites/fringe_corner.png'),
  inner: require('../../assets/sprites/fringe_inner.png'),
} as const;

/** Paved street tiles (village main streets), picked per tile. */
export const PAVED_SPRITES: ImageSourcePropType[] = [
  require('../../assets/sprites/paved_0.png'),
  require('../../assets/sprites/paved_1.png'),
  require('../../assets/sprites/paved_2.png'),
  require('../../assets/sprites/paved_3.png'),
];

/**
 * One sprite per kind of tree (oak, pine, birch), see getTreeVariant in world.ts.
 * Trees are 32 native pixels (2 tiles) and drawn on their own layer so neighbours overlap.
 */
export const TREE_SIZE = 64;
/** Distance from the top of the tree sprite to the bottom of its trunk. */
export const TREE_BASE_Y = 60;
export const TREE_SPRITES: ImageSourcePropType[] = [
  require('../../assets/sprites/tree_0.png'),
  require('../../assets/sprites/tree_1.png'),
  require('../../assets/sprites/tree_2.png'),
];

/** Village buildings, by kind. Houses are 64 native pixels (4x4 tiles); the town hall and the tavern 80 (5x5). */
export const BUILDING_SPRITES: Record<string, ImageSourcePropType> = {
  0: require('../../assets/sprites/house_0.png'),
  1: require('../../assets/sprites/house_1.png'),
  2: require('../../assets/sprites/house_2.png'),
  3: require('../../assets/sprites/house_3.png'),
  4: require('../../assets/sprites/house_4.png'),
  5: require('../../assets/sprites/house_5.png'),
  6: require('../../assets/sprites/house_6.png'),
  7: require('../../assets/sprites/house_7.png'),
  townhall: require('../../assets/sprites/townhall.png'),
  tavern: require('../../assets/sprites/tavern.png'),
};

/**
 * Dirt road pieces (with grass around them), drawn with their arms pointing north. Rotate clockwise to match the neighbours:
 * end opens north, straight runs north-south, corner joins north+east, tee misses west.
 */
export const ROAD_SPRITES = {
  dot: require('../../assets/sprites/road_dot.png'),
  end: require('../../assets/sprites/road_end.png'),
  straight: require('../../assets/sprites/road_straight.png'),
  corner: require('../../assets/sprites/road_corner.png'),
  tee: require('../../assets/sprites/road_tee.png'),
  cross: require('../../assets/sprites/road_cross.png'),
} as const;

/** Bridge planks running west-east; rotate for north-south. */
export const BRIDGE_SPRITE: ImageSourcePropType = require('../../assets/sprites/bridge.png');

// Keeps pixel art crisp when scaled up (honoured on web only).
export const PIXELATED = { imageRendering: 'pixelated' } as object;

/** Hero frames per facing direction: [standing, step A, step B]. */
export const HERO_SPRITES: Partial<Record<Direction, ImageSourcePropType[]>> = {
  down: [
    require('../../assets/sprites/hero_down_0.png'),
    require('../../assets/sprites/hero_down_1.png'),
    require('../../assets/sprites/hero_down_2.png'),
  ],
  up: [
    require('../../assets/sprites/hero_up_0.png'),
    require('../../assets/sprites/hero_up_1.png'),
    require('../../assets/sprites/hero_up_2.png'),
  ],
  left: [
    require('../../assets/sprites/hero_left_0.png'),
    require('../../assets/sprites/hero_left_1.png'),
    require('../../assets/sprites/hero_left_2.png'),
  ],
  right: [
    require('../../assets/sprites/hero_right_0.png'),
    require('../../assets/sprites/hero_right_1.png'),
    require('../../assets/sprites/hero_right_2.png'),
  ],
};

/** Placeholder colours used until sprites are provided. */
export const TILE_COLORS: Record<TileType, string> = {
  grass: '#5fae4e',
  tallgrass: '#5fae4e',
  sand: '#e6d58f',
  tree: '#1f6b34',
  water: '#3b7dd8',
  rock: '#7a7a85',
  road: '#d6b880',
  paved: '#9c9aa0',
  bridge: '#3b7dd8',
  building: '#5fae4e',
};

export const HERO_COLOR = '#e8433b';
