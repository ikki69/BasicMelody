import { isMaterialId, type MaterialId } from '../data/materials';
import { LEVEL_HASH } from './intro';

/** Hash daftar materi: '#/level'. */
export const levelRootHash = `#/${LEVEL_HASH}`;

export interface LevelRoute {
  /** Materi yang sedang dibuka; null berarti daftar materi. */
  materiId: MaterialId | null;
}

/**
 * Baca segmen kedua hash halaman Level: '#/level/m2' → { materiId: 'm2' }.
 * Hash tak dikenal / tanpa segmen → daftar materi.
 */
export const parseLevelRoute = (hash: string): LevelRoute => {
  const clean = hash.replace(/^#\/?/, '').toLowerCase();
  const segments = clean.split('/');
  const materi = segments[1] ?? '';
  return { materiId: isMaterialId(materi) ? materi : null };
};

/** Hash untuk membuka sebuah materi (atau daftar materi bila tanpa argumen). */
export const levelHashFor = (materiId?: MaterialId | null): string =>
  materiId ? `${levelRootHash}/${materiId}` : levelRootHash;
