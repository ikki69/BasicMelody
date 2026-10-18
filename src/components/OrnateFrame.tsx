import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';

/**
 * Bingkai ornamen klasik untuk kartu bergaris paranada.
 *
 * Hanya bingkainya yang digambar di sini — isi kartu (paranada, kunci G, dan
 * elemen lain) dikirim lewat `children` dan tidak disentuh sama sekali.
 *
 * Cara gambar:
 * - Sisi atas/bawah/kiri/kanan = empat elemen garis terpisah (bukan satu SVG
 *   yang diregangkan), supaya tebal garis tidak terdistorsi di rasio apa pun.
 * - Ornamen sudut = satu <path> daun + satu busur, dipakai ulang 4x dan
 *   dicerminkan (scaleX(-1)/scaleY(-1)) — keempat sudut identik.
 * - Semua ukuran mengacu ke `--of-orn` (ukuran kotak ornamen), jadi tebal garis
 *   dalam, busur sudut, dan panjang garis selalu sinkron.
 */

/** Sisi lurus bingkai, dipakai juga sebagai urutan "menggambar" mengelilingi kartu. */
const SIDES = ['top', 'right', 'bottom', 'left'] as const;
/** Sudut, urut mengelilingi kartu searah jarum jam. */
const CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

type Side = (typeof SIDES)[number];

/** Sumbu yang tumbuh 0 → 1 saat garis "digambar", agar terlihat mengelilingi kartu. */
const GROW_AXIS: Record<Side, 'scaleX' | 'scaleY'> = {
  top: 'scaleX',
  right: 'scaleY',
  bottom: 'scaleX',
  left: 'scaleY',
};

/**
 * Opasitas tiap lapisan. Angka yang sama dipakai di CSS (keadaan diam /
 * prefers-reduced-motion) dan di animasi GSAP, supaya tidak saling menimpa.
 */
const LINE_OPACITY = 0.45;
const EDGE_OPACITY = 0.8;
const CORNER_OPACITY = 0.85;

/**
 * Satu daun hiasan sudut: dasar di (0,0), ujung di (0,-9,5). Dipakai tiga kali
 * dengan rotasi berbeda membentuk kipas daun (gulungan) di sisi luar sudut.
 */
const CORNER_LEAF = 'M0 0C3.2-1.71 3.2-5.89 0-9.5C-3.2-5.89-3.2-1.71 0 0Z';

interface OrnateFrameProps {
  /** Isi kartu (paranada, kunci G, elemen lain). Layout internal tidak diubah. */
  children: ReactNode;
  /** Kelas tambahan untuk kartu (mis. latar gelap + hook CSS). */
  className?: string;
  /** Warna garis dan ornamen (currentColor). Default: grafit tema. */
  color?: string;
  /**
   * Ukuran kotak ornamen sudut (CSS length). Kalau tidak diisi, ukurannya
   * mengikuti tinggi kartu (24–64px, maksimum 6vw) supaya proporsional di
   * kartu lebar-pendek seperti kartu paranada.
   */
  ornament?: string;
  /** Jarak isi kartu dari tepi (CSS length). Default: clamp(20px, 3.5vw, 40px). */
  padding?: string;
  /** Matikan animasi "tergambar" (tetap tampil dalam keadaan akhir). */
  animate?: boolean;
}

/** Ornamen satu sudut: busur penghubung garis dalam + kipas daun (satu path, 3 rotasi). */
const CornerArt = () => (
  <svg className="ornate-frame__art" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    {/* Busur: dari ujung garis kiri (15,26) ke ujung garis atas (26,15), pusat (26,26). */}
    <path className="ornate-frame__arc" d="M15 26A11 11 0 0 1 26 15" fill="none" />
    <g fill="currentColor">
      <path d={CORNER_LEAF} transform="translate(11.5 11.5) rotate(-45)" />
      <path d={CORNER_LEAF} transform="translate(11.5 11.5) rotate(-90)" />
      <path d={CORNER_LEAF} transform="translate(11.5 11.5)" />
    </g>
  </svg>
);

