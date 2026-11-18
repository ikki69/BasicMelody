import type Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
    /** Alat bantu Console: reset seluruh progres ke 0. */
    resetProgress?: () => void;
    /** Alat bantu Console: buka semua materi & level. */
    fullProgress?: () => void;
  }
}

export {};