/**
 * Data dasar latihan nada & badge untuk halaman Level.
 *
 * Terpisah dari src/data/levels.ts (materi Introduction) supaya materi asli
 * tidak tersentuh. Lima kotak nada memakai rentang C4–G4, dan pola level
 * (lihat src/data/levelsExtended.ts) wajib memakai nada yang sama supaya
 * ketukan bisa dinilai tepat.
 *
 * Daftar level (materi → level) ada di src/data/levelsExtended.ts.
 */

/** Nada yang bisa ditekan pemain (5 kotak). */
export type PadNote = 'C4' | 'D4' | 'E4' | 'F4' | 'G4';

export interface RhythmPad {
  note: PadNote;
  /** Huruf besar yang tampil di kotak. */
  label: string;
  /** Tombol keyboard untuk menekan kotak ini. */
  key: string;
  /** Posisi y not pada viewBox paranada (0 0 400 196). */
  y: number;
  /** Nama posisi di paranada, untuk umpan balik. */
  posisi: string;
  /**
   * Not jatuh di luar paranada sehingga butuh garis bantu (ledger).
   * D4 masih di ruang bawah staf → tidak perlu; hanya C4 yang butuh.
   */
  ledger?: boolean;
}

/**
 * Kotak nada: C D E F G. Urutan tampil dari kiri ke kanan mengikuti huruf.
 * Mapping disamakan ke rentang C4–G4: G4 (garis 4, y=105), F4 (ruang 4, y=117.5),
 * E4 (garis 5, y=130), D4 (ruang bawah staf, y=142.5), C4 (bawah staf, y=155) – perlu ledger line.
 */
export const RHYTHM_PADS: RhythmPad[] = [
  { note: 'C4', label: 'C', key: 'c', y: 155, posisi: 'Garis bantu bawah', ledger: true },
  { note: 'D4', label: 'D', key: 'd', y: 142.5, posisi: 'Ruang di bawah staf' },
  { note: 'E4', label: 'E', key: 'e', y: 130, posisi: 'Garis 5' },
  { note: 'F4', label: 'F', key: 'f', y: 117.5, posisi: 'Ruang 4' },
  { note: 'G4', label: 'G', key: 'g', y: 105, posisi: 'Garis 4' },
];

export const padFor = (note: PadNote): RhythmPad =>
  RHYTHM_PADS.find((pad) => pad.note === note) ?? RHYTHM_PADS[0];

/* ------------------------------------------------------------------
   Achievement / badge
   ------------------------------------------------------------------ */

export type BadgeIcon = 'note' | 'rest' | 'step' | 'leap' | 'fast' | 'crown' | 'spark' | 'medal' | 'trophy';

export interface Achievement {
  id: string;
  nama: string;
  deskripsi: string;
  ikon: BadgeIcon;
  /** 'level' → diraih otomatis saat level tuntas; 'spesial' → syarat khusus. */
  jenis: 'level' | 'spesial';
}

/**
 * Badge: satu untuk tiap level (id badge = id level, mis. 'm1-2') plus tiga
 * badge spesial. Nama badge irama dipertahankan dari versi sebelumnya.
 */
