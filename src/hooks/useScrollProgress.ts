import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollProgress {
  progress: number; // 0-1
  scrollY: number;
  maxScroll: number;
  velocity: number;
  direction: 'up' | 'down' | 'none';
}

export const useScrollProgress = () => {
  const [progress, setProgress] = useState<ScrollProgress>({
    progress: 0,
    scrollY: 0,
    maxScroll: 0,
    velocity: 0,
    direction: 'none',
  });

  const lastScrollYRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
      const now = performance.now();
      const deltaTime = now - lastTimeRef.current;
      const velocity = deltaTime > 0 ? (scrollY - lastScrollYRef.current) / deltaTime : 0;
      const direction = scrollY > lastScrollYRef.current ? 'down' : scrollY < lastScrollYRef.current ? 'up' : 'none';

      lastScrollYRef.current = scrollY;
      lastTimeRef.current = now;

      // Hindari re-render berlebihan: hanya update bila progress berubah cukup.
      setProgress((prev) => {
        if (Math.abs(prev.progress - currentProgress) < 0.0005) return prev;
        return { progress: currentProgress, scrollY, maxScroll, velocity, direction };
      });
    };

    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateProgress();
      });
    };

    // Initial calculation
    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Also listen to ScrollTrigger refresh
    ScrollTrigger.addEventListener('refresh', updateProgress);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ScrollTrigger.removeEventListener('refresh', updateProgress);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { ...progress };
};