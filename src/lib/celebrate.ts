import { prefersReducedMotion } from './navigate';

/** Palet confetti — aksen grafit + warna semantik + bidang pastel. */
const CONFETTI_COLORS = ['#3A3A40', '#4A4A52', '#6B6B75', '#FFC800', '#EFD3DA', '#FFFFFF'];

/**
 * Confetti dimuat malas (lazy import) supaya tidak masuk bundle awal
 * dan tidak dijalankan saat pengguna memilih gerak berkurang.
 */
const fire = async (
  options: { particleCount: number; spread: number; origin: { x?: number; y: number }; startVelocity?: number }
): Promise<void> => {
  if (prefersReducedMotion()) return;
  try {
    const mod = await import('canvas-confetti');
    const confetti = mod.default;
    confetti({
      particleCount: options.particleCount,
      spread: options.spread,
      origin: { x: options.origin.x ?? 0.5, y: options.origin.y },
      startVelocity: options.startVelocity ?? 42,
      colors: CONFETTI_COLORS,
      disableForReducedMotion: true,
    });
  } catch {
    // Efek hanya hiasan — abaikan bila gagal dimuat.
  }
};

/** Ledakan kecil: level selesai dengan 3 bintang. */
export const burstConfetti = (): void => {
  void fire({ particleCount: 90, spread: 70, origin: { y: 0.7 } });
  window.setTimeout(() => void fire({ particleCount: 60, spread: 100, origin: { x: 0.3, y: 0.8 } }), 180);
  window.setTimeout(() => void fire({ particleCount: 60, spread: 100, origin: { x: 0.7, y: 0.8 } }), 320);
};

/** Ledakan besar: meraih badge Maestro / menuntaskan semua level. */
export const bigConfetti = (): void => {
  void fire({ particleCount: 160, spread: 110, origin: { y: 0.65 }, startVelocity: 55 });
  window.setTimeout(() => void fire({ particleCount: 120, spread: 140, origin: { x: 0.2, y: 0.9 } }), 220);
  window.setTimeout(() => void fire({ particleCount: 120, spread: 140, origin: { x: 0.8, y: 0.9 } }), 380);
};
