/**
 * Daftar materi latihan.
 *
 * Tiap materi berisi beberapa level: level 1 selalu berupa pengenalan
 * (tanpa kuis/bintang), level 2 dan seterusnya berupa kuis. Daftar levelnya
 * ada di src/data/levelsExtended.ts.
 *
 * Pembukaan materi berurutan: materi berikutnya terbuka setelah level
 * terakhir materi sebelumnya tuntas.
 */
export type MaterialId = 'm1' | 'm2' | 'm3';

export interface Material {
  id: MaterialId;
  /** Nomor urutan materi (1-based). */
  urutan: number;
  judul: string;
  deskripsi: string;
  /** Deret singkat untuk kartu daftar materi. */
  ringkas: string;
}

export const MATERIALS: Material[] = [
  {
    id: 'm1',
    urutan: 1,
    judul: 'Mengenal Posisi Not',
    deskripsi: 'Kenali lima nada C, D, E, F, G dan posisinya pada paranada.',
    ringkas: 'C · D · E · F · G',
  },
  {
    id: 'm2',
    urutan: 2,
    judul: 'Nilai Not',
    deskripsi: 'Kenali nilai not: 1/4, 1/2, 1/1, dan 1/8.',
    ringkas: '1/4 · 1/2 · 1/1 · 1/8',
  },
  {
    id: 'm3',
    urutan: 3,
    judul: 'Irama',
    deskripsi: 'Latihan irama dengan tempo dan pola yang makin menantang.',
    ringkas: 'Tempo · Pola · Sinkopasi',
  },
];

export const getMaterialById = (id: string): Material | undefined =>
  MATERIALS.find((item) => item.id === id);

export const isMaterialId = (value: string): value is MaterialId =>
  MATERIALS.some((item) => item.id === value);
