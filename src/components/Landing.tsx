import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Labs } from './Basicmelody';
import { Manifesto } from './Manifesto';
import { Showcase } from './Showcase';
import { FinalCta } from './FinalCta';

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing page: empat babak warna yang berurutan —
 * periwinkle (kata pembuka) → sand (pernyataan) → near-black (tiga langkah)
 * → pink (penutup). Tiap babak membawa satu gambar nyata dan satu gagasan.
 *
 * Halaman ini sengaja TIDAK memasang smooth-scroll (Lenis): gulirnya gulir
 * bawaan peramban, jadi tetap bekerja tanpa JavaScript, dengan roda tetikus
 * biasa, dengan keyboard, dan dengan pembaca layar. GSAP ScrollTrigger cukup
 * dipakai untuk pin di babak tiga.
 */
export const Landing = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // ---- prefers-reduced-motion ----
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setPrefersReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // ---- Refresh ScrollTrigger setelah font & gambar stabil ----
  useEffect(() => {
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  return (
    <div className="relative min-h-svh bg-bg text-fg">
      <main className="relative">
        <Labs prefersReducedMotion={prefersReducedMotion} />
        <Manifesto prefersReducedMotion={prefersReducedMotion} />
        <Showcase prefersReducedMotion={prefersReducedMotion} />
        {/* Penutup — bukan floating/fixed */}
        <FinalCta />
      </main>

      {prefersReducedMotion && (
        <div
          className="type-label-base fixed bottom-6 left-4 right-4 z-40 bg-fg p-3 text-bg sm:left-auto sm:right-6 sm:w-80"
          role="status"
        >
          Mode gerak berkurang aktif, animasi gulir dinonaktifkan.
        </div>
      )}
    </div>
  );
};

export default Landing;
