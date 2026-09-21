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

/** Hero frames: one array of walking frames per facing direction. */
export const HERO_SPRITES: Partial<Record<Direction, ImageSourcePropType[]>> = {
  // down: [require('../../assets/sprites/hero_down_0.png'), require('../../assets/sprites/hero_down_1.png')],
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
