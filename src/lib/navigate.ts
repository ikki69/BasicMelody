/**
 * Navigasi antar halaman dengan fade-out singkat (konsisten dengan CTA
 * landing). Tanpa JS, tautan <a href> tetap berfungsi karena hash-based.
 */
const FADE_MS = 300;

export const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

/** Pindah hash dengan animasi fade-out pada #root. */
export const navigateWithFade = (hash: string): void => {
  const target = hash.startsWith('#') ? hash : `#/${hash}`;

  if (prefersReducedMotion()) {
    window.location.hash = target;
    return;
  }

  document.documentElement.classList.add('page-leaving');
  window.setTimeout(() => {
    window.location.hash = target;
    document.documentElement.classList.remove('page-leaving');
  }, FADE_MS);
};

/**
 * Handler klik untuk <a>: hormati klik dengan modifier (buka tab/jendela baru).
 * Mengembalikan true bila klik sudah ditangani (perlu preventDefault oleh pemanggil).
 */
export const isPlainLeftClick = (e: React.MouseEvent<HTMLAnchorElement>): boolean =>
  !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0;