export const OrnateFrame = ({
  children,
  className,
  color,
  ornament,
  padding,
  animate = true,
}: OrnateFrameProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  /**
   * Ukuran ornamen mengikuti tinggi kartu (dibatasi ≈12% tinggi kartu,
   * 24–64 px, maksimum 6vw) supaya tetap proporsional.
   */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (padding) root.style.setProperty('--of-pad', padding);

    if (ornament) {
      root.style.setProperty('--of-orn', ornament);
      return;
    }

    const measure = () => {
      const height = root.getBoundingClientRect().height;
      const viewportLimit = window.innerWidth * 0.06;
      const size = Math.round(Math.min(Math.max(24, Math.min(height * 0.1, viewportLimit)), 64));
      root.style.setProperty('--of-orn', `${size}px`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ornament, padding]);

  /**
   * Animasi "tergambar": garis luar dan garis dalam menggambar berkeliling dari
   * satu sudut, lalu ornamen keempat sudut fade + scale dengan stagger. Dipicu
   * saat kartu benar-benar terlihat (langkah Introduction yang masih
   * `display:none` belum boleh dianimasikan).
   */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !animate) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = (name: 'line' | 'edge') =>
      SIDES.map((side) => root.querySelector<HTMLElement>(`.ornate-frame__${name}--${side}`));
    const lines = layer('line');
    const edges = layer('edge');
    const corners = Array.from(root.querySelectorAll<HTMLElement>('.ornate-frame__corner'));

    let observer: IntersectionObserver | null = null;

    const ctx = gsap.context(() => {
      /** Kuncupkan tiap garis pada sumbu tumbuhnya (sumbu lain tetap utuh). */
      const collapse = (elements: Array<HTMLElement | null>) => {
        elements.forEach((element, index) => {
          if (!element) return;
          const vars: gsap.TweenVars = {};
          vars[GROW_AXIS[SIDES[index]]] = 0;
          gsap.set(element, vars);
        });
      };
      collapse(lines);
      collapse(edges);
      gsap.set(corners, { opacity: 0, scale: 0.6 });

      const timeline = gsap.timeline({ paused: true });

      /** Gambar empat sisi berurutan (searah jarum jam) mulai dari `start`. */
      const draw = (elements: Array<HTMLElement | null>, start: number, opacity: number) => {
        let at = start;
        SIDES.forEach((side, index) => {
          const element = elements[index];
          if (!element) return;
          const vars: gsap.TweenVars = { opacity, duration: 0.22, ease: 'power3.out' };
          vars[GROW_AXIS[side]] = 1;
          timeline.to(element, vars, at);
          at += 0.11;
        });
      };

      draw(lines, 0, LINE_OPACITY);
      draw(edges, 0.34, EDGE_OPACITY);
      timeline.to(
        corners,
        { opacity: CORNER_OPACITY, scale: 1, duration: 0.34, ease: 'power3.out', stagger: 0.09 },
        0.62
      );

      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          observer = null;
          timeline.play();
        },
        { threshold: 0.1 }
      );
      observer.observe(root);
    }, root);

    return () => {
      observer?.disconnect();
      ctx.revert();
    };
  }, [animate]);

  return (
    <div
      ref={rootRef}
      className={className ? `ornate-frame ${className}` : 'ornate-frame'}
      style={color ? { color } : undefined}
    >
      {SIDES.map((side) => (
        <span
          key={`line-${side}`}
          className={`ornate-frame__line ornate-frame__line--${side}`}
          aria-hidden="true"
        />
      ))}
      {SIDES.map((side) => (
        <span
          key={`edge-${side}`}
          className={`ornate-frame__edge ornate-frame__edge--${side}`}
          aria-hidden="true"
        />
      ))}
      {CORNERS.map((corner) => (
        <span
          key={`corner-${corner}`}
          className={`ornate-frame__corner ornate-frame__corner--${corner}`}
          aria-hidden="true"
        >
          <CornerArt />
        </span>
      ))}
      <div className="ornate-frame__content">{children}</div>
    </div>
  );
};