export const ACHIEVEMENTS: Achievement[] = [
  /* --- Materi 1 · Mengenal Posisi Not --- */
  {
    id: 'm1-1',
    nama: 'Pengenal Nada',
    deskripsi: 'Menyelesaikan pengenalan posisi not C, D, E, F, G.',
    ikon: 'spark',
    jenis: 'level',
  },
  {
    id: 'm1-2',
    nama: 'Mata Paranada',
    deskripsi: 'Menuntaskan kuis melihat not lalu menekan kotak nada.',
    ikon: 'note',
    jenis: 'level',
  },
  {
    id: 'm1-3',
    nama: 'Telinga Emas',
    deskripsi: 'Menuntaskan kuis latihan telinga (hanya mendengar nada).',
    ikon: 'medal',
    jenis: 'level',
  },
  {
    id: 'm1-4',
    nama: 'Detektif Nada',
    deskripsi: 'Menuntaskan kuis campuran posisi not.',
    ikon: 'trophy',
    jenis: 'level',
  },

  /* --- Materi 2 · Nilai Not --- */
  {
    id: 'm2-1',
    nama: 'Pengenal Nilai',
    deskripsi: 'Menyelesaikan pengenalan nilai not.',
    ikon: 'note',
    jenis: 'level',
  },
  {
    id: 'm2-2',
    nama: 'Hitung Ketukan',
    deskripsi: 'Menuntaskan kuis "not ini berapa ketukan".',
    ikon: 'note',
    jenis: 'level',
  },
  {
    id: 'm2-3',
    nama: 'Cepat Menghitung',
    deskripsi: 'Menuntaskan latihan menghitung nilai not.',
    ikon: 'fast',
    jenis: 'level',
  },
  {
    id: 'm2-4',
    nama: 'Ahli Nilai Not',
    deskripsi: 'Menuntaskan kuis semua nilai not.',
    ikon: 'spark',
    jenis: 'level',
  },

  /* --- Materi 3 · Irama --- */
  {
    id: 'm3-1',
    nama: 'Pengenal Irama',
    deskripsi: 'Menyelesaikan pengenalan ketukan dan tempo.',
    ikon: 'step',
    jenis: 'level',
  },
  {
    id: 'm3-2',
    nama: 'Ketukan Pertama',
    deskripsi: 'Menuntaskan level irama pertama: Langkah Pertama.',
    ikon: 'note',
    jenis: 'level',
  },
  {
    id: 'm3-3',
    nama: 'Tahu Jeda',
    deskripsi: 'Menuntaskan level irama dengan satu istirahat.',
    ikon: 'rest',
    jenis: 'level',
  },
  {
    id: 'm3-4',
    nama: 'Naik Turun',
    deskripsi: 'Menuntaskan level irama dengan melodi naik-turun.',
    ikon: 'step',
    jenis: 'level',
  },
  {
    id: 'm3-5',
    nama: 'Lompatan G',
    deskripsi: 'Menuntaskan level irama dan menguasai lompatan nada G.',
    ikon: 'leap',
    jenis: 'level',
  },
  {
    id: 'm3-6',
    nama: 'Ketukan Rapat',
    deskripsi: 'Menuntaskan level irama dengan not 1/8.',
    ikon: 'fast',
    jenis: 'level',
  },
  {
    id: 'm3-7',
    nama: 'Penutup',
    deskripsi: 'Menuntaskan level irama tersulit: Sinkopasi.',
    ikon: 'crown',
    jenis: 'level',
  },

  /* --- Spesial --- */
  {
    id: 'special-first',
    nama: 'Pola Pertama',
    deskripsi: 'Menuntaskan level pertamamu.',
    ikon: 'spark',
    jenis: 'spesial',
  },
  {
    id: 'special-crown',
    nama: 'Tanpa Miss',
    deskripsi: 'Meraih 3 bintang pertama tanpa satu pun kesalahan.',
    ikon: 'medal',
    jenis: 'spesial',
  },
  {
    id: 'special-master',
    nama: 'Maestro',
    deskripsi: 'Meraih 3 bintang di seluruh level kuis.',
    ikon: 'trophy',
    jenis: 'spesial',
  },
];

export const achievementById = (id: string): Achievement | undefined =>
  ACHIEVEMENTS.find((item) => item.id === id);

/* ------------------------------------------------------------------
   Level irama (dipakai mesin kuis ritme)
   ------------------------------------------------------------------ */

export interface RhythmLevel {
  id: string;
  judul: string;
  deskripsi: string;
  /** Tempo dalam ketukan per menit. */
  bpm: number;
  /** Jumlah ketukan dalam satu pola (birama 4/4). */
  beats: number;
  /** Subdivisi per ketukan: 1 = not 1/4, 2 = ada not 1/8. */
  subdivisions: 1 | 2;
  /** Slot grid pola; null = istirahat. Panjang = beats * subdivisions. */
  steps: (PadNote | null)[];
  /** Jumlah ketukan hitung-masuk sebelum pola dimulai. */
  countIn: number;
}
