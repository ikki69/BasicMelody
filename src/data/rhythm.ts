/**
 * Data dasar latihan nada & badge untuk halaman Level.
 *
 * Terpisah dari src/data/levels.ts (materi Introduction) supaya materi asli
 * tidak tersentuh. Kotak nada memakai rentang penuh C4–G5; tiap level bisa
 * membatasi nada yang dipakai lewat `ExtendedLevel.notes`
 * (lihat src/data/levelsExtended.ts). Pola irama hanya boleh memakai nada
 * yang tersedia pada levelnya.
 *
 * Daftar level (materi → level) ada di src/data/levelsExtended.ts.
 */

/** Nada yang bisa ditekan pemain. */
export type PadNote =
  | 'C4'
  | 'D4'
  | 'E4'
  | 'F4'
  | 'G4'
  | 'A4'
  | 'B4'
  | 'C5'
  | 'D5'
  | 'E5'
  | 'F5'
  | 'G5';

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
 * Kotak nada: C D E F G + A4 B4 C5 D5 E5 F5 G5.
 * Mapping mengikuti posisi pada paranada (viewBox 400x196).
 */
export const RHYTHM_PADS: RhythmPad[] = [
  { note: 'C4', label: 'C', key: 'c', y: 155, posisi: 'Garis bantu bawah', ledger: true },
  { note: 'D4', label: 'D', key: 'd', y: 142.5, posisi: 'Ruang di bawah staf' },
  { note: 'E4', label: 'E', key: 'e', y: 130, posisi: 'Garis 5' },
  { note: 'F4', label: 'F', key: 'f', y: 117.5, posisi: 'Ruang 4' },
  { note: 'G4', label: 'G', key: 'g', y: 105, posisi: 'Garis 4' },
  { note: 'A4', label: 'A', key: 'a', y: 92.5, posisi: 'Ruang 3' },
  { note: 'B4', label: 'B', key: 'b', y: 80, posisi: 'Garis 3' },
  { note: 'C5', label: 'C', key: '1', y: 67.5, posisi: 'Ruang 2' },
  { note: 'D5', label: 'D', key: '2', y: 55, posisi: 'Garis 2' },
  { note: 'E5', label: 'E', key: '3', y: 42.5, posisi: 'Ruang 1' },
  { note: 'F5', label: 'F', key: '4', y: 30, posisi: 'Garis 1' },
  { note: 'G5', label: 'G', key: '5', y: 17.5, posisi: 'Garis bantu atas', ledger: true },
];

/** Semua nada kotak nada, dari rendah ke tinggi (C4–G5). */
export const ALL_PAD_NOTES: PadNote[] = RHYTHM_PADS.map((pad) => pad.note);

/** Nada rendah–tengah yang dipakai Materi 1: C4–G4. */
export const LOW_PAD_NOTES: PadNote[] = ['C4', 'D4', 'E4', 'F4', 'G4'];

/**
 * Kotak nada untuk daftar nada tertentu, urut sesuai posisi pada paranada.
 * Tanpa argumen → semua nada C4–G5.
 */
export const padsFor = (notes?: readonly PadNote[]): RhythmPad[] => {
  if (notes === undefined) return RHYTHM_PADS;
  const wanted = new Set(notes);
  return RHYTHM_PADS.filter((pad) => wanted.has(pad.note));
};

