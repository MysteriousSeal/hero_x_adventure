import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { DPad } from './DPad';
import { Hero } from './Hero';
import { TileMap } from './TileMap';
import { HERO_HITBOX, TILE_SIZE } from '../game/config';
import { HeroState, stepHero } from '../game/hero';
import { useInput } from '../game/input';
import { CHARACTERS, CharacterId } from '../game/sprites';
import { HERO_START } from '../game/world';

const MAX_DT = 0.05; // clamp long frames (tab switch, hitch) so the hero can't tunnel
const VIEW_ROWS = 9; // tiles visible vertically (the Game Boy screen is 10x9 tiles)
const TILE_PX = 16; // native pixels per tile

export function Game({ character }: { character: CharacterId }) {
  const { width, height } = useWindowDimensions();
  const input = useInput();
  const [hero, setHero] = useState<HeroState>({ ...HERO_START, facing: 'down', moving: false });
  const [time, setTime] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;
      setHero((h) => stepHero(h, input.current(), dt));
      setTime(now);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The camera is centred on the hero; the world layer is shifted and scaled to match.
  // Whole device pixels per native pixel, so pixel art stays crisp and tiles never show seams.
  const pixel = Math.max(1, Math.floor(height / (VIEW_ROWS * TILE_PX)));
  const scale = pixel / (TILE_SIZE / TILE_PX); // game units -> device pixels
  const snap = (v: number) => Math.round(v * scale) / scale;
  const viewW = width / scale;
  const viewH = height / scale;
  const camX = snap(hero.x + HERO_HITBOX.width / 2 - viewW / 2);
  const camY = snap(hero.y + HERO_HITBOX.height / 2 - viewH / 2);

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <View
        style={{
          width: viewW,
          height: viewH,
          transformOrigin: 'top left',
          transform: [{ scale }, { translateX: -camX }, { translateY: -camY }],
        }}
      >
        <TileMap
          startCol={Math.floor(camX / TILE_SIZE)}
          startRow={Math.floor(camY / TILE_SIZE)}
          cols={Math.ceil(viewW / TILE_SIZE) + 1}
          rows={Math.ceil(viewH / TILE_SIZE) + 1}
        />
        <Hero hero={hero} time={time} sprites={CHARACTERS[character].sprites} />
      </View>
      <View style={styles.controls} pointerEvents="box-none">
        <DPad onPress={input.press} onRelease={input.release} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111', overflow: 'hidden' },
  controls: { position: 'absolute', left: 24, bottom: 24 },
});
