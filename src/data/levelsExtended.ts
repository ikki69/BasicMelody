import type { MaterialId } from './materials';
import type { PadNote, RhythmLevel } from './rhythm';

/**
 * Daftar lengkap level untuk semua materi.
 *
 * Aturan yang dipakai seragam di semua materi:
 * - urutan 1 → 'intro' (pengenalan, tanpa kuis dan tanpa bintang)
 * - urutan 2+ → kuis (bintang 1–3, badge per level)
 */

/** Jenis level menentukan komponen yang dipakai saat dibuka. */
export type LevelKind = 'intro' | 'position-quiz' | 'duration-quiz' | 'rhythm' | 'symbol-quiz';

/** Cara kuis posisi not menyajikan soal. */
export type PositionMode = 'visual' | 'audio' | 'mixed';

export interface PositionQuizConfig {
  mode: PositionMode;
  /** Jumlah soal per percobaan. */
  count: number;
}

export interface DurationQuizConfig {
  /** Jumlah soal per percobaan (bank soal: nilai not 1/1–1/8). */
  count: number;
}

export interface SymbolQuizConfig {
  /** Jumlah soal per percobaan. */
  count: number;
  /** Tipe simbol yang diujikan. */
  type?: 'rest' | 'dot' | 'mix';
}

export interface RhythmConfig {
  bpm: number;
  beats: number;
  subdivisions: 1 | 2;
  steps: (PadNote | null)[];
  countIn: number;
}

export interface ExtendedLevel {
  /** Id stabil, mis. 'm1-2'. Dipakai sebagai kunci progres & id badge. */
  id: string;
  materialId: MaterialId;
  /** Nomor level di dalam materinya (1-based). */
  urutan: number;
  judul: string;
  deskripsi: string;
  kind: LevelKind;
  position?: PositionQuizConfig;
  duration?: DurationQuizConfig;
  symbol?: SymbolQuizConfig;
  rhythm?: RhythmConfig;
}

