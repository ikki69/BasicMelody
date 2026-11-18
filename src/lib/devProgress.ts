/**
 * Alat bantu untuk pengujian lewat Console browser (F12).
 *
 * Setelah aplikasi dimuat, dua fungsi tersedia di `window`:
 * - `resetProgress()` → hapus semua progres, badge, dan status Introduction.
 * - `fullProgress()`  → tandai semua materi/level tuntas dengan 3 bintang.
 *
 * Keduanya menulis langsung ke localStorage lalu memuat ulang halaman supaya
 * state React ikut membaca nilai terbaru.
 */
import type { LevelProgressMap } from '../hooks/useLevelProgress';
import { EXTENDED_LEVELS } from '../data/levelsExtended';
import { ACHIEVEMENTS } from '../data/rhythm';
import { STORAGE_KEYS, removeKey, writeFlag, writeJSON } from './storage';

const reloadWithMessage = (message: string): void => {
  console.log(`[Basic Melody] ${message} Memuat ulang...`);
  window.setTimeout(() => window.location.reload(), 100);
};

/** Reset semua progres ke 0, termasuk status halaman Introduction. */
export const resetProgress = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => removeKey(key));
  reloadWithMessage('Progress direset ke 0.');
};

/** Buka semua materi & level dengan menandainya tuntas dan memberi 3 bintang. */
export const fullProgress = (): void => {
  const progress: LevelProgressMap = {};

  for (const level of EXTENDED_LEVELS) {
    const isIntro = level.kind === 'intro';
    progress[level.id] = {
      stars: isIntro ? 0 : 3,
      bestAccuracy: 100,
      crown: !isIntro,
      attempts: 1,
      done: true,
    };
  }

  writeJSON(STORAGE_KEYS.levelProgressV2, progress);
  writeJSON(
    STORAGE_KEYS.achievementsV2,
    ACHIEVEMENTS.map((item) => item.id)
  );
  writeFlag(STORAGE_KEYS.introCompleted, true);

  // Bersihkan format lama supaya tidak ikut termigrasi.
  removeKey(STORAGE_KEYS.levelProgress);
  removeKey(STORAGE_KEYS.achievements);

  reloadWithMessage('Semua materi & level dibuka.');
};

/** Daftarkan fungsi ke `window` agar bisa dipanggil dari Console. */
export const installProgressTools = (): void => {
  window.resetProgress = resetProgress;
  window.fullProgress = fullProgress;
  console.info(
    '%c[Basic Melody]%c Console tools siap: resetProgress() · fullProgress()',
    'color:#c9a227;font-weight:700',
    'color:inherit'
  );
};