/** Nada unik yang dipakai sebuah pola irama, urut dari rendah ke tinggi. */
export const notesOfPattern = (steps: readonly (PadNote | null)[]): PadNote[] => {
  const used = new Set(steps.filter((step): step is PadNote => step !== null));
  return RHYTHM_PADS.filter((pad) => used.has(pad.note)).map((pad) => pad.note);
};

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

  /* --- Materi 4 · Not C4–G5 --- */
  {
    id: 'm4-1',
    nama: 'Pengenal Dua Oktaf',
    deskripsi: 'Menyelesaikan pengenalan nada C4–G5.',
    ikon: 'spark',
    jenis: 'level',
  },
  {
    id: 'm4-2',
    nama: 'Mata Paranada',
    deskripsi: 'Menuntaskan kuis melihat not C4–G5 lalu menekan kotak nada.',
    ikon: 'note',
    jenis: 'level',
  },
  {
    id: 'm4-3',
    nama: 'Telinga Tajam',
    deskripsi: 'Menuntaskan kuis latihan telinga nada C4–G5.',
    ikon: 'medal',
    jenis: 'level',
  },
  {
    id: 'm4-4',
    nama: 'Penjelajah Nada',
    deskripsi: 'Menuntaskan kuis campuran nada C4–G5.',
    ikon: 'trophy',
    jenis: 'level',
  },

  /* --- Materi 5 · Tanda Diam dan Tanda Titik --- */
  {
    id: 'm5-1',
    nama: 'Pengenal Jeda',
    deskripsi: 'Menyelesaikan pengenalan tanda diam dan tanda titik.',
    ikon: 'rest',
    jenis: 'level',
  },
  {
    id: 'm5-2',
    nama: 'Baca Simbol',
    deskripsi: 'Menuntaskan kuis mengenali tanda diam dan not bertitik.',
    ikon: 'note',
    jenis: 'level',
  },
  {
    id: 'm5-3',
    nama: 'Jeda Tepat',
    deskripsi: 'Menuntaskan latihan irama dengan tanda diam.',
    ikon: 'step',
    jenis: 'level',
  },
  {
    id: 'm5-4',
    nama: 'Tanda Titik',
    deskripsi: 'Menuntaskan latihan irama dengan not bertitik.',
    ikon: 'spark',
    jenis: 'level',
  },

  /* --- Materi 6 · Gabungan (Lagu Mudah) --- */
  {
    id: 'm6-1',
    nama: 'Pengenal Gabungan',
    deskripsi: 'Menyelesaikan pengenalan materi gabungan.',
    ikon: 'step',
    jenis: 'level',
  },
  {
    id: 'm6-2',
    nama: 'Lagu Pertama',
    deskripsi: 'Menuntaskan lagu mudah pertama.',
    ikon: 'note',
    jenis: 'level',
  },
  {
    id: 'm6-3',
    nama: 'Lagu Kedua',
    deskripsi: 'Menuntaskan lagu mudah kedua.',
    ikon: 'leap',
    jenis: 'level',
  },
  {
    id: 'm6-4',
    nama: 'Lagu Ketiga',
    deskripsi: 'Menuntaskan lagu gabungan mudah ketiga.',
    ikon: 'crown',
    jenis: 'level',
  },

  /* --- Materi 7 · Gabungan Posisi Not & Tanda Diam --- */
  {
    id: 'm7-1',
    nama: 'Pengenal Gabungan',
    deskripsi: 'Menyelesaikan pengenalan posisi not dan tanda diam.',
    ikon: 'spark',
    jenis: 'level',
  },
  {
    id: 'm7-2',
    nama: 'Baca Simbol',
    deskripsi: 'Menuntaskan kuis mengenali tanda diam dan not bertitik.',
    ikon: 'note',
    jenis: 'level',
  },
  {
    id: 'm7-3',
    nama: 'Posisi & Jeda',
    deskripsi: 'Menuntaskan kuis posisi not C4–G4.',
    ikon: 'medal',
    jenis: 'level',
  },
  {
    id: 'm7-4',
    nama: 'Jeda Tepat',
    deskripsi: 'Menuntaskan irama dengan tanda diam.',
    ikon: 'rest',
    jenis: 'level',
  },
  {
    id: 'm7-5',
    nama: 'Titik & Ketukan',
    deskripsi: 'Menuntaskan irama dengan tanda diam dan not bertitik.',
    ikon: 'step',
    jenis: 'level',
  },

  /* --- Materi 8 · Gabungan Nilai Not & Lagu --- */
  {
    id: 'm8-1',
    nama: 'Pengenal Nilai & Lagu',
    deskripsi: 'Menyelesaikan pengenalan nilai not dan lagu.',
    ikon: 'note',
    jenis: 'level',
  },
  {
    id: 'm8-2',
    nama: 'Hitung Ketukan',
    deskripsi: 'Menuntaskan kuis nilai not dasar.',
    ikon: 'step',
    jenis: 'level',
  },
  {
    id: 'm8-3',
    nama: 'Cepat Menghitung',
    deskripsi: 'Menuntaskan latihan menghitung nilai not.',
    ikon: 'fast',
    jenis: 'level',
  },
  {
    id: 'm8-4',
    nama: 'Lagu Nilai Not I',
    deskripsi: 'Menuntaskan lagu mudah pertama dengan nilai not.',
    ikon: 'leap',
    jenis: 'level',
  },
  {
    id: 'm8-5',
    nama: 'Lagu Nilai Not II',
    deskripsi: 'Menuntaskan lagu mudah dengan not 1/8 dan tanda diam.',
    ikon: 'crown',
    jenis: 'level',
  },

  /* --- Materi 9 · Lagu Medium (Gabungan) --- */
  {
    id: 'm9-1',
    nama: 'Pengenal Lagu Medium',
    deskripsi: 'Menyelesaikan pengenalan lagu medium gabungan.',
    ikon: 'spark',
    jenis: 'level',
  },
  {
    id: 'm9-2',
    nama: 'Mata Paranada',
    deskripsi: 'Menuntaskan kuis posisi nada C4–G5.',
    ikon: 'note',
    jenis: 'level',
  },
  {
    id: 'm9-3',
    nama: 'Ahli Nilai Not',
    deskripsi: 'Menuntaskan kuis semua nilai not pada materi lagu medium.',
    ikon: 'medal',
    jenis: 'level',
  },
  {
    id: 'm9-4',
    nama: 'Baca Simbol',
    deskripsi: 'Menuntaskan kuis tanda diam dan not bertitik.',
    ikon: 'rest',
    jenis: 'level',
  },
  {
    id: 'm9-5',
    nama: 'Lagu Medium I',
    deskripsi: 'Menuntaskan lagu medium pertama.',
    ikon: 'leap',
    jenis: 'level',
  },
  {
    id: 'm9-6',
    nama: 'Lagu Medium II',
    deskripsi: 'Menuntaskan lagu medium penutup.',
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
