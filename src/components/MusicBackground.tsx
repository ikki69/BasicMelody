import { useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MUSIC_BG_FADE } from '../config/background';
import type { NoteConfig, NoteMotion } from '../data/notes';
import { prefersReducedMotion } from '../lib/navigate';
import { NoteIcon, InkFilterDefs } from './music/NoteIcons';

type Tween = ReturnType<typeof gsap.to>;

/**
 * Lapisan DOM tempat tiap preset bekerja. Tiap kelompok preset punya lapisan
 * sendiri supaya transform/opasitasnya tidak saling menimpa saat digabung.
 * `twinkle` mengalikan opasitas (bukan menggantinya), jadi opasitas dasar tiap
 * not di elemen luar tetap utuh.
 */
const MOTION_LAYER: Record<NoteMotion, 'a' | 'b' | 'scale' | 'fade'> = {
  float: 'a',
  drift: 'a',
  sway: 'b',
  spinWobble: 'b',
  beat: 'scale',
  twinkle: 'fade',
};

const layerOf = (outer: HTMLElement, motion: NoteMotion): HTMLElement | null =>
  outer.querySelector<HTMLElement>(`[data-mb-layer="${MOTION_LAYER[motion]}"]`);

/** Tween preset gerak semua not — disimpan agar bisa di-pause saat tak tampil. */
const buildMotionTweens = (root: HTMLElement, notes: NoteConfig[]): Tween[] => {
  const outers = gsap.utils.toArray<HTMLElement>('[data-mb-note]', root);
  const tweens: Tween[] = [];

  outers.forEach((outer, index) => {
    const note = notes[index];
    if (!note) return;

    note.motions.forEach((motion, slot) => {
      const target = layerOf(outer, motion);
      if (!target) return;

      const duration = note.durations[slot];
      const delay = note.delays[slot];
      const amplitude = note.amplitudes[slot];
      const loop = { duration, delay, ease: 'sine.inOut', yoyo: true, repeat: -1 } as const;

      switch (motion) {
        case 'twinkle':
          // Pengali opasitas di lapisan sendiri: not berkedip tanpa mengubah
          // opasitas dasarnya (lihat MUSIC_BG_OPACITY di config/background.ts).
          tweens.push(gsap.fromTo(target, { opacity: 0.55 }, { opacity: 1, ...loop }));
          break;
        case 'beat':
          tweens.push(
            gsap.to(target, {
              scale: 1.12,
              duration: Math.max(0.45, duration / 5),
              delay,
              ease: 'power2.out',
              yoyo: true,
              repeat: -1,
              repeatDelay: Math.max(0.35, duration / 6),
            })
          );
          break;
        case 'sway':
          tweens.push(gsap.to(target, { rotation: amplitude, ...loop }));
          break;
        case 'spinWobble':
          tweens.push(gsap.to(target, { rotation: amplitude * 0.55, skewX: 3, ...loop }));
          break;
        case 'drift':
          tweens.push(gsap.to(target, { x: amplitude * 0.7, y: -amplitude * 0.5, ...loop }));
          break;
        default: // float
          tweens.push(gsap.to(target, { y: -amplitude, ...loop }));
      }
    });
  });

  return tweens;
};

interface MusicBackgroundProps {
  notes: NoteConfig[];
  /** true saat latar boleh tampil; false memulai fade-out. */
  active: boolean;
  /** Dipanggil setelah fade-out tuntas — pemilik boleh melepas komponen. */
  onHidden?: () => void;
}

/**
 * Latar not musik bergaya coretan tangan.
 *
 * Hanya transform & opasitas yang dianimasikan. Semuanya dibangun lewat
 * gsap.context() dan di-revert saat unmount, aman untuk StrictMode (effect
 * dijalankan dua kali di mode dev). Komponen ini murni hiasan: aria-hidden,
 * pointer-events-none, dan fixed di belakang konten (-z-10).
 */
