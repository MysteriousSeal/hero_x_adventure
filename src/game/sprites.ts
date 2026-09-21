import type { ImageSourcePropType } from 'react-native';
import type { Direction } from './hero';
import type { TileType } from './world';

/**
 * Sprite registry. While an entry is `undefined`, the game draws a coloured
 * placeholder. To use a sprite, drop the PNG in assets/sprites and require it:
 *
 *   grass: require('../../assets/sprites/grass.png'),
 */
export const TILE_SPRITES: Partial<Record<TileType, ImageSourcePropType>> = {
  // grass: require('../../assets/sprites/grass.png'),
};

/** One sprite per kind of tree (oak, pine, autumn). See getTreeVariant in world.ts. */
export const TREE_SPRITES: ImageSourcePropType[] = [
  require('../../assets/sprites/tree_0.png'),
  require('../../assets/sprites/tree_1.png'),
  require('../../assets/sprites/tree_2.png'),
];

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
  sand: '#e6d58f',
  tree: '#1f6b34',
  water: '#3b7dd8',
  rock: '#7a7a85',
};

export const HERO_COLOR = '#e8433b';
