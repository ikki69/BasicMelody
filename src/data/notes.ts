/**
 * Tata letak not musik untuk latar MusicBackground.
 *
 * Seluruh posisi/ukuran/animasi dihitung sekali saat modul dimuat memakai PRNG
 * ber-seed tetap, sehingga tata letaknya konsisten di setiap render dan tidak
 * pernah memakai Math.random langsung di dalam render React.
 */

import { MUSIC_BG_OPACITY } from '../config/background';

/** Bentuk not yang tersedia (digambar di components/music/NoteIcons.tsx). */
export type NoteShape = 'quarter' | 'eighth' | 'beamedPair' | 'beamedTriple' | 'trebleClef' | 'half';

/** Preset gerak; tiap not memakai dua preset dari kelompok yang berbeda. */
export type NoteMotion = 'float' | 'drift' | 'sway' | 'spinWobble' | 'beat' | 'twinkle';

/**
 * Kelompok preset. Dua preset yang digabung selalu berasal dari kelompok
 * berbeda supaya efeknya tidak bertabrakan — tiap kelompok punya lapisan DOM
 * sendiri (lihat MusicBackground.tsx).
 */
export const MOTION_GROUPS: NoteMotion[][] = [
  ['float', 'drift'], // posisi (y, atau x+y)
  ['sway', 'spinWobble'], // rotasi
  ['beat'], // skala
  ['twinkle'], // opasitas
];

export interface NoteConfig {
  id: string;
  shape: NoteShape;
  /** Pusat not, persen dari viewport (0–100). */
  x: number;
  y: number;
  /** Sisi not dalam px (28–96) — not kecil lebih transparan & lebih lambat. */
  size: number;
  /** Rotasi awal, derajat (-40..40). */
  rotation: number;
  /** Opasitas dasar (MUSIC_BG_OPACITY.min–max). */
  opacity: number;
  /** Dua preset gerak dari kelompok berbeda. */
  motions: [NoteMotion, NoteMotion];
  /** Durasi satu siklus tiap preset (detik). */
  durations: [number, number];
  /** Jeda sebelum tiap preset mulai (detik). */
  delays: [number, number];
  /** Amplitudo tiap preset: px untuk gerak posisi, derajat untuk rotasi. */
  amplitudes: [number, number];
  /** 0 (jauh) – 1 (dekat); mengatur besar parallax. */
  depth: number;
}

export type MusicBgBreakpointName = 'desktop' | 'tablet' | 'mobile';

export interface MusicBgBreakpoint {
  name: MusicBgBreakpointName;
  /** Lebar minimum viewport yang memakai breakpoint ini (px). */
  minWidth: number;
  /** Jumlah not — dipakai juga oleh pengujian. */
  count: number;
  notes: NoteConfig[];
}

const MIN_SIZE = 28;
const MAX_SIZE = 96;
/** Rentang opasitas dasar not — diatur di config/background.ts. */
const { min: MIN_OPACITY, max: MAX_OPACITY } = MUSIC_BG_OPACITY;

/** PRNG deterministik (mulberry32) — hasil sama di setiap pemuatan. */
const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const SHAPE_POOL: NoteShape[] = ['quarter', 'eighth', 'beamedPair', 'beamedTriple', 'half'];

/**
 * Bentuk per not: dasar diambil bergiliran dari SHAPE_POOL lalu diacak, dan
 * tepat satu not memakai kunci G (ikon paling berat, tidak boleh berulang).
 */
const pickShapes = (count: number, random: () => number): NoteShape[] => {
  const shapes: NoteShape[] = [];
  for (let i = 0; i < count; i += 1) shapes.push(SHAPE_POOL[i % SHAPE_POOL.length]);

  for (let i = shapes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shapes[i], shapes[j]] = [shapes[j], shapes[i]];
  }

  if (count > 0) shapes[Math.floor(random() * count)] = 'trebleClef';
  return shapes;
};

interface GridSpec {
  columns: number;
  rows: number;
  count: number;
}

/**
 * Bagi layar menjadi sel (maksimal satu not per sel) lalu geser posisinya
 * sedikit (jitter) di dalam sel agar renggang dan tidak tampak seperti kisi.
 */
