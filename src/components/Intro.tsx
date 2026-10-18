import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe } from './Music';

gsap.registerPlugin(ScrollTrigger);

interface IntroProps {
  onEnter?: () => void;
  prefersReducedMotion: boolean;
}

interface Callout {
  title: string;
  desc: string;
  /** posisi relatif terhadap pusat, dalam persen viewport */
  x: number;
  y: number;
  /** arah garis penghubung */
  side: 'left' | 'right';
}

const CALLOUTS: Callout[] = [
  { title: 'MOTION', desc: 'video tanpa After Effects', x: -30, y: -22, side: 'left' },
  { title: 'AI', desc: 'Claude Code & Design', x: 30, y: -20, side: 'right' },
  { title: 'MODUL', desc: 'panduan siap pakai', x: -28, y: 24, side: 'left' },
];

export const Intro = ({ onEnter, prefersReducedMotion }: IntroProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const calloutRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const [globeScale, setGlobeScale] = useState(1);

  // Skala bola responsif
  useEffect(() => {
    const computeScale = () => {
      const w = window.innerWidth;
      if (w < 480) setGlobeScale(0.62);
      else if (w < 768) setGlobeScale(0.78);
      else if (w < 1280) setGlobeScale(0.92);
      else setGlobeScale(1);
    };
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, []);

  // ScrollTrigger pin + progress morph
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (prefersReducedMotion) {
      progressRef.current = 1;
      calloutRefs.current.forEach((el, i) => {
        if (el) {
          el.style.opacity = '1';
          el.style.transform = 'translate(-50%, -50%)';
          el.dataset.reduced = String(i);
        }
      });
      return;
    }

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=280%',
        pin: true,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          onEnter?.();
        },
      });

      // Callout stagger berdasarkan progress global scene
      const calloutTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=180%',
          scrub: 0.6,
        },
      });

      calloutRefs.current.forEach((el, i) => {
        if (!el) return;
        calloutTl.fromTo(
          el,
          { autoAlpha: 0, yPercent: 60, filter: 'blur(6px)' },
          { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power3.out' },
          i * 0.18
        );
      });

      // Garis penghubung & titik ikut muncul
      calloutTl.fromTo(
        '.intro-callout-line',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.4, ease: 'power3.out', stagger: 0.18 },
        0.05
      );

      // Scroll hint hilang setelah mulai scroll
      if (scrollHintRef.current) {
        gsap.to(scrollHintRef.current, {
          autoAlpha: 0,
          y: 10,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=15%',
            scrub: true,
          },
        });
      }

      return () => {
        st.kill();
      };
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion, onEnter]);

  return (
    <section
      ref={sectionRef}
      id="section-0"
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-bg"
      aria-label="Intro"
    >
      {/* Bola 3D */}
      <div className="relative z-10 h-full w-full">
        <Globe progressRef={progressRef} prefersReducedMotion={prefersReducedMotion} scale={globeScale} />
      </div>

      {/* Callouts */}
      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
        {CALLOUTS.map((c, i) => (
          <div
            key={c.title}
            ref={(el) => {
              calloutRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 w-max"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <div
              className="relative"
              style={{
                marginLeft: `${c.x}vmin`,
                marginTop: `${c.y}vmin`,
              }}
            >
              <div className={`flex items-center gap-3 ${c.side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
                <div className="flex flex-col">
                  <span className="type-label-base text-fg">{c.title}</span>
                  <span className="mt-0.5 type-label-sm normal-case tracking-normal text-muted">{c.desc}</span>
                </div>
                <span
                  className="intro-callout-line h-0.5 w-6 origin-left bg-line"
                  style={{ transformOrigin: c.side === 'right' ? 'right' : 'left' }}
                />
                <span className="h-1.5 w-1.5 flex-none rounded-full bg-fg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <div
        ref={scrollHintRef}
        className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="type-label-sm text-muted">Gulir</span>
        <span className="block h-8 w-0.5 bg-line" aria-hidden="true" />
      </div>
    </section>
  );
};