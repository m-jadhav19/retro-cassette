import { SFX } from '../constants';

type SfxKey = keyof typeof SFX;

const pools: Partial<Record<SfxKey, HTMLAudioElement[]>> = {};
const POOL_SIZE = 3;

function createPool(url: string): HTMLAudioElement[] {
  return Array.from({ length: POOL_SIZE }, () => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.load();
    return audio;
  });
}

// Preload on module load
(Object.keys(SFX) as SfxKey[]).forEach((key) => {
  pools[key] = createPool(SFX[key]);
});

let poolCursor = 0;

export function playSfx(key: SfxKey, volume = 0.55): void {
  const pool = pools[key];
  if (!pool?.length) return;

  const audio = pool[poolCursor % pool.length];
  poolCursor++;

  audio.pause();
  audio.currentTime = 0;
  audio.volume = volume;

  const playPromise = audio.play();
  if (playPromise) {
    playPromise.catch((err) => {
      console.warn(`SFX "${key}" blocked:`, err);
    });
  }
}

/** Unlock audio on first user interaction (browser autoplay policy) */
let audioUnlocked = false;

export function unlockAudio(): void {
  if (audioUnlocked) return;
  audioUnlocked = true;

  (Object.keys(SFX) as SfxKey[]).forEach((key) => {
    const pool = pools[key];
    if (!pool?.[0]) return;
    const audio = pool[0];
    const prevVolume = audio.volume;
    audio.volume = 0;
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = prevVolume;
      })
      .catch(() => {});
  });
}