export const EXTENDED_LEVELS: ExtendedLevel[] = [
  /* ---------------- Materi 1 · Mengenal Posisi Not ---------------- */
  {
    id: 'm1-1',
    materialId: 'm1',
    urutan: 1,
    judul: 'Pengenalan Posisi Not',
    deskripsi: 'Kenali lima nada C, D, E, F, G dan posisinya pada paranada.',
    kind: 'intro',
  },
  {
    id: 'm1-2',
    materialId: 'm1',
    urutan: 2,
    judul: 'Lihat lalu Tekan',
    deskripsi: 'Not muncul di paranada. Tekan kotak nada yang benar.',
    kind: 'position-quiz',
    position: { mode: 'visual', count: 8 },
  },
  {
    id: 'm1-3',
    materialId: 'm1',
    urutan: 3,
    judul: 'Latihan Telinga',
    deskripsi: 'Nada hanya terdengar. Tebak kotak nadanya tanpa melihat paranada.',
    kind: 'position-quiz',
    position: { mode: 'audio', count: 8 },
  },
  {
    id: 'm1-4',
    materialId: 'm1',
    urutan: 4,
    judul: 'Campuran Nada',
    deskripsi: 'Campuran soal melihat dan mendengar dengan tempo tetap.',
    kind: 'position-quiz',
    position: { mode: 'mixed', count: 12 },
  },

  /* ---------------- Materi 2 · Nilai Not ---------------- */
  {
    id: 'm2-1',
    materialId: 'm2',
    urutan: 1,
    judul: 'Pengenalan Nilai Not',
    deskripsi: 'Kenali nilai not 1/4, 1/2, 1/1, dan 1/8.',
    kind: 'intro',
  },
  {
    id: 'm2-2',
    materialId: 'm2',
    urutan: 2,
    judul: 'Not Berapa Ketukan?',
    deskripsi: 'Tentukan berapa ketukan nilai not yang ditampilkan.',
    kind: 'duration-quiz',
    duration: { count: 8 },
  },
  {
    id: 'm2-3',
    materialId: 'm2',
    urutan: 3,
    judul: 'Hitung Cepat Nilai Not',
    deskripsi: 'Latihan menghitung nilai not dengan lebih banyak soal.',
    kind: 'duration-quiz',
    duration: { count: 12 },
  },
  {
    id: 'm2-4',
    materialId: 'm2',
    urutan: 4,
    judul: 'Semua Nilai Not',
    deskripsi: 'Semua nilai not bercampur dalam satu kuis.',
    kind: 'duration-quiz',
    duration: { count: 10 },
  },

  /* ---------------- Materi 3 · Irama ---------------- */
  {
    id: 'm3-1',
    materialId: 'm3',
    urutan: 1,
    judul: 'Pengenalan Ketukan & Tempo',
    deskripsi: 'Kenali ketukan, metronom, dan playhead sebelum mulai bermain.',
    kind: 'intro',
  },
  {
    id: 'm3-2',
    materialId: 'm3',
    urutan: 2,
    judul: 'Langkah Pertama',
    deskripsi: 'Empat ketukan, semua not. Kenali tempo dan posisi kotak nada.',
    kind: 'rhythm',
    rhythm: {
      bpm: 60,
      beats: 4,
      subdivisions: 1,
      steps: ['C4', 'C4', 'D4', 'E4'],
      countIn: 4,
    },
  },
  {
    id: 'm3-3',
    materialId: 'm3',
    urutan: 3,
    judul: 'Jeda Pertama',
    deskripsi: 'Mulai ada satu istirahat. Jangan menekan saat tidak ada not.',
    kind: 'rhythm',
    rhythm: {
      bpm: 70,
      beats: 4,
      subdivisions: 1,
      steps: ['C4', null, 'D4', 'C4'],
      countIn: 4,
    },
  },
  {
    id: 'm3-4',
    materialId: 'm3',
    urutan: 4,
    judul: 'Naik Turun',
    deskripsi: 'Delapan ketukan dengan dua istirahat dan gerak melodi naik-turun.',
    kind: 'rhythm',
    rhythm: {
      bpm: 75,
      beats: 8,
      subdivisions: 1,
      steps: ['C4', 'D4', null, 'E4', 'D4', 'C4', null, 'C4'],
      countIn: 4,
    },
  },
  {
    id: 'm3-5',
    materialId: 'm3',
    urutan: 5,
    judul: 'Lompatan G',
    deskripsi: 'Nada G masuk. Perhatikan lompatannya, tetap jaga ketukan.',
    kind: 'rhythm',
    rhythm: {
      bpm: 80,
      beats: 8,
      subdivisions: 1,
      steps: ['C4', 'D4', 'E4', 'F4', null, 'G4', 'C4', null],
      countIn: 4,
    },
  },
  {
    id: 'm3-6',
    materialId: 'm3',
    urutan: 6,
    judul: 'Ketukan Rapat',
    deskripsi: 'Mulai ada not 1/8: dua nada dalam satu ketukan.',
    kind: 'rhythm',
    rhythm: {
      bpm: 84,
      beats: 8,
      subdivisions: 2,
      steps: ['C4', null, 'D4', null, 'E4', 'E4', 'D4', null, 'C4', null, 'D4', 'D4', 'E4', null, 'C4', null],
      countIn: 4,
    },
  },
  {
    id: 'm3-7',
    materialId: 'm3',
    urutan: 7,
    judul: 'Sinkopasi',
    deskripsi: 'Nada sering masuk di ketukan lemah. Pola paling menuntut.',
    kind: 'rhythm',
    rhythm: {
      bpm: 88,
      beats: 8,
      subdivisions: 2,
      steps: [null, 'C4', 'D4', null, null, 'E4', 'D4', 'C4', null, 'D4', 'E4', null, 'F4', null, 'C4', null],
      countIn: 4,
    },
  },

  /* ---------------- Materi 4 · Not A4–G5 ---------------- */
  {
    id: 'm4-1',
    materialId: 'm4',
    urutan: 1,
    judul: 'Pengenalan Not Tinggi',
    deskripsi: 'Kenali nada A4, B4, C5, D5, E5, F5, G5 dan posisinya pada paranada.',
    kind: 'intro',
  },
  {
    id: 'm4-2',
    materialId: 'm4',
    urutan: 2,
    judul: 'Lihat lalu Tekan',
    deskripsi: 'Not tinggi muncul di paranada. Tekan kotak nada yang benar.',
    kind: 'position-quiz',
    position: { mode: 'visual', count: 8 },
  },
  {
    id: 'm4-3',
    materialId: 'm4',
    urutan: 3,
    judul: 'Latihan Telinga',
    deskripsi: 'Nada tinggi hanya terdengar. Tebak kotak nadanya tanpa melihat paranada.',
    kind: 'position-quiz',
    position: { mode: 'audio', count: 8 },
  },
  {
    id: 'm4-4',
    materialId: 'm4',
    urutan: 4,
    judul: 'Campuran Nada Tinggi',
    deskripsi: 'Campuran soal melihat dan mendengar dengan tempo tetap.',
    kind: 'position-quiz',
    position: { mode: 'mixed', count: 12 },
  },

  /* ---------------- Materi 5 · Tanda Diam dan Tanda Titik ---------------- */
  {
    id: 'm5-1',
    materialId: 'm5',
    urutan: 1,
    judul: 'Pengenalan Tanda Diam & Tanda Titik',
    deskripsi: 'Kenali tanda diam dan perpanjangan nilai not dengan tanda titik.',
    kind: 'intro',
  },
  {
    id: 'm5-2',
    materialId: 'm5',
    urutan: 2,
    judul: 'Kenali Simbol',
    deskripsi: 'Lihat simbol tanda diam atau not bertitik, pilih maknanya yang benar.',
    kind: 'symbol-quiz',
    symbol: { count: 8, type: 'mix' },
  },
  {
    id: 'm5-3',
    materialId: 'm5',
    urutan: 3,
    judul: 'Latihan Tanda Diam',
    deskripsi: 'Terapkan tanda diam dalam pola irama sederhana.',
    kind: 'rhythm',
    rhythm: {
      bpm: 72,
      beats: 4,
      subdivisions: 1,
      steps: ['C4', null, 'E4', null],
      countIn: 4,
    },
  },
  {
    id: 'm5-4',
    materialId: 'm5',
    urutan: 4,
    judul: 'Not Bertitik',
    deskripsi: 'Latihan pola dengan not bertitik dan tanda diam.',
    kind: 'rhythm',
    rhythm: {
      bpm: 76,
      beats: 4,
      subdivisions: 1,
      steps: ['D4', null, 'C4', 'E4'],
      countIn: 4,
    },
  },

  /* ---------------- Materi 6 · Gabungan (Lagu Mudah) ---------------- */
  {
    id: 'm6-1',
    materialId: 'm6',
    urutan: 1,
    judul: 'Pengenalan Gabungan',
    deskripsi: 'Gabungkan posisi not, nilai not, dan irama dalam satu latihan.',
    kind: 'intro',
  },
  {
    id: 'm6-2',
    materialId: 'm6',
    urutan: 2,
    judul: 'Lagu Pertama',
    deskripsi: 'Lagu mudah dengan nada C4–G4 dan pola irama sederhana.',
    kind: 'rhythm',
    rhythm: {
      bpm: 80,
      beats: 8,
      subdivisions: 1,
      steps: ['C4', 'D4', 'E4', 'C4', null, 'E4', 'D4', 'C4'],
      countIn: 4,
    },
  },
  {
    id: 'm6-3',
    materialId: 'm6',
    urutan: 3,
    judul: 'Lagu Kedua',
    deskripsi: 'Lagu mudah dengan variasi nilai not dan jeda.',
    kind: 'rhythm',
    rhythm: {
      bpm: 84,
      beats: 8,
      subdivisions: 1,
      steps: ['C4', 'E4', 'G4', 'E4', 'C4', null, 'D4', 'E4'],
      countIn: 4,
    },
  },
  {
    id: 'm6-4',
    materialId: 'm6',
    urutan: 4,
    judul: 'Lagu Ketiga',
    deskripsi: 'Gabungan lengkap materi 1, 2, dan 3 dalam lagu mudah.',
    kind: 'rhythm',
    rhythm: {
      bpm: 88,
      beats: 8,
      subdivisions: 2,
      steps: ['C4', null, 'D4', 'E4', 'G4', null, 'E4', 'D4', 'C4', null, 'D4', 'D4', 'E4', null, 'C4', null],
      countIn: 4,
    },
  },
];