const buildLayout = (spec: GridSpec, seed: number, idPrefix: string): NoteConfig[] => {
  const random = createRandom(seed);
  const cells = Array.from({ length: spec.columns * spec.rows }, (_, index) => index);

  // Fisher–Yates ber-seed: memilih sel unik dengan urutan yang stabil.
  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const shapes = pickShapes(spec.count, random);

  return cells.slice(0, spec.count).map((cell, index) => {
    const column = cell % spec.columns;
    const row = Math.floor(cell / spec.columns);
    const cellW = 100 / spec.columns;
    const cellH = 100 / spec.rows;

    // Jitter menyisakan margin di tepi sel supaya not tidak menempel.
    const x = column * cellW + cellW * (0.15 + random() * 0.7);
    const y = row * cellH + cellH * (0.15 + random() * 0.7);

    // t: 0 = jauh/kecil/lambat, 1 = dekat/besar/cepat.
    const t = random();
    const groupA = Math.floor(random() * MOTION_GROUPS.length);
    const groupB = (groupA + 1 + Math.floor(random() * (MOTION_GROUPS.length - 1))) % MOTION_GROUPS.length;
    const motionsA = MOTION_GROUPS[groupA];
    const motionsB = MOTION_GROUPS[groupB];
    const motionA = motionsA[Math.floor(random() * motionsA.length)];
    const motionB = motionsB[Math.floor(random() * motionsB.length)];

    /** Amplitudo sesuai jenis gerak: derajat untuk rotasi, px untuk posisi. */
    const amplitudeFor = (motion: NoteMotion): number =>
      motion === 'sway' || motion === 'spinWobble'
        ? Number((8 + random() * 7).toFixed(2))
        : Number((10 + random() * 14).toFixed(2));

    const baseDuration = 7 + (1 - t) * 7; // 7–14 detik

    return {
      id: `${idPrefix}${index}`,
      shape: shapes[index],
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      size: Math.round(MIN_SIZE + (MAX_SIZE - MIN_SIZE) * t),
      rotation: Number((-40 + random() * 80).toFixed(2)),
      opacity: Number((MIN_OPACITY + (MAX_OPACITY - MIN_OPACITY) * t).toFixed(3)),
      motions: [motionA, motionB],
      durations: [
        Number(baseDuration.toFixed(2)),
        Number((baseDuration * (1.15 + random() * 0.5)).toFixed(2)),
      ],
      delays: [Number((random() * 0.8).toFixed(2)), Number((random() * 1.2).toFixed(2))],
      amplitudes: [amplitudeFor(motionA), amplitudeFor(motionB)],
      depth: Number(t.toFixed(3)),
    };
  });
};

/** 14 not di desktop (grid 5×3), 9 di tablet (4×3), 6 di mobile (2×3). */
export const MUSIC_BG_BREAKPOINTS: MusicBgBreakpoint[] = [
  { name: 'desktop', minWidth: 1024, count: 14, notes: buildLayout({ columns: 5, rows: 3, count: 14 }, 0x5eed01, 'd') },
  { name: 'tablet', minWidth: 640, count: 9, notes: buildLayout({ columns: 4, rows: 3, count: 9 }, 0x5eed02, 't') },
  { name: 'mobile', minWidth: 0, count: 6, notes: buildLayout({ columns: 2, rows: 3, count: 6 }, 0x5eed03, 'm') },
];

/** Breakpoint yang dipakai untuk lebar viewport tertentu. */
export const breakpointForWidth = (width: number): MusicBgBreakpointName =>
  (MUSIC_BG_BREAKPOINTS.find((bp) => width >= bp.minWidth) ?? MUSIC_BG_BREAKPOINTS[MUSIC_BG_BREAKPOINTS.length - 1])
    .name;

export const notesForBreakpoint = (name: MusicBgBreakpointName): NoteConfig[] =>
  (MUSIC_BG_BREAKPOINTS.find((bp) => bp.name === name) ?? MUSIC_BG_BREAKPOINTS[MUSIC_BG_BREAKPOINTS.length - 1]).notes;
