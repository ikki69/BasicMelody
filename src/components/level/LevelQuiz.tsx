import { useCallback, useEffect, useMemo, useState } from 'react';
import { RHYTHM_PADS, type RhythmLevel } from '../../data/rhythm';
import { useRhythmGame, type RhythmOutcome } from '../../hooks/useRhythmGame';
import type { LevelResult } from '../../hooks/useLevelProgress';
import { FeedbackTray } from './FeedbackTray';
import { NotePads } from './NotePads';
import { OrnateFrame } from '../OrnateFrame';
import { ResultOverlay } from './ResultOverlay';
import { RhythmStaff } from './RhythmStaff';

interface LevelQuizProps {
  level: RhythmLevel;
  best: LevelResult | undefined;
  hasNext: boolean;
  onExit: () => void;
  onNext: () => void;
  /** Dipanggil sekali setiap percobaan selesai (untuk menyimpan progres). */
  onComplete: (outcome: RhythmOutcome) => void;
  /** Label level untuk judul, mis. "Level 2". */
  label?: string;
}

/**
 * Kuis ritme satu level (tampilan penuh layar):
 * idle → hitung-masuk → bermain → hasil.
 */
export const LevelQuiz = ({ level, best, hasNext, onExit, onNext, onComplete, label }: LevelQuizProps) => {
  const game = useRhythmGame(level, { onFinish: onComplete });
  const [startedAt, setStartedAt] = useState(false);

  const judged = useMemo(() => game.verdicts.filter((v) => v !== null).length, [game.verdicts]);
  const progress = game.onsets.length > 0 ? judged / game.onsets.length : 0;
  const isPlaying = game.phase === 'playing' || game.phase === 'countin';

  const handleStart = useCallback(() => {
    setStartedAt(true);
    void game.start();
  }, [game]);

  const handleExit = useCallback(() => {
    game.stop();
    onExit();
  }, [game, onExit]);

  const handleRetry = useCallback(() => {
    void game.retry();
  }, [game]);

  // Escape = keluar dari kuis.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleExit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleExit]);

  return (
    <div className="lv-quiz" id="level-quiz" data-level={level.id}>
      {/* Header kuis */}
      <header className="lv-quiz__header">
        <button type="button" className="lv-quiz__exit" onClick={handleExit} aria-label="Keluar dari kuis">
          <span aria-hidden="true">×</span> Keluar
        </button>

        <div className="lv-quiz__progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <span className="lv-quiz__progress-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>

        <div className="lv-quiz__meta">
          {isPlaying && game.combo > 1 && (
            <p className="lv-quiz__combo" data-combo={game.combo}>
              kombo {game.combo}
            </p>
          )}
          <button
            type="button"
            className={`lv-quiz__metro${game.metronome ? ' is-on' : ''}`}
            onClick={game.toggleMetronome}
            aria-pressed={game.metronome}
            aria-label="Metronom"
          >
            metronom
          </button>
        </div>
      </header>

      {/* Panggung */}
      <div className="lv-quiz__stage">
        <div className="lv-quiz__info">
          <h1 className="lv-quiz__title">
            {label ?? `Level ${level.id}`} · {level.judul}
          </h1>
          <p className="lv-quiz__sub">
            {level.bpm} BPM · {level.beats} ketukan {level.subdivisions === 2 ? '· not 1/8' : ''} ·{' '}
            {game.onsets.length} not
          </p>
        </div>

        {game.phase === 'idle' && !startedAt ? (
          <div className="lv-brief">
            <p className="lv-brief__title">Cara bermain</p>
            <ol className="lv-brief__list">
              <li>Dengarkan hitungan masuk: 4 ketukan.</li>
              <li>
                Playhead bergerak dari kiri ke kanan. Setiap not berbunyi saat playhead menyentuhnya.
              </li>
              <li>
                Tekan kotak nada (<strong>C D E F G</strong>) yang sesuai posisi not pada paranada, tepat
                saat playhead menyentuh not. Bisa juga pakai tombol keyboard C, D, E, F, G.
              </li>
              <li>Istirahat (tanda ·) berarti tidak menekan apa pun.</li>
            </ol>
            {best && (
              <p className="lv-brief__best" data-best-stars={best.stars}>
                Bintang terbaikmu: {best.stars}/3 · skor terbaik {Math.round(best.bestAccuracy)}%
              </p>
            )}
            {game.silent && <p className="lv-brief__warn">Audio tidak aktif, ikuti panduan visualnya.</p>}
            <button type="button" className="lv-btn lv-btn--primary" id="startLevel" onClick={handleStart}>
              Mulai
            </button>
          </div>
        ) : (
          <>
            <OrnateFrame className="lv-staff-frame">
              <div className="lv-staff-wrap">
                <RhythmStaff
                  level={level}
                  onsets={game.onsets}
                  verdicts={game.verdicts}
                  activeIndex={game.activeIndex}
                  playheadRef={game.playheadRef}
                />
                {game.countdown !== null && (
                  <div
                    key={game.countdown}
                    className="lv-countdown"
                    data-countdown={game.countdown}
                    aria-hidden="true"
                  >
                    {game.countdown}
                  </div>
                )}
              </div>
            </OrnateFrame>

            <NotePads onPress={game.tap} disabled={!isPlaying} flash={game.padFlash} />

            <p className="lv-hint" aria-hidden="true">
              {RHYTHM_PADS.map((pad) => `${pad.label} ${pad.posisi}`).join(' · ')}
            </p>
          </>
        )}
      </div>

      <FeedbackTray message={game.tray} />

      {game.phase === 'result' && game.outcome && (
        <ResultOverlay
          levelJudul={level.judul}
          outcome={game.outcome}
          previousBest={best?.stars ?? 0}
          hasNext={hasNext}
          onRetry={handleRetry}
          onNext={onNext}
          onClose={handleExit}
        />
      )}
    </div>
  );
};
