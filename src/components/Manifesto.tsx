import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText, getPieces } from './SplitText';
import { ClefArt, NoteArt, ParanadaArt } from './level/introArt';

gsap.registerPlugin(ScrollTrigger);

interface ManifestoProps {
  prefersReducedMotion: boolean;
}

/**
 * Tiga isi frame halaman Introduction, urut seperti langkah aslinya:
 * mengenal paranada → mengenal kunci G → mengenal not.
 */
const FRAMES = [
  { name: 'paranada', Art: ParanadaArt },
  { name: 'kunci G', Art: ClefArt },
  { name: 'not', Art: NoteArt },
];

/** Ritme pergantian: berdiam → memudar keluar → bertukar → memudar masuk. */
const DWELL_MS = 2600;
const FADE_OUT_MS = 450;
const FADE_IN_MS = 450;

/**
 * Babak kedua (bidang sand): satu pernyataan besar + satu panel yang memuat
 * isi frame halaman pengenalan — materi yang benar-benar dipakai aplikasi,
 * bukan gambar dekoratif. Isinya bergantian mengikuti alur langkahnya dengan
 * fade out → fade in lalu mengulang; pergantian berhenti saat panel di luar
 * layar, dan tidak berjalan sama sekali bila pengunjung meminta gerak berkurang.
 *
 * Panel ditandai `data-ui` karena isinya potongan antarmuka produk yang asli:
 * frame + paranada yang sama dengan yang dipakai di halaman pengenalan.
 */
export const Manifesto = ({ prefersReducedMotion }: ManifestoProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  const [frame, setFrame] = useState(0);
  const [shown, setShown] = useState(true);

  // ---- Panel: paranada → kunci G → not, fade out lalu fade in, ulang ----
  useEffect(() => {
    if (prefersReducedMotion) return;
    const stack = stackRef.current;
    if (!stack) return;

    let timers: number[] = [];
    let running = false;

    const stop = () => {
      running = false;
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
    };
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };
    const cycle = () => {
      setShown(false);
      later(() => {
        setFrame((i) => (i + 1) % FRAMES.length);
        setShown(true);
        later(cycle, DWELL_MS + FADE_IN_MS);
      }, FADE_OUT_MS);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          setShown(true);
          later(cycle, DWELL_MS);
        } else if (!entry.isIntersecting && running) {
          stop();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(stack);

    return () => {
      io.disconnect();
      stop();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const line1 = getPieces(line1Ref.current);
    const line2 = getPieces(line2Ref.current);
    const body = bodyRef.current;
    const stack = stackRef.current;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([...line1, ...line2, body], { yPercent: 0, y: 0, autoAlpha: 1 });
        gsap.set(stack, { autoAlpha: 1, scale: 1 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          end: 'bottom 60%',
          scrub: 0.6,
        },
      });

      tl.fromTo(
        line1,
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: 0.03 },
        0
      )
        .fromTo(
          line2,
          { yPercent: 110, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: 0.03 },
          0.12
        )
        .fromTo(body, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, 0.3);

      gsap.fromTo(
        stack,
        { scale: 1.12 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="section-2"
      className="relative w-full overflow-hidden bg-field-sand"
      aria-label="Manifesto"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
        <h2 className="type-display-medium text-statement text-fg">
          <SplitText ref={line1Ref} text="Materi yang jelas," ariaLabel="Materi yang jelas," pieceClassName="type-display-medium" />
          <br />
          <SplitText
            ref={line2Ref}
            text="latihan yang seru."
            ariaLabel="latihan yang seru."
            pieceClassName="type-display-medium"
          />
        </h2>

        <div className="mt-12 grid grid-cols-1 items-end gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="visual-frame aspect-[2/1] lg:aspect-[8/3]" data-ui>
              <div ref={stackRef} className="relative h-full w-full">
                {FRAMES.map(({ Art, name }, i) => (
                  <div
                    key={name}
                    className="manifesto-frame"
                    style={{ opacity: i === frame && shown ? 1 : 0 }}
                  >
                    <Art className="manifesto-art" />
                  </div>
                ))}
              </div>
            </div>
            <p className="type-label-base mt-3 text-muted">Tiga langkah pengenalan: paranada, kunci G, lalu not.</p>
          </div>

          <div className="flex flex-col items-start gap-7 lg:col-span-5">
            <p ref={bodyRef} className="type-body max-w-[42ch] text-pretty text-fg">
              Tiap nada punya nama, tempat, dan bunyi. Basicmelody menyusunnya jadi tiga langkah pendek: kenali dulu,
              ulangi sampai hafal, lalu uji dengan kuis. Tidak ada teori yang menumpuk sebelum kamu bisa memainkan
              sesuatu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
