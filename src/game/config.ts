/** Size of one tile in game units (the whole scene is scaled to fit the screen). */
export const TILE_SIZE = 32;

/** Hero walking speed, in game units per second. */
export const HERO_SPEED = 120;

/** Hero collision box, smaller than a tile so the hero can slip through gaps. */
export const HERO_HITBOX = { width: 20, height: 16 };

/** Hero drawn size (sprite frame size). */
export const HERO_SIZE = { width: 28, height: 32 };
