import type { ExtendedLevel } from '../../../data/levelsExtended';
import { useBeatDemo } from '../../../hooks/useBeatDemo';
import { IntroShell } from './IntroShell';

interface RhythmIntroProps {
  level: ExtendedLevel;
  onComplete: () => void;
  onExit: () => void;
}

const DEMO_BEATS = [1, 2, 3, 4];

/**
 * Pengenalan Materi 3: hitung ketukan 1-2-3-4 dengan metronom sambil melihat
 * playhead bergerak. Ini "pemanasan" sebelum kuis irama yang butuh tempo.
 */
export const RhythmIntro = ({ level, onComplete, onExit }: RhythmIntroProps) => {
  const { playing, beat, silent, playheadRef, start, stop } = useBeatDemo({
    bpm: 60,
    beats: DEMO_BEATS.length,
  });

  return (
    <IntroShell level={level} onComplete={onComplete} onExit={onExit}>
      <div className="lv-intro__metro" data-playing={playing} data-beat={beat ?? ''}>
        <div className="lv-metro" aria-label="Bar empat ketukan">
          <span ref={playheadRef} className="lv-metro__playhead" aria-hidden="true" />
          {DEMO_BEATS.map((item) => (
            <span key={item} className={`lv-metro__beat${beat === item ? ' is-on' : ''}`}>
              {item}
            </span>
          ))}
        </div>

        <p className="lv-intro__readout">
          {playing
            ? `Hitung: ${beat ?? 1}. Ikuti playhead dari kiri ke kanan.`
            : 'Tekan tombol untuk mendengar ketukan dan melihat playhead bergerak.'}
        </p>

        <button
          type="button"
          className="lv-btn lv-btn--primary"
          id="playBeat"
          onClick={playing ? stop : start}
        >
          {playing ? 'Hentikan' : 'Putar metronom'}
        </button>
        {silent && <p className="lv-brief__warn">Audio tidak aktif, ikuti panduan visualnya.</p>}
      </div>

      <p className="lv-hint">Satu ketukan = satu gerakan playhead. Nanti kamu menekan kotak nada tepat saat playhead menyentuh not.</p>
    </IntroShell>
  );
};
