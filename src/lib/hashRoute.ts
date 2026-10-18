import type { MaterialId } from '../data/materials';
import { INTRODUCTION_HASH, LEVEL_HASH } from './intro';
import { parseLevelRoute } from './levelRoute';

export type Route =
  | { name: 'landing' }
  | { name: 'introduction' }
  | { name: 'level'; materiId: MaterialId | null };

/** Router mini berbasis hash. Tanpa dependency tambahan, aman di hosting statis. */
export const readRoute = (): Route => {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (hash === INTRODUCTION_HASH) return { name: 'introduction' };
  if (hash === LEVEL_HASH || hash.startsWith(`${LEVEL_HASH}/`)) {
    return { name: 'level', materiId: parseLevelRoute(window.location.hash).materiId };
  }
  return { name: 'landing' };
};

/**
 * Path "gaya URL" untuk sebuah route.
 *
 * Dipakai untuk mencocokkan daftar route yang dikecualikan (mis. landing) tanpa
 * harus tahu detail router hash. Hash tak dikenal tetap dipetakan ke '/' karena
 * memang menampilkan landing.
 */
export const routePath = (route: Route): string => {
  if (route.name === 'introduction') return '/introduction';
  if (route.name === 'level') return route.materiId ? `/${LEVEL_HASH}/${route.materiId}` : `/${LEVEL_HASH}`;
  return '/';
};
