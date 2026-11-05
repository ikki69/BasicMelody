import { useCallback, useState } from 'react';
import { DOT_CARDS, REST_CARDS, type DurationCard } from '../../../data/durationQuestions';
import type { ExtendedLevel } from '../../../data/levelsExtended';
import { NoteGlyph } from '../NoteGlyph';
import { IntroShell } from './IntroShell';

interface SymbolIntroProps {
  level: ExtendedLevel;
  onComplete: () => void;
  onExit: () => void;
}

/**
 * Isi pengenalan tanda diam & not bertitik tanpa rangka halaman — dipakai
 * langsung oleh Materi 5 dan sebagai bagian pengenalan gabungan.
 */
export const SymbolIntroBody = () => {
  const [selected, setSelected] = useState<DurationCard | null>(null);

  const select = useCallback((card: DurationCard) => {
    setSelected(card);
  }, []);

  const isRest = selected ? selected.id.startsWith('rest') : false;
  const isDot = selected ? selected.id.startsWith('dot') : false;

  return (
    <>
      <div className="lv-intro__groups">
        <section className="lv-intro__group" aria-label="Tanda diam">
          <h2 className="lv-intro__group-title">Tanda Diam</h2>
          <ul className="lv-cards">
            {REST_CARDS.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  className={`lv-card${selected?.id === card.id ? ' is-active' : ''}`}
                  data-card={card.id}
                  onClick={() => select(card)}
                >
                  <NoteGlyph kind="rest" glyph={card.glyph} size={72} />
                  <span className="lv-card__value">{card.nilai}</span>
                  <span className="lv-card__sub">{card.beats} ketukan</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="lv-intro__group" aria-label="Not bertitik">
          <h2 className="lv-intro__group-title">Not Bertitik</h2>
          <ul className="lv-cards">
            {DOT_CARDS.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  className={`lv-card${selected?.id === card.id ? ' is-active' : ''}`}
                  data-card={card.id}
                  onClick={() => select(card)}
                >
                  <NoteGlyph kind="note" glyph={card.glyph} dotted size={72} />
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
              {selected.nama}: {isRest ? 'Diam' : 'Bunyi'} {selected.beats} ketukan
            </p>
            <p className="lv-intro__detail-sub">
              {isRest ? 'Jangan tekan kotak nada. Berhenti selama durasi tanda diam.' : isDot ? 'Nilai not + setengah nilai aslinya (tanda titik).' : selected.keterangan}
            </p>
          </>
        ) : (
          <p className="lv-intro__detail-sub">Tekan salah satu kartu untuk melihat penjelasannya.</p>
        )}
      </div>
    </>
  );
};

export const SymbolIntro = ({ level, onComplete, onExit }: SymbolIntroProps) => (
  <IntroShell level={level} onComplete={onComplete} onExit={onExit}>
    <SymbolIntroBody />
  </IntroShell>
);
