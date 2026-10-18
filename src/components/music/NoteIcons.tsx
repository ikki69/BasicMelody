import type { ComponentType, ReactNode } from 'react';
import type { NoteShape } from '../../data/notes';

/** Id filter tinta — dipakai ulang oleh semua ikon lewat filter="url(#…)". */
export const INK_FILTER_ID = 'music-ink';

/**
 * Definisi filter tinta: feTurbulence + feDisplacementMap dengan skala kecil,
 * jadi tepi tiap ikon sedikit kasar seperti coretan kuas. Dipasang sekali saja
 * di <svg> tersembunyi, lalu dirujuk semua ikon.
 */
export const InkFilterDefs = () => (
  <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true" focusable="false">
    <defs>
      <filter
        id={INK_FILTER_ID}
        x="-14%"
        y="-14%"
        width="128%"
        height="128%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="wobble" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="wobble"
          scale="1.8"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

interface IconProps {
  className?: string;
}

interface IconFrameProps extends IconProps {
  children: ReactNode;
}

/** Bingkai umum: viewBox 64×64, mewarisi warna dari currentColor, dihias filter tinta. */
const IconFrame = ({ className, children }: IconFrameProps) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    width="100%"
    height="100%"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <g filter={`url(#${INK_FILTER_ID})`}>{children}</g>
  </svg>
);

/** ♩ Not seperempat: kepala elips miring + tangkai lurus. */
export const QuarterNote = ({ className }: IconProps) => (
  <IconFrame className={className}>
    <ellipse cx="21" cy="45" rx="12" ry="8.8" transform="rotate(-20 21 45)" />
    <path d="M31.4 44.6 32.9 11.4 35.5 11.6 36.2 44.6Z" />
  </IconFrame>
);

/** ♪ Not seperdelapan: kepala + tangkai + bendera melengkung. */
export const EighthNote = ({ className }: IconProps) => (
  <IconFrame className={className}>
    <ellipse cx="21" cy="45" rx="12" ry="8.8" transform="rotate(-20 21 45)" />
    <path d="M31.4 44.6 32.9 11.4 35.5 11.6 36.2 44.6Z" />
    <path
      d="M33.8 10.6c7.1 2.3 12.9 6.7 15.8 13.4 2.1 4.7 2.3 10 .9 14.9"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.6"
      strokeLinecap="round"
    />
  </IconFrame>
);

/** ♫ Not berangkai dua: dua kepala + dua tangkai + balok tebal di atas. */
export const BeamedPair = ({ className }: IconProps) => (
  <IconFrame className={className}>
    <ellipse cx="15" cy="47" rx="10.6" ry="7.8" transform="rotate(-20 15 47)" />
    <ellipse cx="41" cy="43" rx="10.6" ry="7.8" transform="rotate(-20 41 43)" />
    <path d="M23.4 46.4 24.7 16.2 27 16.4 28.2 46.4Z" />
    <path d="M49.4 42.4 50.7 12.2 53 12.4 54.2 42.4Z" />
    <path d="M24.4 10.8 52.4 8.4c1.5-.1 1.6 3.8.1 3.9L24.6 14.7c-1.5.1-1.6-3.8-.2-3.9Z" />
  </IconFrame>
);

/** ♬ Not berangkai tiga: tiga kepala + tiga tangkai + balok ganda. */
export const BeamedTriple = ({ className }: IconProps) => (
  <IconFrame className={className}>
    <ellipse cx="12" cy="48" rx="8.6" ry="6.4" transform="rotate(-20 12 48)" />
    <ellipse cx="32.5" cy="45" rx="8.6" ry="6.4" transform="rotate(-20 32.5 45)" />
    <ellipse cx="53.5" cy="42" rx="8.6" ry="6.4" transform="rotate(-20 53.5 42)" />
    <path d="M18.2 47.4 19.3 17.8 21.2 17.9 22.3 47.4Z" />
    <path d="M38.7 44.4 39.8 14.8 41.7 14.9 42.8 44.4Z" />
    <path d="M59.5 41.4 59.7 11.8 61.6 11.9 61.7 41.4Z" />
    <path d="M19 12.2 61.4 8.8c1.5-.1 1.6 2.4.1 2.5L19.2 14.7c-1.5.1-1.6-2.4-.2-2.5Z" />
    <path d="M19 18 61.4 14.6c1.5-.1 1.6 2.4.1 2.5L19.2 20.5c-1.5.1-1.6-2.4-.2-2.5Z" />
  </IconFrame>
);

/** Not setengah: kepala berongga (+ tangkai). */
export const HalfNote = ({ className }: IconProps) => (
  <IconFrame className={className}>
    <ellipse
      cx="21"
      cy="45"
      rx="10.2"
      ry="7"
      transform="rotate(-20 21 45)"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.8"
    />
    <path d="M31.6 44.6 33.1 11.4 35.5 11.6 36.2 44.6Z" />
  </IconFrame>
);

/** Kunci G (treble clef): spiral batang + kait atas + lingkaran tengah. */
export const TrebleClef = ({ className }: IconProps) => (
  <IconFrame className={className}>
    <g fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round">
      <path d="M34.6 13.2c-.4-3.7-4.4-6-7.7-4.3-2 1.1-3.1 3.6-2.3 5.8.8 2.3 3 3.6 5.2 4.5 8 3.1 14.3 9.8 16.5 18 2 7.5 0 16-5.6 21.3-2.4 2.3-5.8 3.6-9.2 3.4-3.5-.2-6.9-1.9-8.9-4.8" />
      <ellipse cx="27.8" cy="35.2" rx="9.9" ry="9.2" transform="rotate(-8 27.8 35.2)" />
    </g>
  </IconFrame>
);

/** Peta bentuk → komponen ikon (lokal, agar berkas ini hanya mengekspor komponen). */
const ICONS: Record<NoteShape, ComponentType<IconProps>> = {
  quarter: QuarterNote,
  eighth: EighthNote,
  beamedPair: BeamedPair,
  beamedTriple: BeamedTriple,
  trebleClef: TrebleClef,
  half: HalfNote,
};

interface NoteIconProps extends IconProps {
  shape: NoteShape;
}

/** Ikon not sesuai bentuknya — dipakai latar MusicBackground. */
export const NoteIcon = ({ shape, className }: NoteIconProps) => {
  const Icon = ICONS[shape];
  return <Icon className={className} />;
};
