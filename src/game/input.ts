import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import type { Direction } from './hero';

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  z: 'up',
  q: 'left',
};

/**
 * Tracks which directions are held (touch D-pad + keyboard on web).
 * The most recently pressed direction wins.
 */
export function useInput() {
  const held = useRef<Direction[]>([]);

  const press = (dir: Direction) => {
    held.current = [...held.current.filter((d) => d !== dir), dir];
  };
  const release = (dir: Direction) => {
    held.current = held.current.filter((d) => d !== dir);
  };
  const current = (): Direction | null => held.current[held.current.length - 1] ?? null;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onDown = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key];
      if (!dir) return;
      e.preventDefault();
      if (!e.repeat) press(dir);
    };
    const onUp = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key];
      if (dir) release(dir);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return { press, release, current };
}
