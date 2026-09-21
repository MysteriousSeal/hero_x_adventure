import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CHARACTERS, CharacterId, PIXELATED } from '../game/sprites';

const ORDER: CharacterId[] = ['boy', 'girl'];
const FONT = 'PressStart2P_400Regular';
const WALK = [1, 2, 3, 4];
const FRAME_MS = 150;

// Game Boy Color-ish palette for the menu.
const C = {
  bg: '#181430',
  panel: '#221e44',
  panelSelected: '#33306a',
  border: '#58588c',
  gold: '#f8d058',
  text: '#f8f8e0',
  dim: '#a0a0c8',
  grass: '#88d860',
  grassDark: '#58a848',
};

/** First screen: pick the hero. Arrow keys + Enter on the web, taps on a phone. */
export function CharacterSelect({ onStart }: { onStart: (id: CharacterId) => void }) {
  const { width, height } = useWindowDimensions();
  const [fontsLoaded, fontError] = useFonts({ [FONT]: PressStart2P_400Regular });
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), FRAME_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'q'].includes(e.key)) setIndex((i) => (i + ORDER.length - 1) % ORDER.length);
      else if (['ArrowRight', 'd'].includes(e.key)) setIndex((i) => (i + 1) % ORDER.length);
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart(ORDER[index]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, onStart]);

  const ready = fontsLoaded || fontError;
  const font = fontError ? undefined : FONT;
  const unit = Math.max(6, Math.min(width / 90, height / 50)); // text/spacing scale
  const pixel = Math.max(3, Math.min(12, Math.floor(Math.min((width * 0.2) / 24, (height * 0.36) / 28))));
  const blink = Math.floor(tick / 3) % 2 === 0;

  if (!ready) return <View style={styles.root} />;

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <View style={[styles.ground, { height: height * 0.07 }]} />
      <Text style={[styles.title, { fontFamily: font, fontSize: unit * 2.4 }]}>HERO X ADVENTURE</Text>
      <Text style={[styles.subtitle, { fontFamily: font, fontSize: unit * 1.1 }]}>CHOOSE YOUR HERO</Text>

      <View style={[styles.cards, { gap: unit * 4 }]}>
        {ORDER.map((id, i) => {
          const selected = i === index;
          const frames = CHARACTERS[id].sprites.down;
          const frame = selected ? frames[WALK[tick % WALK.length]] : frames[0];
          return (
            <Pressable
              key={id}
              onPress={() => (selected ? onStart(id) : setIndex(i))}
              style={[
                styles.card,
                {
                  padding: unit * 1.5,
                  borderWidth: Math.max(3, unit * 0.5),
                  borderColor: selected ? C.gold : C.border,
                  backgroundColor: selected ? C.panelSelected : C.panel,
                },
              ]}
            >
              <Text style={[styles.arrow, { fontFamily: font, fontSize: unit * 1.4, opacity: selected && blink ? 1 : 0 }]}>▼</Text>
              <Image source={frame} style={[{ width: 24 * pixel, height: 28 * pixel }, PIXELATED]} resizeMode="stretch" />
              <Text style={[styles.name, { fontFamily: font, fontSize: unit * 1.4, color: selected ? C.gold : C.dim }]}>
                {CHARACTERS[id].name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={() => onStart(ORDER[index])} style={[styles.start, { paddingVertical: unit * 0.9, paddingHorizontal: unit * 2.5 }]}>
        <Text style={[styles.startText, { fontFamily: font, fontSize: unit * 1.3, opacity: blink ? 1 : 0.55 }]}>START</Text>
      </Pressable>
      <Text style={[styles.hint, { fontFamily: font, fontSize: unit * 0.8 }]}>
        {Platform.OS === 'web' ? '◀ ▶ CHOOSE   ENTER START' : 'TAP A HERO   TAP START'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  ground: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.grass, borderTopWidth: 6, borderTopColor: C.grassDark },
  title: { color: C.gold, textAlign: 'center', marginBottom: 8 },
  subtitle: { color: C.text, textAlign: 'center', marginBottom: 20 },
  cards: { flexDirection: 'row', alignItems: 'flex-end' },
  card: { alignItems: 'center' },
  arrow: { color: C.gold, marginBottom: 6 },
  name: { marginTop: 12 },
  start: { marginTop: 22, backgroundColor: C.gold },
  startText: { color: C.bg },
  hint: { color: C.dim, marginTop: 14, textAlign: 'center' },
});