/* ------------------------------------------------------------------
   Turunan & pembantu
   ------------------------------------------------------------------ */

export const TOTAL_LEVELS = EXTENDED_LEVELS.length;

/** Level kuis = semua level selain pengenalan. */
export const isQuizKind = (kind: LevelKind): boolean => kind !== 'intro';

export const QUIZ_LEVELS = EXTENDED_LEVELS.filter((level) => isQuizKind(level.kind));

export const TOTAL_QUIZ_LEVELS = QUIZ_LEVELS.length;

/** Bintang maksimum seluruh materi (hanya level kuis yang memberi bintang). */
export const TOTAL_STARS_MAX = TOTAL_QUIZ_LEVELS * 3;

export const levelsByMaterial = (materialId: MaterialId): ExtendedLevel[] =>
  EXTENDED_LEVELS.filter((item) => item.materialId === materialId).sort((a, b) => a.urutan - b.urutan);

export const getExtendedLevel = (id: string): ExtendedLevel | undefined =>
  EXTENDED_LEVELS.find((item) => item.id === id);

export const lastLevelOfMaterial = (materialId: MaterialId): ExtendedLevel | undefined => {
  const list = levelsByMaterial(materialId);
  return list[list.length - 1];
};

/** Level berikutnya di materi yang sama, atau null bila sudah level terakhir. */
export const nextLevelOf = (level: ExtendedLevel): ExtendedLevel | null =>
  levelsByMaterial(level.materialId).find((item) => item.urutan === level.urutan + 1) ?? null;

