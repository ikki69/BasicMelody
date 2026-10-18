import { useCallback, useState } from 'react';
import {
  DURATION_CARDS,
  type DurationCard,
} from '../../../data/durationQuestions';
import type { ExtendedLevel } from '../../../data/levelsExtended';
import { playNotePreview } from '../../../lib/audio';
import { NoteGlyph } from '../NoteGlyph';
import { IntroShell } from './IntroShell';

interface DurationIntroProps {
  level: ExtendedLevel;
  onComplete: () => void;
  onExit: () => void;
}

/** Satu ketukan demo = 600 ms (100 BPM) supaya nilai not terdengar jelas. */
const DEMO_BEAT_MS = 600;

/**
 * Pengenalan Materi 2: kartu nilai not. Menekan kartu membunyikan nada dan
 * menunjukkan panjangnya dalam ketukan.
 */
export const DurationIntro = ({ level, onComplete, onExit }: DurationIntroProps) => {
  const [selected, setSelected] = useState<DurationCard | null>(null);
  const [runId, setRunId] = useState(0);
  const [silent, setSilent] = useState(false);

  const select = useCallback((card: DurationCard) => {
    setSelected(card);
    setRunId((id) => id + 1);
    void playNotePreview('C5', Math.max(0.2, card.beats * (DEMO_BEAT_MS / 1000))).then((ok) => {
      if (!ok) setSilent(true);
    });
  }, []);

  const tickCount = selected ? Math.max(1, Math.ceil(selected.beats)) : 0;
  const durationMs = selected ? Math.round(selected.beats * DEMO_BEAT_MS) : 0;

  return (
    <IntroShell level={level} onComplete={onComplete} onExit={onExit}>
      <div className="lv-intro__groups">
        <section className="lv-intro__group" aria-label="Nilai not">
          <h2 className="lv-intro__group-title">Not</h2>
          <ul className="lv-cards">
            {DURATION_CARDS.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  className={`lv-card${selected?.id === card.id ? ' is-active' : ''}`}
                  data-card={card.id}
                  onClick={() => select(card)}
                >
                  <NoteGlyph kind="note" glyph={card.glyph} size={72} />
                  <span className="lv-card__value">{card.nilai}</span>
                  <span className="lv-card__sub">{card.beats} ketukan</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="lv-intro__detail" data-selected={selected?.id ?? ''}>
        {selected ? (
          <>
            <p className="lv-intro__detail-title">
              {selected.nama}: {selected.nilai} = {selected.beats} ketukan
            </p>
            <p className="lv-intro__detail-sub">{selected.keterangan}</p>
            <div className="lv-beatbar" key={runId}>
              <span className="lv-beatbar__fill" style={{ animationDuration: `${durationMs}ms` }} />
              {Array.from({ length: tickCount }, (_, index) => (
                <span
                  key={index}
                  className="lv-beatbar__tick"
                  style={{ left: `${(index / tickCount) * 100}%` }}
                >
                  {index + 1}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="lv-intro__detail-sub">
            Tekan salah satu kartu untuk melihat dan mendengar panjang nilainya.
          </p>
        )}
      </div>
      {silent && <p className="lv-brief__warn">Audio tidak aktif, ikuti panduan visualnya.</p>}
    </IntroShell>
  );
};
