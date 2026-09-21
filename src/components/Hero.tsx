import { Image, StyleSheet, View } from 'react-native';
import { HERO_HITBOX, HERO_SIZE } from '../game/config';
import type { HeroState } from '../game/hero';
import { zForY } from './TileMap';
import { HERO_COLOR, HERO_SPRITES, PIXELATED } from '../game/sprites';

const FRAME_MS = 140;
// Walk cycle over [standing, step A, step B]: stand, A, stand, B.
const WALK_CYCLE = [0, 1, 0, 2];

const snap = (v: number) => Math.round(v / 2) * 2;

export function Hero({ hero, time }: { hero: HeroState; time: number }) {
  const frames = HERO_SPRITES[hero.facing];
  const step = hero.moving ? WALK_CYCLE[Math.floor(time / FRAME_MS) % WALK_CYCLE.length] : 0;
  const frame = frames?.[step];

  // Sprite is centred horizontally on the hitbox, feet aligned with its bottom.
  const style = [
    styles.hero,
    {
      zIndex: zForY(hero.y + HERO_HITBOX.height),
      // snapped to native pixels (2 game units) so the sprite never lands between pixels
      left: snap(hero.x + (HERO_HITBOX.width - HERO_SIZE.width) / 2),
      top: snap(hero.y + HERO_HITBOX.height - HERO_SIZE.height),
    },
  ];

  return frame ? (
    <Image source={frame} style={[style, PIXELATED]} resizeMode="stretch" />
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
  hero: { position: 'absolute', width: HERO_SIZE.width, height: HERO_SIZE.height },
  placeholder: { backgroundColor: HERO_COLOR, borderRadius: 6, borderWidth: 2, borderColor: '#7a1410' },
  nose: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
});
