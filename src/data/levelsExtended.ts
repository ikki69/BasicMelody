import type { MaterialId } from './materials';
import { ALL_PAD_NOTES, LOW_PAD_NOTES, type PadNote, type RhythmLevel } from './rhythm';

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
  /**
   * Nada yang dipakai level ini. Tanpa isian = semua nada C4–G5.
   * Materi 1 dibatasi C4–G4, Materi 4 memakai rentang penuh.
   */
  notes?: PadNote[];
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
    deskripsi: 'Kenali lima nada C4, D4, E4, F4, G4 dan posisinya pada paranada.',
    kind: 'intro',
    notes: LOW_PAD_NOTES,
  },
  {
    id: 'm1-2',
    materialId: 'm1',
    urutan: 2,
    judul: 'Lihat lalu Tekan',
    deskripsi: 'Not C4–G4 muncul di paranada. Tekan kotak nada yang benar.',
    kind: 'position-quiz',
    notes: LOW_PAD_NOTES,
    position: { mode: 'visual', count: 8 },
  },
  {
    id: 'm1-3',
    materialId: 'm1',
    urutan: 3,
    judul: 'Latihan Telinga',
    deskripsi: 'Nada C4–G4 hanya terdengar. Tebak kotak nadanya tanpa melihat paranada.',
    kind: 'position-quiz',
    notes: LOW_PAD_NOTES,
    position: { mode: 'audio', count: 8 },
  },
  {
    id: 'm1-4',
    materialId: 'm1',
    urutan: 4,
    judul: 'Campuran Nada',
    deskripsi: 'Campuran soal melihat dan mendengar nada C4–G4 dengan tempo tetap.',
    kind: 'position-quiz',
    notes: LOW_PAD_NOTES,
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

  /* ---------------- Materi 4 · Not C4–G5 ---------------- */
  {
    id: 'm4-1',
    materialId: 'm4',
    urutan: 1,
    judul: 'Pengenalan Not C4–G5',
    deskripsi: 'Kenali nada dari C4 sampai G5 dan posisinya pada paranada.',
    kind: 'intro',
    notes: ALL_PAD_NOTES,
  },
  {
    id: 'm4-2',
    materialId: 'm4',
    urutan: 2,
    judul: 'Lihat lalu Tekan',
    deskripsi: 'Not dari C4 sampai G5 muncul di paranada. Tekan kotak nada yang benar.',
    kind: 'position-quiz',
    notes: ALL_PAD_NOTES,
    position: { mode: 'visual', count: 8 },
  },
  {
    id: 'm4-3',
    materialId: 'm4',
    urutan: 3,
    judul: 'Latihan Telinga',
    deskripsi: 'Nada C4–G5 hanya terdengar. Tebak kotak nadanya tanpa melihat paranada.',
    kind: 'position-quiz',
    notes: ALL_PAD_NOTES,
    position: { mode: 'audio', count: 8 },
  },
  {
    id: 'm4-4',
    materialId: 'm4',
    urutan: 4,
    judul: 'Campuran Nada',
    deskripsi: 'Campuran soal melihat dan mendengar seluruh nada C4–G5 dengan tempo tetap.',
    kind: 'position-quiz',
    notes: ALL_PAD_NOTES,
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

  /* ---------------- Materi 7 · Gabungan Posisi Not & Tanda Diam ---------------- */
  {
    id: 'm7-1',
    materialId: 'm7',
    urutan: 1,
    judul: 'Pengenalan Gabungan',
    deskripsi: 'Ulangi posisi not C4–G4 sambil mengenali tanda diam dan not bertitik.',
    kind: 'intro',
    notes: LOW_PAD_NOTES,
  },
  {
    id: 'm7-2',
    materialId: 'm7',
    urutan: 2,
    judul: 'Baca Simbol',
    deskripsi: 'Tentukan nilai tanda diam dan not bertitik yang ditampilkan.',
    kind: 'symbol-quiz',
    symbol: { count: 8, type: 'mix' },
  },
  {
    id: 'm7-3',
    materialId: 'm7',
    urutan: 3,
    judul: 'Posisi & Jeda',
    deskripsi: 'Not C4–G4 muncul di paranada. Tekan kotak nada yang benar.',
    kind: 'position-quiz',
    notes: LOW_PAD_NOTES,
    position: { mode: 'visual', count: 8 },
  },
  {
    id: 'm7-4',
    materialId: 'm7',
    urutan: 4,
    judul: 'Irama Bertanda Diam',
    deskripsi: 'Mainkan pola C4–G4 sambil berhenti tepat pada tanda diam.',
    kind: 'rhythm',
    notes: LOW_PAD_NOTES,
    rhythm: {
      bpm: 76,
      beats: 8,
      subdivisions: 1,
      steps: ['C4', 'D4', null, 'E4', 'G4', null, 'F4', 'E4'],
      countIn: 4,
    },
  },
  {
    id: 'm7-5',
    materialId: 'm7',
    urutan: 5,
    judul: 'Not Bertitik & Jeda',
    deskripsi: 'Pola lebih rapat dengan tanda diam dan not bertitik.',
    kind: 'rhythm',
    notes: LOW_PAD_NOTES,
    rhythm: {
      bpm: 80,
      beats: 8,
      subdivisions: 2,
      steps: ['C4', null, 'D4', 'E4', null, 'G4', null, 'E4', 'D4', null, 'F4', 'E4', null, 'C4', null, null],
      countIn: 4,
    },
  },

  /* ---------------- Materi 8 · Gabungan Nilai Not & Lagu ---------------- */
  {
    id: 'm8-1',
    materialId: 'm8',
    urutan: 1,
    judul: 'Pengenalan Nilai Not & Lagu',
    deskripsi: 'Ulangi nilai not 1/4, 1/2, 1/1, dan 1/8 sebelum memainkan lagu.',
    kind: 'intro',
  },
  {
    id: 'm8-2',
    materialId: 'm8',
    urutan: 2,
    judul: 'Nilai Not Dasar',
    deskripsi: 'Tentukan berapa ketukan nilai not yang ditampilkan.',
    kind: 'duration-quiz',
    duration: { count: 8 },
  },
  {
    id: 'm8-3',
    materialId: 'm8',
    urutan: 3,
    judul: 'Hitung Nilai Not',
    deskripsi: 'Latihan menghitung nilai not dengan lebih banyak soal.',
    kind: 'duration-quiz',
    duration: { count: 12 },
  },
  {
    id: 'm8-4',
    materialId: 'm8',
    urutan: 4,
    judul: 'Lagu Nilai Not I',
    deskripsi: 'Terapkan nilai not dalam lagu mudah bernada C4–G4.',
    kind: 'rhythm',
    notes: LOW_PAD_NOTES,
    rhythm: {
      bpm: 84,
      beats: 8,
      subdivisions: 1,
      steps: ['C4', 'E4', 'G4', 'E4', 'C4', null, 'D4', 'E4'],
      countIn: 4,
    },
  },
  {
    id: 'm8-5',
    materialId: 'm8',
    urutan: 5,
    judul: 'Lagu Nilai Not II',
    deskripsi: 'Lagu mudah dengan campuran not 1/4, not 1/8, dan tanda diam.',
    kind: 'rhythm',
    notes: LOW_PAD_NOTES,
    rhythm: {
      bpm: 88,
      beats: 8,
      subdivisions: 2,
      steps: ['C4', null, 'D4', 'E4', 'G4', null, 'E4', 'D4', 'C4', null, 'E4', 'D4', null, 'C4', null, null],
      countIn: 4,
    },
  },

  /* ---------------- Materi 9 · Lagu Medium (Gabungan) ---------------- */
  {
    id: 'm9-1',
    materialId: 'm9',
    urutan: 1,
    judul: 'Pengenalan Lagu Medium',
    deskripsi: 'Gabungan posisi not, nilai not, irama, tanda diam, dan lagu dalam satu tantangan.',
    kind: 'intro',
    notes: ALL_PAD_NOTES,
  },
  {
    id: 'm9-2',
    materialId: 'm9',
    urutan: 2,
    judul: 'Posisi Not C4–G5',
    deskripsi: 'Campuran soal melihat dan mendengar nada C4–G5.',
    kind: 'position-quiz',
    notes: ALL_PAD_NOTES,
    position: { mode: 'mixed', count: 8 },
  },
  {
    id: 'm9-3',
    materialId: 'm9',
    urutan: 3,
    judul: 'Nilai Not',
    deskripsi: 'Ulangi semua nilai not sebelum memainkan lagu medium.',
    kind: 'duration-quiz',
    duration: { count: 8 },
  },
  {
    id: 'm9-4',
    materialId: 'm9',
    urutan: 4,
    judul: 'Tanda Diam & Titik',
    deskripsi: 'Kenali kembali tanda diam dan not bertitik dalam satu kuis.',
    kind: 'symbol-quiz',
    symbol: { count: 8, type: 'mix' },
  },
  {
    id: 'm9-5',
    materialId: 'm9',
    urutan: 5,
    judul: 'Lagu Medium I',
    deskripsi: 'Lagu medium pertama dengan nada C4–G5, not 1/8, dan tanda diam.',
    kind: 'rhythm',
    notes: ALL_PAD_NOTES,
    rhythm: {
      bpm: 92,
      beats: 8,
      subdivisions: 2,
      steps: ['C4', null, 'E4', 'G4', 'A4', null, 'G4', 'E4', 'D4', null, 'E4', 'F4', 'G4', null, 'E4', null],
      countIn: 4,
    },
  },
  {
    id: 'm9-6',
    materialId: 'm9',
    urutan: 6,
    judul: 'Lagu Medium II',
    deskripsi: 'Lagu medium penutup dengan melodi naik-turun dan tempo lebih cepat.',
    kind: 'rhythm',
    notes: ALL_PAD_NOTES,
    rhythm: {
      bpm: 100,
      beats: 8,
      subdivisions: 2,
      steps: ['E4', 'G4', 'A4', null, 'G4', 'E4', 'D4', null, 'C4', 'D4', 'E4', 'G4', null, 'A4', 'G4', null],
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
    { key: 'C4', label: 'garis bantu bawah' },
    { key: 'D4', label: 'ruang di bawah staf' },
    { key: 'E4', label: 'garis 5' },
    { key: 'F4', label: 'ruang 4' },
    { key: 'G4', label: 'garis 4' },
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
    { key: 'C4–G4', label: 'nada rendah–tengah' },
    { key: 'A4–G5', label: 'nada tinggi' },
    { key: '12 kotak', label: 'semua nada C4–G5' },
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
  m7: [
    { key: 'Posisi not', label: 'C4–G4 pada paranada' },
    { key: 'Tanda diam', label: 'Berhenti, jangan tekan' },
    { key: 'Not bertitik', label: 'Nilai not + setengahnya' },
  ],
  m8: [
    { key: 'Nilai not', label: '1/4 · 1/2 · 1/1 · 1/8' },
    { key: 'Lagu', label: 'C4–G4 dalam pola irama' },
    { key: 'Gabungan', label: 'Nilai not diterapkan saat bermain' },
  ],
  m9: [
    { key: 'Posisi', label: 'semua nada C4–G5' },
    { key: 'Nilai & simbol', label: 'not, tanda diam, tanda titik' },
    { key: 'Lagu medium', label: 'pola lebih panjang dan cepat' },
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
