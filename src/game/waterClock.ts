import { useSyncExternalStore } from 'react';

export const WATER_FRAMES = 4;
const FRAME_MS = 350;

// One shared clock drives every water tile, so the whole lake ripples in step.
let frame = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      frame = (frame + 1) % WATER_FRAMES;
      listeners.forEach((l) => l());
    }, FRAME_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Current water animation frame (0..WATER_FRAMES-1). Re-renders the caller when it changes. */
export function useWaterFrame(): number {
  return useSyncExternalStore(subscribe, () => frame);
}
