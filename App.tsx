import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { DPad } from './src/components/DPad';
import { Hero } from './src/components/Hero';
import { TileMap } from './src/components/TileMap';
import { HeroState, stepHero } from './src/game/hero';
import { useInput } from './src/game/input';
import { HERO_START, MAP_HEIGHT, MAP_WIDTH } from './src/game/map';

const MAX_DT = 0.05; // clamp long frames (tab switch, hitch) so the hero can't tunnel

export default function App() {
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

  const scale = Math.min(width / MAP_WIDTH, height / MAP_HEIGHT);

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <View style={{ width: MAP_WIDTH * scale, height: MAP_HEIGHT * scale, overflow: 'hidden' }}>
        <View
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            transformOrigin: 'top left',
            transform: [{ scale }],
          }}
        >
          <TileMap />
          <Hero hero={hero} time={time} />
        </View>
      </View>
      <View style={styles.controls} pointerEvents="box-none">
        <DPad onPress={input.press} onRelease={input.release} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  controls: { position: 'absolute', left: 24, bottom: 24 },
});
