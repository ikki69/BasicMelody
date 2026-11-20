import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText, getPieces } from './SplitText';
import { ScrollCue } from './hero/ScrollCue';
import { useNoteBurst } from '../hooks/useNoteBurst';
import mentorWave from '../assets/mentor/mentor-wave.svg';

gsap.registerPlugin(ScrollTrigger);

/**
 * Tagline layar pertama. Maskotnya kini berjalan lewat layer tetap
 * (MascotStage) dan menimpa judul di tengah, jadi kalimat ini tampil sebagai
 * teks biasa di kolom kanan — tidak dobel dengan bubble-nya.
 */
const TAGLINE =
  'Belajar membaca notasi musik dari nol. Satu nada dalam satu waktu, sampai kamu bisa memainkan lagu tanpa menerka-nerka lagi.';

interface LabsProps {
  prefersReducedMotion: boolean;
}

/**
 * Layar pertama: kata "Basicmelody." satu baris penuh, satu aksi utama, dan
 * tagline. Maskot besar hadir dari layer tetap (MascotStage) di tengah layar,
 * menimpa judul — teksnya sendiri tetap elemen DOM biasa di kolom kanan.
 *
 * Tidak ada gerak yang dipin di sini — halaman ini adalah pengantar, jadi ia
 * boleh mengalir begitu saja saat digulir.
 */
export const Labs = ({ prefersReducedMotion }: LabsProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const actionRef = useRef<HTMLAnchorElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const { onPointerEnter } = useNoteBurst<HTMLAnchorElement>();

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
      className="relative w-full bg-field-periwinkle"
      aria-label="Basicmelody"
    >
      {/* min-h dvh (bukan svh): svh mengikuti viewport TERKECIL (saat address
          bar peramban sedang tampil), sehingga begitu bilah itu tersembunyi
          section ini 8-10% lebih pendek dari layar dan warna bidang lain
          mengintip di tepi bawah. dvh mengikuti viewport saat itu. */}
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col justify-center gap-8 px-6 py-20 sm:px-10 lg:gap-12 lg:px-14">
        <h1 className="type-display text-display text-fg" data-smear>
          <SplitText ref={titleRef} text="Basicmelody." ariaLabel="Basicmelody." pieceClassName="type-display" />
        </h1>

        <div className="w-full" data-hero-foot>
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <a
                ref={actionRef}
                className="cta-next cta-next--playful"
                href="#/introduction"
                aria-label="Mulai Belajar, menuju halaman pengenalan"
                onPointerEnter={onPointerEnter}
              >
                <img className="cta-next__mascot" src={mentorWave} alt="" aria-hidden="true" />
                <span className="cta-next__now" aria-hidden="true">SEKARANG</span>
                <span className="cta-next__icon" aria-hidden="true">
                  <svg className="cta-next__explore-icon" viewBox="0 0 512 512">
                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
                  </svg>
                </span>
                <span className="cta-next__play">Mulai Belajar</span>
              </a>
            </div>

            {/* Kalimat tagline sebagai teks biasa; maskot menyapa dari layer
                tetapnya, jadi kolom ini tidak perlu mengurus balon ucapannya. */}
            <div ref={guideRef} className="lg:col-span-8">
              <p className="type-body max-w-[62ch] text-pretty text-fg">{TAGLINE}</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
};
