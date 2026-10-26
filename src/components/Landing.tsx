import { useEffect, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Labs } from './Basicmelody';
import { Manifesto } from './Manifesto';
import { Showcase } from './Showcase';
import { FinalCta } from './FinalCta';
import { MascotStage } from './mascot/MascotStage';
import { useMascotScroll } from '../hooks/useMascotScroll';
import { useLenis } from '../hooks/useLenis';
import { STEP_ACCENTS } from '../config/mascotMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing page: empat babak warna yang berurutan —
 * periwinkle (kata pembuka) → sand (pernyataan) → near-black (tiga langkah)
 * → pink (penutup). Tiap babak membawa satu gambar nyata dan satu gagasan.
 *
 * Gulirnya dihaluskan Lenis (diintegrasikan ke gsap.ticker supaya ScrollTrigger
 * pin/snap tetap sinkron); tanpa JavaScript atau dengan prefers-reduced-motion,
 * Lenis tidak dibuat dan halaman kembali ke gulir bawaan peramban.
 *
 * Maskot berjalan lewat SATU layer tetap (MascotStage) yang transform-nya
 * di-scrub oleh useMascotScroll; `activeStep` di sini adalah satu-satunya
 * sumber warna aksen (--accent-live): glow, bingkai foto, dan penanda langkah
 * ikut berubah bersamanya.
 */
export const Landing = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // ---- Lenis (dibuat lebih dulu supaya glue di bawah menemukannya) ----
  const { getLenis } = useLenis();

  // ---- Motion maskot ----
  const motion = useMascotScroll(!prefersReducedMotion);

  // ---- prefers-reduced-motion ----
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setPrefersReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // ---- Integrasikan Lenis dengan ScrollTrigger + gsap.ticker ----
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;

    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off('scroll', ScrollTrigger.update);
      if (window.__lenis === lenis) window.__lenis = undefined;
    };
  }, [getLenis]);

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
    <div
      className="landing-root relative min-h-svh bg-bg text-fg"
      style={{ '--accent-live': STEP_ACCENTS[activeStep] ?? STEP_ACCENTS[0] } as CSSProperties}
    >
      {/* `main` diberi warna bidang: pin-spacer ScrollTrigger transparan dan
          area itu bisa terlihat sesaat saat section berganti; tanpa warna di
          sini yang tampil adalah latar body — sumber "sliver" warna lain. */}
      <main className="relative bg-bg">
        <Labs prefersReducedMotion={prefersReducedMotion} />
        <Manifesto prefersReducedMotion={prefersReducedMotion} />
        <Showcase prefersReducedMotion={prefersReducedMotion} onActiveStep={setActiveStep} />
        {/* Penutup — bukan floating/fixed */}
        <FinalCta />
      </main>

      {/* Layer maskot: selalu SETELAH konten agar berada di atasnya (z-50 —
          di atas bingkai .visual-frame yang membentuk stacking context
          sendiri karena `overflow:hidden` + transform reveal). */}
      <MascotStage motion={motion} enabled={!prefersReducedMotion} activeStep={activeStep} />

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
