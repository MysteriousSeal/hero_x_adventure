import { ATTACK_TIME, HERO_HITBOX, HERO_SPEED } from './config';
import { isSolidAt } from './world';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface HeroState {
  /** Top-left of the collision box, in game units. */
  x: number;
  y: number;
  facing: Direction;
  moving: boolean;
  /** Seconds left in the current sword swing; 0 when not attacking. */
  attack: number;
}

const VECTORS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

function boxCollides(x: number, y: number): boolean {
  const { width: w, height: h } = HERO_HITBOX;
  const right = x + w - 0.01;
  const bottom = y + h - 0.01;
  return (
    isSolidAt(x, y) || isSolidAt(right, y) || isSolidAt(x, bottom) || isSolidAt(right, bottom)
  );
}

/**
 * Advances the hero one frame (Zelda style: one of 4 directions, no diagonals).
 * A swing pins him in place until it finishes; a new one can only start once it has.
 */
export function stepHero(hero: HeroState, dir: Direction | null, dt: number, attack = false): HeroState {
  if (hero.attack > 0) {
    // Mid-swing: the hero holds still and keeps facing the way the swing started.
    return { ...hero, attack: Math.max(0, hero.attack - dt) };
  }
  if (attack) {
    return { ...hero, facing: dir ?? hero.facing, moving: false, attack: ATTACK_TIME };
  }
  if (!dir) return hero.moving ? { ...hero, moving: false } : hero;

  const { dx, dy } = VECTORS[dir];
  const dist = HERO_SPEED * dt;
  const nx = hero.x + dx * dist;
  const ny = hero.y + dy * dist;

  // Axis-separated so the hero slides along walls instead of sticking.
  let x = hero.x;
  let y = hero.y;
  if (!boxCollides(nx, hero.y)) x = nx;
  if (!boxCollides(x, ny)) y = ny;

  return { ...hero, x, y, facing: dir, moving: x !== hero.x || y !== hero.y };
}
