import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mentor } from '../mentor/Mentor';
import { SpeechBubble } from '../mentor/SpeechBubble';
import type { MentorPose } from '../mentor/mentorPoses';
import { MANIFESTO_BUBBLE, POSES_DESKTOP, POSES_MOBILE } from '../../config/mascotMotion';
import type { MascotMotion, MascotParts } from '../../hooks/useMascotScroll';

/** Pose maskot per langkah Showcase: Eksplorasi, Berlatih, Diuji. */
const STEP_POSES: MentorPose[] = ['wave', 'talk', 'point'];

interface MascotStageProps {
  motion: MascotMotion;
  /** false = prefers-reduced-motion: layer statis di hero, tanpa scrub. */
  enabled: boolean;
  /** Langkah Showcase yang sedang aktif (menentukan pose maskot). */
  activeStep: number;
}

/**
 * Layer tetap maskot: SATU maskot yang berpindah, berputar, dan berubah
 * skala mengikuti progres scroll (lihat useMascotScroll untuk timeline-nya).
 *
 * Struktur dalam stage, dari bawah ke atas:
 *   1. wipe  — blok warna penuh per batas babak (Fase 5)
 *   2. glow  — radial gradient warna aksen di belakang maskot
 *   3. body  — maskotnya sendiri (transform di-scrub oleh GSAP)
 *   4. bubble— balon ucap untuk Fase 2 (Manifesto)
 *
 * Seluruh layer `pointer-events: none` dan `aria-hidden`: interaksi tetap
 * milik konten di bawahnya. Bubble memakai SpeechBubble biasa sehingga teksnya
 * tetap elemen DOM (bisa diseleksi), hanya dekoratif.
 */
export const MascotStage = ({ motion, enabled, activeStep }: MascotStageProps) => {
  const { parts, setBubble, pulse } = motion;
  const [poseState, setPose] = useState<MentorPose>('wave');
  const [typing, setTyping] = useState(false);
  // Sisi ekor balon mengikuti breakpoint: balon di KANAN maskot di desktop
  // (ekor di tepi kiri), di ATAS maskot pada layar sempit (ekor di bawah).
  const [tail, setTail] = useState<'left' | 'bottom'>(() =>
    window.innerWidth >= 1024 ? (POSES_DESKTOP.bubble.tail === 'bottom' ? 'bottom' : 'left') : (POSES_MOBILE.bubble.tail === 'left' ? 'left' : 'bottom')
  );
  // Gerak berkurang: pose diturunkan langsung dari langkah, tanpa pulse.
  const pose = enabled ? poseState : (STEP_POSES[activeStep] ?? 'wave');

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () =>
      setTail(
        mq.matches
          ? POSES_DESKTOP.bubble.tail === 'bottom'
            ? 'bottom'
            : 'left'
          : POSES_MOBILE.bubble.tail === 'left'
            ? 'left'
            : 'bottom'
      );
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // ---- Ganti pose mengikuti langkah Showcase, dengan squash-pop singkat
  // (badan memipih lalu memantul) di titik tukarnya. Tanpa rotasi 360° —
  // flip itu membuat siluet datar terlihat tipis lalu terbalik/mirror saat
  // scroll ditarik cepat ke atas.
  useEffect(() => {
    if (!enabled) return;
    const next = STEP_POSES[activeStep] ?? 'wave';
    if (next === poseState) return;
    pulse(() => setPose(next));
  }, [activeStep, enabled, poseState, pulse]);

  // Setelah ARTWORK pose benar-benar tertukar di DOM, paksa ScrollTrigger
  // menghitung ulang nilai pose yang berupa FUNGSI. Pose finale memakai
  // `anchor.glyphInset`, dan margin kosong gambar berbeda antar pose (lengan
  // `wave` menjulur sampai x≈3/96, `point` mulai di x≈16.5/96) — tanpa refresh
  // ini, jarak panel→maskot memakai inset pose LAMA. `requestAnimationFrame`
  // menunggu commit React; refresh-nya sendiri sudah di-debounce ScrollTrigger.
  useEffect(() => {
    if (!enabled) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [poseState, enabled]);

  // ---- Bubble Fase 2: muncul saat maskot berjalan ke Manifesto ----
  // Desktop: end 'bottom 95%' (≈scroll 795) — jendela bubble mengikuti
  // SELURUH tinggi Manifesto; paragraf hidup di bubble (bukan di section),
  // jadi tidak ada teks section yang tertutup. Speed 18ms → ~213 karakter
  // ≈ 4 detik; pengunjung yang berhenti scroll membaca tuntas sebelum
  // bubble ikut menutup (T2 baru mulai ≈724).
  // Mobile: section-2 hanya ~400px, jadi 'bottom 95%' menutup bubble cuma
  // ~120px setelah muncul (ketikan belum selesai). 'bottom 70%' memberi
  // jendela ~330px; bubble baru menutup saat maskot sudah 15% terbang.
  useEffect(() => {
    if (!enabled) return;
    const mm = gsap.matchMedia();
    const make = (end: string) => {
      const st = ScrollTrigger.create({
        trigger: '#section-2',
        start: 'top 62%',
        end,
        onToggle: (self) => {
          setTyping(self.isActive);
          setBubble(self.isActive);
        },
      });
      return () => {
        st.kill();
        setBubble(false);
      };
    };
    mm.add('(min-width: 1024px)', () => make('bottom 95%'));
    mm.add('(max-width: 1023px)', () => make('bottom 70%'));
    return () => {
      mm.revert();
      setBubble(false);
    };
  }, [enabled, setBubble]);

  const setPart =
    (key: keyof MascotParts) =>
    (el: HTMLDivElement | null): void => {
      parts.current[key] = el;
    };

  return (
    <div className={enabled ? 'mascot-stage' : 'mascot-stage mascot-stage--static'} aria-hidden="true">
      <div ref={setPart('wipe')} className="mascot-wipe" />
      <div ref={setPart('glow')} className="mascot-stage__glow" />
      <div className="mascot-stage__anchor">
        <div ref={setPart('body')} className="mascot-stage__body">
          <Mentor pose={pose} />
        </div>
      </div>
      <div ref={setPart('bubbleAnchor')} className="mascot-stage__bubble-anchor">
        <div className="mascot-stage__bubble-shift">
          <SpeechBubble
            direction={tail}
            text={MANIFESTO_BUBBLE}
            active={typing && enabled}
            speed={18}
            delay={200}
            className="mascot-stage__bubble"
          />
        </div>
      </div>
    </div>
  );
};
