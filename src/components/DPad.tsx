import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Direction } from '../game/hero';

interface Props {
  onPress: (dir: Direction) => void;
  onRelease: (dir: Direction) => void;
}

const BUTTONS: { dir: Direction; label: string; pos: object }[] = [
  { dir: 'up', label: '▲', pos: { top: 0, left: 60 } },
  { dir: 'down', label: '▼', pos: { top: 120, left: 60 } },
  { dir: 'left', label: '◀', pos: { top: 60, left: 0 } },
  { dir: 'right', label: '▶', pos: { top: 60, left: 120 } },
];

export function DPad({ onPress, onRelease }: Props) {
  return (
    <View style={styles.pad}>
      {BUTTONS.map(({ dir, label, pos }) => (
        <Pressable
          key={dir}
          onPressIn={() => onPress(dir)}
          onPressOut={() => onRelease(dir)}
          style={({ pressed }) => [styles.button, pos, pressed && styles.pressed]}
        >
          <Text style={styles.label}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { width: 180, height: 180 },
  button: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: 'rgba(255,255,255,0.55)' },
  label: { color: '#fff', fontSize: 24 },
});
