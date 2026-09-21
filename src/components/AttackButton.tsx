import { Pressable, StyleSheet, Text } from 'react-native';

/** Touch button for the sword swing (the keyboard uses space / X on the web). */
export function AttackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPressIn={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.label}>A</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(248, 208, 88, 0.35)',
    borderWidth: 3,
    borderColor: 'rgba(248, 248, 224, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: 'rgba(248, 208, 88, 0.7)' },
  label: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
});
