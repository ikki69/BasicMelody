export interface NoteLevel {
  /** Urutan pada slider: 0 (paling atas) – 8 (paling bawah). */
  index: number;
  /** Koordinat y not di dalam viewBox SVG paranada (0 0 400 160). */
  y: number;
  kind: 'garis' | 'ruang';
  /** Teks yang tampil di #pitch-info. */
  label: string;
  /** Nama nada untuk Tone.js. */
  note: string;
}

/**
 * 9 posisi not pada paranada: 5 garis (y 30–130, jarak 25) dan
 * 4 ruang di antaranya. Penomoran garis mengikuti tampilan dari atas ke bawah.
 */
export const NOTE_LEVELS: NoteLevel[] = [
  { index: 0, y: 30, kind: 'garis', label: 'Garis 1 - Nada Tinggi', note: 'F5' },
  { index: 1, y: 42.5, kind: 'ruang', label: 'Ruang 1 - Nada Tinggi', note: 'E5' },
  { index: 2, y: 55, kind: 'garis', label: 'Garis 2 - Nada Tinggi', note: 'D5' },
  { index: 3, y: 67.5, kind: 'ruang', label: 'Ruang 2 - Nada Sedang', note: 'C5' },
  { index: 4, y: 80, kind: 'garis', label: 'Garis 3 - Nada Sedang', note: 'B4' },
  { index: 5, y: 92.5, kind: 'ruang', label: 'Ruang 3 - Nada Sedang', note: 'A4' },
  { index: 6, y: 105, kind: 'garis', label: 'Garis 4 - Nada Rendah', note: 'G4' },
  { index: 7, y: 117.5, kind: 'ruang', label: 'Ruang 4 - Nada Rendah', note: 'F4' },
  { index: 8, y: 130, kind: 'garis', label: 'Garis 5 - Nada Rendah', note: 'E4' },
];

/** Nilai awal slider (paling bawah, sesuai markup asal value="8"). */
export const DEFAULT_LEVEL_INDEX = 8;
