import { Image, StyleSheet, View } from 'react-native';
import { ATTACK_LUNGE, ATTACK_TIME, HERO_HITBOX, HERO_SIZE } from '../game/config';
import type { Direction, HeroState } from '../game/hero';
import { zForY } from './TileMap';
import { CharacterSprites, HERO_COLOR, PIXELATED, SLASH_SIZE, SLASH_SPRITES } from '../game/sprites';

const FRAME_MS = 120;
// Frame 0 is the idle pose; frames 1-4 are the walk cycle.
const WALK_CYCLE = [1, 2, 3, 4];

const snap = (v: number) => Math.round(v / 2) * 2;

/** Facing direction as a unit vector, and as quarter turns clockwise from "up". */
const AIM: Record<Direction, { dx: number; dy: number; turns: number }> = {
  up: { dx: 0, dy: -1, turns: 0 },
  right: { dx: 1, dy: 0, turns: 1 },
  down: { dx: 0, dy: 1, turns: 2 },
  left: { dx: -1, dy: 0, turns: 3 },
};

export function Hero({ hero, time, sprites }: { hero: HeroState; time: number; sprites: CharacterSprites }) {
  const frames = sprites[hero.facing];
  const attacking = hero.attack > 0;
  const step = hero.moving && !attacking ? WALK_CYCLE[Math.floor(time / FRAME_MS) % WALK_CYCLE.length] : 0;
  const frame = frames?.[step];

  // The sheets have no attack pose, so the swing is the idle frame leaning into a slash.
  const aim = AIM[hero.facing];
  const swing = attacking ? 1 - hero.attack / ATTACK_TIME : 0; // 0 -> 1 over the swing
  const lunge = attacking ? Math.sin(Math.PI * swing) * ATTACK_LUNGE : 0;

  // Sprite is centred horizontally on the hitbox, feet aligned with its bottom.
  const style = [
    styles.hero,
    {
      zIndex: zForY(hero.y + HERO_HITBOX.height),
      // snapped to native pixels (2 game units) so the sprite never lands between pixels
      left: snap(hero.x + (HERO_HITBOX.width - HERO_SIZE.width) / 2 + aim.dx * lunge),
      top: snap(hero.y + HERO_HITBOX.height - HERO_SIZE.height + aim.dy * lunge),
    },
  ];

  const slash = attacking ? (
    <Image
      source={SLASH_SPRITES[Math.min(SLASH_SPRITES.length - 1, Math.floor(swing * SLASH_SPRITES.length))]}
      style={[
        styles.slash,
        PIXELATED,
        {
          // Pivoted on the hero's waist: the arc is drawn away from the sprite centre, so it
          // sweeps clear of his body on whichever side he faces.
          left: snap(hero.x + HERO_HITBOX.width / 2 - SLASH_SIZE / 2 + aim.dx * lunge),
          top: snap(hero.y + HERO_HITBOX.height - HERO_SIZE.height * 0.35 - SLASH_SIZE / 2 + aim.dy * lunge),
          zIndex: zForY(hero.y + HERO_HITBOX.height) + 1,
          transform: [{ rotate: `${aim.turns * 90}deg` }],
        },
      ]}
      resizeMode="stretch"
    />
  ) : null;

  return frame ? (
    <>
      <Image source={frame} style={[style, PIXELATED]} resizeMode="stretch" />
      {slash}
    </>
  ) : (
    <View style={[style, styles.placeholder]}>
      <View style={[styles.nose, NOSE[hero.facing]]} />
    </View>
  );
}

// Small marker showing which way the placeholder hero faces.
const NOSE = StyleSheet.create({
  up: { top: 2, left: HERO_SIZE.width / 2 - 3 },
  down: { bottom: 2, left: HERO_SIZE.width / 2 - 3 },
  left: { left: 2, top: HERO_SIZE.height / 2 - 3 },
  right: { right: 2, top: HERO_SIZE.height / 2 - 3 },
});

const styles = StyleSheet.create({
  slash: { position: 'absolute', width: SLASH_SIZE, height: SLASH_SIZE },
  hero: { position: 'absolute', width: HERO_SIZE.width, height: HERO_SIZE.height },
  placeholder: { backgroundColor: HERO_COLOR, borderRadius: 6, borderWidth: 2, borderColor: '#7a1410' },
  nose: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
});
