import { useCallback, useMemo, useState } from 'react';
import { padsFor, padFor, type PadNote } from '../../../data/rhythm';
import type { ExtendedLevel } from '../../../data/levelsExtended';
import { playNotePreview } from '../../../lib/audio';
import { OrnateFrame } from '../../OrnateFrame';
import { NotePads } from '../NotePads';
import { PositionStaff } from '../PositionStaff';
import type { PadFlash } from '../../../hooks/useRhythmGame';
import { IntroShell } from './IntroShell';

interface PositionIntroProps {
  level: ExtendedLevel;
  onComplete: () => void;
  onExit: () => void;
}

/**
 * Isi pengenalan posisi not tanpa rangka halaman — dipakai langsung oleh
 * Materi 1 & 4, dan sebagai salah satu bagian pada pengenalan gabungan.
 */
export const PositionIntroBody = ({ level }: { level: ExtendedLevel }) => {
  /** Kotak nada yang tampil, mengikuti rentang nada level. */
  const pads = useMemo(() => padsFor(level.notes), [level.notes]);
  const [active, setActive] = useState<PadNote | null>(null);
  const [flash, setFlash] = useState<PadFlash | null>(null);
  const [silent, setSilent] = useState(false);

  const play = useCallback((note: PadNote) => {
    void playNotePreview(note, 0.7).then((ok) => {
      if (!ok) setSilent(true);
    });
  }, []);

  /**
   * Tampilkan + bunyikan sebuah nada. Dipakai tiga jalur: kursor masuk kotak
   * (hover, tanpa klik), tap/klik, dan tombol keyboard.
   */
  const showNote = useCallback(
    (note: PadNote) => {
      setActive(note);
      setFlash({ id: Date.now(), note, ok: true });
      play(note);
    },
    [play]
  );

  /** Kursor keluar: not padam lagi supaya paranada kembali kosong. */
  const clearPreview = useCallback(() => {
    setActive(null);
    setFlash(null);
  }, []);

  const pad = active ? padFor(active) : null;

  return (
    <>
      <OrnateFrame className="lv-staff-frame">
        <div className="lv-staff-wrap">
          <PositionStaff note={active} showMarker lit={active !== null} />
        </div>
      </OrnateFrame>

      <p className="lv-intro__readout" data-active-note={active ?? ''}>
        {pad ? (
          <>
            <strong>{pad.note}</strong> · {pad.posisi} pada paranada
          </>
        ) : (
          'Arahkan kursor ke salah satu kotak nada di bawah (atau tekan) untuk melihat dan mendengar posisinya.'
        )}
      </p>
      {silent && <p className="lv-brief__warn">Audio tidak aktif, ikuti panduan visualnya.</p>}

      <NotePads
        notes={level.notes}
        onPress={showNote}
        onPreview={showNote}
        onPreviewEnd={clearPreview}
        disabled={false}
        flash={flash}
      />

      <ul className="lv-intro__grid" aria-label="Daftar kotak nada">
        {pads.map((item) => (
          <li key={item.note} className={`lv-intro__chip${active === item.note ? ' is-active' : ''}`}>
            <span className="lv-intro__chip-key">{item.note}</span>
            <span className="lv-intro__chip-sub">{item.posisi}</span>
          </li>
        ))}
      </ul>
    </>
  );
};

/**
 * Pengenalan posisi not (Materi 1 C4–G4, Materi 4 C4–G5): arahkan kursor ke
 * tiap kotak nada (atau tekan) → not berpindah di paranada, menyala, berbunyi,
 * dan namanya muncul. Tanpa kuis dan tanpa bintang.
 */
export const PositionIntro = ({ level, onComplete, onExit }: PositionIntroProps) => (
  <IntroShell level={level} onComplete={onComplete} onExit={onExit}>
    <PositionIntroBody level={level} />
  </IntroShell>
);
