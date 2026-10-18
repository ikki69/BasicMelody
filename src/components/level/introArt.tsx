import type { ReactNode } from 'react';
import { ClefGlyph } from './ClefGlyph';
import { DEFAULT_PITCH_INDEX, yFromIndex } from '../../lib/intro';

/**
 * Seni paranada halaman Introduction, dipakai bersama landing page.
 *
 * Satu salinan markup saja: koordinat, kelas CSS, dan urutan sorot sama persis
 * dengan kartu di halaman pengenalan, jadi panel Manifesto di landing
 * memperlihatkan isi frame yang sebenarnya — bukan gambar hasil potret, dan
 * tidak ada dua versi yang bisa saling menyimpang.
 *
 * Acuan koordinat (viewBox 400x160):
 * - lima garis di y 30–130 (jarak 25); garis G = garis ke-2 dari bawah = y 105;
 * - empat ruang di antaranya, masing-masing setinggi 15.
 */

/** y lima garis paranada. */
const LINE_Y = [30, 55, 80, 105, 130];
/** y awal empat ruang paranada (35 = tepat di bawah garis pertama). */
const SPACE_Y = [35, 60, 85, 110];
/** Garis G — pusaran kunci G dikunci ke garis ini. */
const G_LINE_Y = 105;
/** Tinggi kunci G dalam user unit viewBox. */
const CLEF_SIZE = 140;

interface IntroFrameProps {
  children: ReactNode;
  /** Tanpa label, frame diperlakukan sebagai hiasan (aria-hidden). */
  label?: string;
  className?: string;
  id?: string;
}

/** Bingkai SVG paranada: satu viewBox untuk semua step. */
export const IntroFrame = ({ children, label, className, id }: IntroFrameProps) => (
  <svg
    id={id}
    className={className ? `paranada-svg ${className}` : 'paranada-svg'}
    viewBox="0 0 400 160"
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : 'true'}
  >
    {children}
  </svg>
);

interface StaffLinesProps {
  x1?: number;
  x2?: number;
  /** Nyalakan sorot berurutan milik step 1. */
  glow?: boolean;
}

/** Lima garis paranada (step 2 & 3 memakai bentang yang lebih pendek). */
export const StaffLines = ({ x1 = 20, x2 = 380, glow = false }: StaffLinesProps) => (
  <>
    {LINE_Y.map((y, i) =>
      glow ? (
        <line key={y} className="staff-line staff-glow" x1={x1} y1={y} x2={x2} y2={y} data-index={i * 2} />
      ) : (
        <line key={y} className="staff-line" x1={x1} y1={y} x2={x2} y2={y} />
      )
    )}
  </>
);

/** Empat ruang paranada (ikut sorot step 1). */
export const StaffSpaces = () => (
  <>
    {SPACE_Y.map((y, i) => (
      <rect key={y} className="staff-space staff-glow" x="20" y={y} width="360" height="15" data-index={i * 2 + 1} />
    ))}
  </>
);

type ArtProps = Omit<IntroFrameProps, 'children'>;

/** Step 1 — garis dan ruang yang menyala bergantian. */
export const ParanadaArt = ({ label, className, id }: ArtProps) => (
  <IntroFrame label={label} className={className} id={id}>
    <StaffLines glow />
    <StaffSpaces />
  </IntroFrame>
);

/** Step 2 — paranada dengan kunci G. */
export const ClefArt = ({ label, className, id }: ArtProps) => (
  <IntroFrame label={label} className={className} id={id}>
    <StaffLines x1={50} x2={360} />
    <ClefGlyph className="clef-glyph" size={CLEF_SIZE} gLineY={G_LINE_Y} x={56} />
  </IntroFrame>
);

/**
 * Step 3 versi statis — paranada dengan satu not di posisi awal aplikasi.
 * Versi yang bisa digeser tetap hidup di halaman Introduction; di landing
 * not ini hanya gambar.
 */
export const NoteArt = ({ label, className, id }: ArtProps) => {
  const y = yFromIndex(DEFAULT_PITCH_INDEX);
  return (
    <IntroFrame label={label} className={className} id={id}>
      <StaffLines />
      <ellipse className="note-ellipse" cx="200" cy={y} rx="14" ry="10" transform={`rotate(-15 200 ${y})`} />
    </IntroFrame>
  );
};
