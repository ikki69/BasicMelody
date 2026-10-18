import { DEFAULT_LEVEL_INDEX, NOTE_LEVELS, type NoteLevel } from '../data/levels';

/** Nama route hash untuk halaman Introduction. */
export const INTRODUCTION_HASH = 'introduction';

/**
 * Nama route hash untuk halaman Level (latihan irama).
 * Halaman ini dibuka dari tombol "Mulai Berlatih" di langkah terakhir
 * Introduction, dan juga dari CTA di landing page.
 */
export const LEVEL_HASH = 'level';

export const TOTAL_STEPS = 3;

export const clampIndex = (index: number): number =>
  Math.min(Math.max(Math.round(index), 0), NOTE_LEVELS.length - 1);

export const getLevel = (index: number): NoteLevel => NOTE_LEVELS[clampIndex(index)];

export const DEFAULT_PITCH_INDEX = DEFAULT_LEVEL_INDEX;

/** Jarak antar posisi not pada paranada (dalam unit viewBox SVG). */
const LEVEL_STEP_Y = NOTE_LEVELS.length > 1 ? NOTE_LEVELS[1].y - NOTE_LEVELS[0].y : 1;

/** Posisi y not (viewBox) → index terdekat (0–8). */
export const indexFromY = (y: number): number => clampIndex((y - NOTE_LEVELS[0].y) / LEVEL_STEP_Y);

/** Index → posisi y not (viewBox). */
export const yFromIndex = (index: number): number => getLevel(index).y;

export const clampStep = (step: number): number => Math.min(Math.max(step, 1), TOTAL_STEPS);

export const nextStep = (step: number): number => clampStep(step + 1);

export const prevStep = (step: number): number => clampStep(step - 1);

export const isLastStep = (step: number): boolean => step >= TOTAL_STEPS;

export const isFirstStep = (step: number): boolean => step <= 1;

/** Label indikator langkah: "1 / 3". Tanpa nol di depan — itu hiasan, bukan informasi. */
export const stepLabel = (step: number): string => `${clampStep(step)} / ${TOTAL_STEPS}`;

/** Teks tombol kanan: berubah di langkah terakhir. */
export const nextButtonLabel = (step: number): string => (isLastStep(step) ? 'Mulai Berlatih' : 'Lanjut');
