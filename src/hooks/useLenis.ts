import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';

interface UseLenisOptions {
  lerp?: number;
  duration?: number;
  smoothWheel?: boolean;
  syncTouch?: boolean;
  touchMultiplier?: number;
  wheelMultiplier?: number;
}

/**
 * Membuat instance Lenis tanpa RAF internal.
 * RAF dijalankan oleh gsap.ticker di App agar sinkron dengan ScrollTrigger.
 */
export const useLenis = (options: UseLenisOptions = {}) => {
  const lenisRef = useRef<Lenis | null>(null);

  const {
    lerp = 0.1,
    duration = 1.2,
    smoothWheel = true,
    syncTouch = false,
    touchMultiplier = 2,
    wheelMultiplier = 1,
  } = options;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp,
      duration,
      smoothWheel,
      syncTouch,
      touchMultiplier,
      wheelMultiplier,
      infinite: false,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [lerp, duration, smoothWheel, syncTouch, touchMultiplier, wheelMultiplier]);

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      scrollOptions?: { offset?: number; immediate?: boolean; duration?: number; lock?: boolean }
    ) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, scrollOptions);
      } else {
        // Fallback native
        if (typeof target === 'string') {
          document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: target, behavior: 'smooth' });
        }
      }
    },
    []
  );

  const getLenis = useCallback(() => lenisRef.current, []);
  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);

  return {
    getLenis,
    scrollTo,
    stop,
    start,
  };
};