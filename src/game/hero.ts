import { HERO_HITBOX, HERO_SPEED } from './config';
import { isSolidAt } from './world';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface HeroState {
  /** Top-left of the collision box, in game units. */
  x: number;
  y: number;
  facing: Direction;
  moving: boolean;
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

/** Moves the hero one step (Zelda style: one of 4 directions, no diagonals). */
export function stepHero(hero: HeroState, dir: Direction | null, dt: number): HeroState {
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

  return { x, y, facing: dir, moving: x !== hero.x || y !== hero.y };
}
