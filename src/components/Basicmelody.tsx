import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText, getPieces } from './SplitText';
import { MentorBubble } from './mentor/MentorBubble';

gsap.registerPlugin(ScrollTrigger);

/**
 * Tagline layar pertama. Bukan lagi paragraf di kolom kiri, melainkan kalimat
 * yang diucapkan maskot di balon ucapannya — jadi tidak ada teks yang dobel dan
 * kolom kanan tidak perlu diisi gambar buatan sendiri.
 */
const TAGLINE =
  'Belajar membaca notasi musik dari nol. Satu nada dalam satu waktu, sampai kamu bisa memainkan lagu tanpa menerka-nerka lagi.';

interface LabsProps {
  prefersReducedMotion: boolean;
}

/**
 * Layar pertama: kata "Basicmelody." satu baris penuh, satu aksi utama, dan
 * maskot yang mengucapkan tagline di balon ucapannya.
 *
 * Tidak ada gerak yang dipin di sini — halaman ini adalah pengantar, jadi ia
 * boleh mengalir begitu saja saat digulir.
 */
export const Labs = ({ prefersReducedMotion }: LabsProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const actionRef = useRef<HTMLAnchorElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const pieces = getPieces(titleRef.current);
    const action = actionRef.current;
    const guide = guideRef.current;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([...pieces, action], { yPercent: 0, y: 0, autoAlpha: 1 });
        gsap.set(guide, { autoAlpha: 1, yPercent: 0 });
        return;
      }

      gsap.fromTo(
        pieces,
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: 0.04, delay: 0.15 }
      );

      gsap.fromTo(
        action,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out', delay: 0.5 }
      );

      gsap.fromTo(
        guide,
        { autoAlpha: 0, yPercent: 4 },
        { autoAlpha: 1, yPercent: 0, duration: 1.1, ease: 'power3.out', delay: 0.3 }
      );
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="section-1"
      className="relative w-full overflow-hidden bg-field-periwinkle"
      aria-label="Basicmelody"
    >
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1440px] flex-col justify-center gap-8 px-6 py-20 sm:px-10 lg:gap-12 lg:px-14">
        <h1 className="type-display text-display text-fg">
          <SplitText ref={titleRef} text="Basicmelody." ariaLabel="Basicmelody." pieceClassName="type-display" />
        </h1>

        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <a
              ref={actionRef}
              className="cta-next"
              href="#/introduction"
              aria-label="Mulai Belajar, menuju halaman pengenalan"
            >
              Mulai Belajar
              <span className="cta-next__arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>

          {/* Kalimat tagline diucapkan maskot; 20 ms/huruf supaya 137 karakter
              selesai diketik sebelum pengunjung sempat menggulir. */}
          <div ref={guideRef} className="lg:col-span-8">
            <MentorBubble pose="wave" direction="left" className="hero-guide" text={TAGLINE} speed={20} />
          </div>
        </div>
      </div>
    </section>
  );
};