/** Bintang maksimum satu materi. */
export const starsMaxOfMaterial = (materialId: MaterialId): number =>
  levelsByMaterial(materialId).filter((level) => isQuizKind(level.kind)).length * 3;

/** Label level untuk judul & tombol: "Level 2". */
export const levelLabel = (level: ExtendedLevel): string => `Level ${level.urutan}`;

/** Baris kecil di bawah judul level pada path. */
export const levelSubtitle = (level: ExtendedLevel): string => {
  if (level.kind === 'rhythm' && level.rhythm) {
    return `${level.rhythm.bpm} BPM · ${level.rhythm.beats} ketukan${
      level.rhythm.subdivisions === 2 ? ' · not 1/8' : ''
    }`;
  }
  if (level.kind === 'position-quiz') {
    if (level.position?.mode === 'audio') return 'Latihan telinga';
    if (level.position?.mode === 'mixed') return 'Campuran · lihat & dengar';
    return 'Lihat not → tekan kotak';
  }
  if (level.kind === 'duration-quiz') return 'Pilihan ganda nilai not';
  if (level.kind === 'symbol-quiz') return 'Kenali tanda diam & tanda titik';
  return 'Pengenalan · tanpa kuis';
};

export interface LegendItem {
  key: string;
  label: string;
}

/** Panduan singkat yang tampil di bawah judul tiap path materi. */
export const MATERIAL_LEGENDS: Record<MaterialId, LegendItem[]> = {
  m1: [
    { key: 'Garis 1', label: 'F' },
    { key: 'Ruang 1', label: 'E' },
    { key: 'Garis 2', label: 'D' },
    { key: 'Ruang 2', label: 'C' },
    { key: 'Garis 4', label: 'G' },
  ],
  m2: [
    { key: '1/4', label: '1 ketukan' },
    { key: '1/2', label: '2 ketukan' },
    { key: '1/1', label: '4 ketukan' },
    { key: '1/8', label: '½ ketukan' },
  ],
  m3: [
    { key: 'Kotak nada', label: 'C · D · E · F · G' },
    { key: 'Ketukan', label: 'tekan tepat saat playhead menyentuh not' },
  ],
  m4: [
    { key: 'Garis atas', label: 'A · B' },
    { key: 'Ruang atas', label: 'C · D · E · F · G' },
    { key: 'Nada tinggi', label: 'A4 · B4 · C5 · D5 · E5 · F5 · G5' },
  ],
  m5: [
    { key: 'Tanda diam', label: 'Berhenti, jangan tekan' },
    { key: 'Tanda titik', label: 'Perpanjang nilai not' },
    { key: '½–4', label: 'Nilai ½, 1, 1½, 2, 4 ketukan' },
  ],
  m6: [
    { key: 'Gabungan', label: 'Posisi · Nilai · Irama' },
    { key: 'Nada', label: 'C · D · E · F · G' },
    { key: 'Lagu mudah', label: 'Terapkan dalam pola lagu' },
  ],
};

/** Konversi level irama ke bentuk yang dipakai mesin kuis ritme. */
export const toRhythmLevel = (level: ExtendedLevel): RhythmLevel => {
  const rhythm = level.rhythm;
  if (!rhythm) throw new Error(`Level ${level.id} bukan level irama`);
  return {
    id: level.id,
    judul: level.judul,
    deskripsi: level.deskripsi,
    bpm: rhythm.bpm,
    beats: rhythm.beats,
    subdivisions: rhythm.subdivisions,
    steps: rhythm.steps,
    countIn: rhythm.countIn,
  };
};
