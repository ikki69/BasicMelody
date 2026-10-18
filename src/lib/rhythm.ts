import type { PadNote, RhythmLevel } from '../data/rhythm';

/* ------------------------------------------------------------------
   Konstanta penilaian
   ------------------------------------------------------------------ */

/** Toleransi "Perfect" (± ms). */
export const PERFECT_MS = 120;
/** Toleransi "Good" (± ms). */
export const GOOD_MS = 250;
/**
 * Batas toleransi untuk tap yang sama sekali tidak dekat dengan onset.
 * Tap di luar batas ini dianggap "di luar ketukan" dan tidak dinilai
 * (tidak menghukum pemain karena tidak ada not di dekat situ).
 */
export const STRAY_MS = 400;
/**
 * Kompensasi latensi masukan (ms). Nilai positif berarti tap dianggap
 * lebih lambat dari yang tercatat. Bisa disetel bila terasa "selalu telat".
 */
export const TIMING_OFFSET_MS = 0;
/** Nilai akurasi untuk setiap jenis ketukan (0–1). */
export const SCORE_WEIGHT = { perfect: 1, good: 0.7, miss: 0 } as const;

export type Verdict = 'perfect' | 'good' | 'miss';

/* ------------------------------------------------------------------
   Waktu & posisi
   ------------------------------------------------------------------ */

export const beatSeconds = (level: RhythmLevel): number => 60 / level.bpm;

/** Durasi total pola (detik), tanpa hitung-masuk. */
export const patternDuration = (level: RhythmLevel): number => level.beats * beatSeconds(level);

/** Waktu relatif (detik) tiap slot grid terhadap awal pola. */
export const slotTime = (level: RhythmLevel, slotIndex: number): number =>
  (slotIndex * beatSeconds(level)) / level.subdivisions;

/** Rentang x paranada yang dipakai track (viewBox 0 0 400 196). */
export const TRACK_START_X = 44;
export const TRACK_END_X = 356;

/** Waktu (detik, relatif awal pola) → posisi x pada paranada. */
export const xForTime = (time: number, level: RhythmLevel): number => {
  const total = patternDuration(level);
  const ratio = total > 0 ? Math.min(Math.max(time / total, 0), 1) : 0;
  return TRACK_START_X + ratio * (TRACK_END_X - TRACK_START_X);
};

export interface RhythmOnset {
  /** Urutan onset (0..n-1). */
  index: number;
  /** Index slot grid asalnya. */
  slot: number;
  note: PadNote;
  /** Waktu relatif terhadap awal pola (detik). */
  time: number;
  /** Posisi x pada paranada. */
  x: number;
  /** Index ketukan (0-based) tempat onset ini berada. */
  beat: number;
}

/** Daftar onset (slot yang berisi not) beserta waktu & posisinya. */
export const buildOnsets = (level: RhythmLevel): RhythmOnset[] => {
  const onsets: RhythmOnset[] = [];
  level.steps.forEach((note, slot) => {
    if (!note) return;
    const time = slotTime(level, slot);
    onsets.push({
      index: onsets.length,
      slot,
      note,
      time,
      x: xForTime(time, level),
      beat: Math.floor(slot / level.subdivisions),
    });
  });
  return onsets;
};

/* ------------------------------------------------------------------
   Penilaian
   ------------------------------------------------------------------ */

/** Deviasi (ms) → jenis ketukan. Deviasi positif = pemain terlambat. */
export const verdictFor = (deviationMs: number): Verdict => {
  const abs = Math.abs(deviationMs);
  if (abs <= PERFECT_MS) return 'perfect';
  if (abs <= GOOD_MS) return 'good';
  return 'miss';
};

export interface VerdictCounts {
  perfect: number;
  good: number;
  miss: number;
  total: number;
}

export const countVerdicts = (verdicts: (Verdict | null)[]): VerdictCounts => {
  const counts: VerdictCounts = { perfect: 0, good: 0, miss: 0, total: verdicts.length };
  verdicts.forEach((v) => {
    if (v === 'perfect') counts.perfect += 1;
    else if (v === 'good') counts.good += 1;
    else if (v === 'miss') counts.miss += 1;
  });
  return counts;
};

/** Akurasi 0–100 dari daftar ketukan (yang belum dinilai dianggap meleset). */
export const accuracyFrom = (verdicts: (Verdict | null)[]): number => {
  if (verdicts.length === 0) return 0;
  const earned = verdicts.reduce((sum, v) => {
    if (v === 'perfect') return sum + SCORE_WEIGHT.perfect;
    if (v === 'good') return sum + SCORE_WEIGHT.good;
    return sum;
  }, 0);
  return (earned / verdicts.length) * 100;
};

/**
 * Bintang: 1 = selesai, 2 = akurasi ≥75%, 3 = akurasi ≥90% TANPA miss.
 * Akurasi memakai bobot (perfect 1, good 0.7) supaya "good" tetap dihargai
 * tetapi tidak sama nilainya dengan tepat. Angka yang sama juga yang
 * ditampilkan sebagai "Skor" di layar hasil.
 */
export const starsFor = (verdicts: (Verdict | null)[], counts: VerdictCounts): 1 | 2 | 3 => {
  const accuracy = accuracyFrom(verdicts);
  if (accuracy >= 90 && counts.miss === 0) return 3;
  if (accuracy >= 75) return 2;
  return 1;
};

/** Crown: 3 bintang dan sama sekali tanpa ketukan meleset. */
export const crownFor = (stars: 1 | 2 | 3, counts: VerdictCounts): boolean =>
  stars === 3 && counts.miss === 0;

/** Onset terdekat yang belum dinilai. */
export const nearestPending = (
  onsets: RhythmOnset[],
  verdicts: (Verdict | null)[],
  time: number
): { onset: RhythmOnset; deviationMs: number } | null => {
  let best: RhythmOnset | null = null;
  let bestAbs = Number.POSITIVE_INFINITY;
  for (const onset of onsets) {
    if (verdicts[onset.index] !== null) continue;
    const abs = Math.abs(time - onset.time);
    if (abs < bestAbs) {
      bestAbs = abs;
      best = onset;
    }
  }
  if (!best) return null;
  return { onset: best, deviationMs: (time - best.time) * 1000 };
};
