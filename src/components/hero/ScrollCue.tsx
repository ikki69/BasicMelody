import type { MouseEvent } from 'react';

/**
 * Penanda gulir di dasar hero. Klik = gulir halus ke babak berikutnya
 * (`#section-2`, Manifesto). Bila Lenis sedang aktif, gulirnya diserahkan ke
 * Lenis supaya tidak melawan gulir halus halaman; tanpa Lenis (mis. gerak
 * berkurang) dipakai `scrollIntoView` bawaan peramban.
 */
export const ScrollCue = () => {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const next = document.getElementById('section-2');
    if (!next) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(next, reduceMotion ? { immediate: true } : { duration: 1.1 });
      return;
    }

    next.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <a
      className="hero-scroll"
      href="#section-2"
      onClick={handleClick}
      aria-label="Gulir ke bagian berikutnya"
    >
      <span className="hero-scroll__label">Jelajahi</span>
      <span className="hero-scroll__arrow" aria-hidden="true">
        <svg viewBox="0 0 18 24" width="18" height="24" fill="none">
          <path d="M9 2.5v16M2.5 12l6.5 6.5 6.5-6.5" />
        </svg>
      </span>
    </a>
  );
};
