import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../data/projects';

gsap.registerPlugin(ScrollTrigger);

interface ShowcaseProps {
  prefersReducedMotion: boolean;
}

const LAST_INDEX = projects.length - 1;

/**
 * Babak ketiga (bidang near-black): tiga langkah aplikasi, satu gambar nyata
 * per langkah. Daftar langkah ditulis sebagai <ol> sungguhan — urutannya
 * memang berarti — jadi tidak perlu angka hiasan "01 / 03".
 *
 * Pin-nya sengaja hanya satu layar: tiap layar yang dipin harus memunculkan
 * hal baru (langkah, judul, dan gambar yang berganti).
 */
export const Showcase = ({ prefersReducedMotion }: ShowcaseProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const activeProject = projects[activeIndex];

  // ---- ScrollTrigger: pin + snap + sinkronisasi index ----
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      stRef.current = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=100%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        snap:
          LAST_INDEX > 0
            ? {
                snapTo: 1 / LAST_INDEX,
                duration: { min: 0.2, max: 0.5 },
                delay: 0.05,
                ease: 'power2.inOut',
              }
            : undefined,
        onUpdate: (self) => {
          const idx = Math.round(self.progress * LAST_INDEX);
          setActiveIndex((prev) => (prev === idx ? prev : Math.min(Math.max(idx, 0), LAST_INDEX)));
        },
      });
    }, section);

    return () => {
      ctx.revert();
      stRef.current = null;
    };
  }, [prefersReducedMotion]);

  // ---- Judul & keterangan naik tiap kali langkah berganti ----
  useLayoutEffect(() => {
    const title = titleRef.current;
    const desc = descRef.current;
    if (!title || prefersReducedMotion) return;

    const tl = gsap.timeline();
    tl.fromTo(title, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'expo.out' }, 0);
    if (desc) {
      tl.fromTo(desc, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0.08);
    }
    return () => {
      tl.kill();
    };
  }, [activeIndex, prefersReducedMotion]);

  const goToIndex = useCallback((index: number) => {
    const clamped = Math.min(Math.max(index, 0), LAST_INDEX);
    const st = stRef.current;
    if (st && LAST_INDEX > 0) {
      const target = st.start + (st.end - st.start) * (clamped / LAST_INDEX) + 1;
      window.scrollTo({ top: target, behavior: 'smooth' });
      return;
    }
    setActiveIndex(clamped);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goToIndex(activeIndex + 1);
    if (e.key === 'ArrowLeft') goToIndex(activeIndex - 1);
  };

  return (
    <section
      ref={sectionRef}
      id="section-3"
      className="relative w-full bg-dark-field text-on-dark"
      aria-label="Tiga langkah belajar"
      onKeyDown={handleKeyDown}
    >
      <div className="mx-auto flex h-[100svh] max-w-[1440px] flex-col gap-6 px-6 py-16 sm:px-10 lg:gap-10 lg:px-14 lg:py-20">
        <h2 className="type-display-medium text-display-sm text-on-dark">Tiga langkah, dari kenal sampai bisa.</h2>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
          {/* Kolom kiri: daftar langkah + kontrol */}
          <div className="order-2 flex min-h-0 flex-col justify-between lg:order-1 lg:col-span-5">
            <ol className="flex flex-col gap-3">
              {projects.map((p, i) => {
                const active = i === activeIndex;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => goToIndex(i)}
                      aria-current={active ? 'step' : 'false'}
                      className={`group/item flex w-full items-baseline gap-3 text-left transition duration-300 ${
                        active ? 'text-on-dark' : 'text-on-dark-muted hover:text-on-dark'
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full transition duration-300 group-hover/item:scale-125 ${
                          active ? 'bg-on-dark' : 'bg-on-dark-muted/40'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-[1.375rem] font-extrabold leading-tight">{p.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="flex flex-col gap-5">
              <div>
                <h3 ref={titleRef} className="type-display-medium text-[1.375rem] text-on-dark">
                  {activeProject.title}
                </h3>
                <p ref={descRef} className="type-body mt-2 max-w-[38ch] text-pretty text-on-dark-muted">
                  {activeProject.description}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => goToIndex(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  aria-label="Langkah sebelumnya"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-on-dark text-dark-field transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => goToIndex(activeIndex + 1)}
                  disabled={activeIndex === LAST_INDEX}
                  aria-label="Langkah berikutnya"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-on-dark text-dark-field transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Kolom kanan: gambar langkah aktif (ketiganya tetap di DOM) */}
          <figure className="group order-1 flex min-h-0 flex-col lg:order-2 lg:col-span-7">
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
              {projects.map((p, i) => {
                const active = i === activeIndex;
                return (
                  <img
                    key={p.slug}
                    src={p.src}
                    alt={active ? p.alt : ''}
                    aria-hidden={active ? undefined : 'true'}
                    className={`absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.02] ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                    decoding="async"
                  />
                );
              })}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
};
