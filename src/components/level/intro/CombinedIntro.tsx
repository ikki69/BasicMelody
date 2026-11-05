import type { ExtendedLevel } from '../../../data/levelsExtended';
import type { MaterialId } from '../../../data/materials';
import { DurationIntroBody } from './DurationIntro';
import { IntroShell } from './IntroShell';
import { PositionIntroBody } from './PositionIntro';
import { RhythmIntroBody } from './RhythmIntro';
import { SymbolIntroBody } from './SymbolIntro';

interface CombinedIntroProps {
  level: ExtendedLevel;
  onComplete: () => void;
  onExit: () => void;
}

type IntroPartId = 'position' | 'duration' | 'symbol' | 'rhythm';

/** Judul tiap bagian pengenalan. */
const PART_TITLE: Record<IntroPartId, string> = {
  position: 'Posisi Not',
  duration: 'Nilai Not',
  symbol: 'Tanda Diam & Tanda Titik',
  rhythm: 'Irama & Lagu',
};

/** Kalimat singkat di bawah judul bagian. */
const PART_HINT: Record<IntroPartId, string> = {
  position: 'Kenali letak nada pada paranada lewat kotak nada di bawah.',
  duration: 'Tekan kartu nilai not untuk melihat dan mendengar panjangnya.',
  symbol: 'Bandingkan tanda diam dengan not bertitik beserta nilainya.',
  rhythm: 'Ikuti metronom dan playhead sebagai pemanasan sebelum bermain lagu.',
};

/**
 * Bagian pengenalan untuk tiap materi gabungan. Materi gabungan memuat
 * pengenalan dari semua materi penyusunnya, bukan hanya salah satu.
 */
const COMBINED_PARTS: Partial<Record<MaterialId, IntroPartId[]>> = {
  m7: ['position', 'symbol'],
  m8: ['duration', 'rhythm'],
  m9: ['position', 'duration', 'symbol', 'rhythm'],
};

/** Badan pengenalan satu bagian, dipilih sesuai id bagian. */
const PartBody = ({ part, level }: { part: IntroPartId; level: ExtendedLevel }) => {
  if (part === 'position') return <PositionIntroBody level={level} />;
  if (part === 'duration') return <DurationIntroBody />;
  if (part === 'symbol') return <SymbolIntroBody />;
  return <RhythmIntroBody />;
};

/**
 * Pengenalan materi gabungan: setiap topik penyusun tampil sebagai bagian
 * tersendiri dengan judulnya, lalu ditutup satu tombol "Lanjut ke Kuis".
 */
export const CombinedIntro = ({ level, onComplete, onExit }: CombinedIntroProps) => {
  const parts = COMBINED_PARTS[level.materialId] ?? [];

  return (
    <IntroShell level={level} onComplete={onComplete} onExit={onExit}>
      <div className="lv-intro__parts">
        {parts.map((part, index) => (
          <section key={part} className="lv-intro__part" data-part={part}>
            <header className="lv-intro__part-head">
              <span className="lv-intro__part-num" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h2 className="lv-intro__part-title">{PART_TITLE[part]}</h2>
                <p className="lv-intro__part-sub">{PART_HINT[part]}</p>
              </div>
            </header>
            <PartBody part={part} level={level} />
          </section>
        ))}
      </div>
    </IntroShell>
  );
};