export const MusicBackground = ({ notes, active, onHidden }: MusicBackgroundProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const tweensRef = useRef<Tween[]>([]);
  const fadeRef = useRef<Tween | null>(null);
  const pauseRef = useRef<() => void>(() => {});
  const resumeRef = useRef<() => void>(() => {});
  const activeRef = useRef(active);
  const hiddenRef = useRef(onHidden);

  const shouldPlay = useCallback(() => activeRef.current && !document.hidden, []);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    hiddenRef.current = onHidden;
  }, [onHidden]);

  // Susunan not + animasi. Dibangun ulang hanya bila daftar not berganti
  // (pemilik me-remount komponen saat breakpoint berubah).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const outers = gsap.utils.toArray<HTMLElement>('[data-mb-note]', root);
      if (outers.length === 0) return;

      // Tiap not dipusatkan pada titik posisinya, lalu diberi rotasi awal.
      outers.forEach((outer, index) => {
        gsap.set(outer, { xPercent: -50, yPercent: -50, rotation: notes[index]?.rotation ?? 0 });
      });

      if (reduced) {
        gsap.set(root, { autoAlpha: activeRef.current ? 1 : 0 });
        return;
      }

      gsap.set(root, { autoAlpha: 0 });

      // Not muncul satu per satu (stagger 0.08s) sambil membesar dari 0.6.
      const enters = gsap.utils.toArray<HTMLElement>('[data-mb-enter]', root);
      gsap.fromTo(
        enters,
        { scale: 0.6, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'power2.out', stagger: 0.08, delay: 0.1 }
      );

      // Preset gerak tiap not; ditahan dulu bila latar belum boleh tampil.
      const motionTweens = buildMotionTweens(root, notes);
      tweensRef.current = motionTweens;
      if (!shouldPlay()) motionTweens.forEach((tween) => tween.pause());
    }, root);

    pauseRef.current = () => {
      tweensRef.current.forEach((tween) => tween.pause());
    };
    resumeRef.current = () => {
      if (!shouldPlay()) return;
      tweensRef.current.forEach((tween) => tween.play());
    };

    return () => {
      tweensRef.current = [];
      pauseRef.current = () => {};
      resumeRef.current = () => {};
      ctx.revert();
    };
  }, [notes, shouldPlay]);

  // Fade in/out mengikuti route; animasi ditahan setelah fade-out selesai.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const duration = prefersReducedMotion() ? 0 : MUSIC_BG_FADE;

    fadeRef.current?.kill();
    fadeRef.current = active
      ? gsap.to(root, { autoAlpha: 1, duration, ease: 'power1.out' })
      : gsap.to(root, {
          autoAlpha: 0,
          duration,
          ease: 'power1.in',
          onComplete: () => {
            pauseRef.current();
            hiddenRef.current?.();
          },
        });

    if (active) resumeRef.current();

    return () => {
      fadeRef.current?.kill();
    };
  }, [active]);

  // Jeda total saat tab tidak terlihat.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pauseRef.current();
      else resumeRef.current();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Parallax: mengikuti mouse di perangkat presisi, mengikuti gulir di sentuh.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const outers = gsap.utils.toArray<HTMLElement>('[data-mb-note]', root);
    if (outers.length === 0) return;

    const setters = outers.map((outer, index) => ({
      x: gsap.quickTo(outer, 'x', { duration: 0.9, ease: 'power2.out' }),
      y: gsap.quickTo(outer, 'y', { duration: 0.9, ease: 'power2.out' }),
      /** Not besar bergerak lebih jauh (6–20px) supaya terasa lebih dekat. */
      amount: 6 + (notes[index]?.depth ?? 0) * 14,
    }));
    const release = () => gsap.killTweensOf(outers);

    // Mode ditentukan dari input yang benar-benar datang: begitu ada gerakan
    // mouse, parallax mengikuti kursor; kalau tidak (perangkat sentuh),
    // parallax mengikuti gulir.
    let followsPointer = false;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      followsPointer = true;
      const dx = event.clientX / window.innerWidth - 0.5;
      const dy = event.clientY / window.innerHeight - 0.5;
      setters.forEach((setter) => {
        setter.x(-dx * setter.amount);
        setter.y(-dy * setter.amount);
      });
    };

    const onScroll = () => {
      if (followsPointer) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      setters.forEach((setter) => setter.y((0.5 - progress) * setter.amount * 1.6));
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      release();
    };
  }, [notes]);

  return (
    <div
      ref={rootRef}
      data-music-bg=""
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg"
    >
      <InkFilterDefs />

      {notes.map((note) => {
        return (
          <div
            key={note.id}
            data-mb-note=""
            data-note-id={note.id}
            data-note-shape={note.shape}
            className="absolute will-change-transform"
            style={{
              left: `${note.x}%`,
              top: `${note.y}%`,
              width: note.size,
              height: note.size,
              opacity: note.opacity,
            }}
          >
            <div data-mb-layer="a" className="h-full w-full will-change-transform">
              <div data-mb-layer="b" className="h-full w-full will-change-transform">
                <div data-mb-layer="scale" className="h-full w-full will-change-transform">
                  <div data-mb-layer="fade" className="h-full w-full will-change-transform">
                    <div data-mb-enter="" className="h-full w-full will-change-transform">
                      <NoteIcon shape={note.shape} className="h-full w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
