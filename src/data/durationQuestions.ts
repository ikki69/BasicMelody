/**
 * Data nilai not untuk Materi 2 (pengenalan + kuis).
 *
 * Setiap kartu mewakili satu simbol not (1/1, 1/2, 1/4, 1/8). Nilai
 * "ketukan" mengikuti birama 4/4: not 1/4 = 1 ketukan.
 */

export type GlyphName = 'whole' | 'half' | 'quarter' | 'eighth';

export interface DurationCard {
  id: string;
  /** Nama bentuk untuk komponen NoteGlyph. */
  glyph: GlyphName;
  /** Label nilai: '1/1', '1/2', '1/4', '1/8'. */
  nilai: string;
  /** Nilai dalam ketukan. */
  beats: number;
  /** Nama Indonesia, mis. "Not seperempat". */
  nama: string;
  /** Keterangan singkat. */
  keterangan: string;
}

export const DURATION_CARDS: DurationCard[] = [
  {
    id: 'note-whole',
    glyph: 'whole',
    nilai: '1/1',
    beats: 4,
    nama: 'Not penuh',
    keterangan: 'Bunyi selama 4 ketukan.',
  },
  {
    id: 'note-half',
    glyph: 'half',
    nilai: '1/2',
    beats: 2,
    nama: 'Not setengah',
    keterangan: 'Bunyi selama 2 ketukan.',
  },
  {
    id: 'note-quarter',
    glyph: 'quarter',
    nilai: '1/4',
    beats: 1,
    nama: 'Not seperempat',
    keterangan: 'Bunyi selama 1 ketukan.',
  },
  {
    id: 'note-eighth',
    glyph: 'eighth',
    nilai: '1/8',
    beats: 0.5,
    nama: 'Not seperdelapan',
    keterangan: 'Bunyi selama ½ ketukan.',
  },
];

export interface AnswerOption {
  /** Nilai dalam ketukan. */
  value: number;
  label: string;
}

/** Pilihan jawaban yang selalu tersedia di kuis nilai not. */
export const ANSWER_OPTIONS: AnswerOption[] = [
  { value: 0.5, label: '1/8 · ½ ketukan' },
  { value: 1, label: '1/4 · 1 ketukan' },
  { value: 2, label: '1/2 · 2 ketukan' },
  { value: 4, label: '1/1 · 4 ketukan' },
];

const shuffled = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/**
 * Ambil `count` soal dari bank nilai not. Kartu yang sama tidak muncul dua
 * kali berurutan supaya pemain tidak merasa soal "nyangkut".
 */
export const pickQuestions = (count: number): DurationCard[] => {
  if (DURATION_CARDS.length === 0) return [];

  const result: DurationCard[] = [];
  let lastId: string | null = null;

  while (result.length < count) {
    const round = shuffled(DURATION_CARDS);
    const first = round[0];
    if (round.length > 1 && first.id === lastId) {
      round.push(round.shift() as DurationCard);
    }
    for (const card of round) {
      if (result.length >= count) break;
      result.push(card);
      lastId = card.id;
    }
  }

  return result;
};

export const shuffleOptions = (): AnswerOption[] => shuffled(ANSWER_OPTIONS);
