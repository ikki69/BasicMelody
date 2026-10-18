import type { RhythmOutcome } from '../../hooks/useRhythmGame';
import { Stars } from './Stars';

interface ResultOverlayProps {
  levelJudul: string;
  outcome: RhythmOutcome;
  /** Bintang terbaik sebelum percobaan ini. */
  previousBest: number;
  hasNext: boolean;
  onRetry: () => void;
  onNext: () => void;
  onClose: () => void;
  /**
   * 'rhythm' (default) memakai istilah ketukan; 'quiz' memakai istilah
   * jawaban (untuk kuis posisi not & nilai not).
   */
  variant?: 'rhythm' | 'quiz';
}

const verdictLabel: Record<1 | 2 | 3, string> = {
  1: 'Selesai!',
  2: 'Bagus sekali!',
  3: 'Sempurna!',
};

/** Layar hasil: bintang, skor, rincian ketukan/jawaban, dan tombol lanjutan. */
export const ResultOverlay = ({
  levelJudul,
  outcome,
  previousBest,
  hasNext,
  onRetry,
  onNext,
  onClose,
  variant = 'rhythm',
}: ResultOverlayProps) => {
  const improved = outcome.stars > previousBest;
  const isQuiz = variant === 'quiz';

  return (
    <div className="lv-result" role="dialog" aria-modal="true" aria-label="Hasil latihan">
      <div className="lv-result__card">
        <p className="lv-result__kicker">
          {isQuiz ? 'Kuis selesai' : 'Level selesai'} · {levelJudul}
        </p>
        <h2 className="lv-result__title">{verdictLabel[outcome.stars]}</h2>

        <Stars value={outcome.stars} className="lv-result__stars" />
        {outcome.crown && (
          <p className="lv-result__crown">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M5 18.5 3.8 8.5l4.7 3.2L12 5.5l3.5 6.2 4.7-3.2L19 18.5H5z" fill="currentColor" />
              </svg>
            </span>
            {isQuiz ? 'Mahkota! Semua jawaban benar.' : 'Mahkota! Tanpa satu pun ketukan meleset.'}
          </p>
        )}
        {!outcome.crown && improved && outcome.stars < 3 && (
          <p className="lv-result__hint">
            {isQuiz
              ? 'Jawab semuanya dengan benar untuk mahkota.'
              : 'Raih 3 bintang dan tanpa miss untuk mahkota.'}
          </p>
        )}

        <dl className={`lv-result__stats${isQuiz ? ' is-quiz' : ''}`}>
          <div className="lv-result__stat">
            <dt>Skor</dt>
            <dd data-stat="score">{outcome.score}%</dd>
          </div>
          <div className="lv-result__stat">
            <dt>{isQuiz ? 'Benar' : 'Perfect'}</dt>
            <dd data-stat="perfect">{outcome.counts.perfect}</dd>
          </div>
          {isQuiz ? (
            <div className="lv-result__stat">
              <dt>Salah</dt>
              <dd data-stat="miss">{outcome.counts.miss}</dd>
            </div>
          ) : (
            <>
              <div className="lv-result__stat">
                <dt>Good</dt>
                <dd data-stat="good">{outcome.counts.good}</dd>
              </div>
              <div className="lv-result__stat">
                <dt>Miss</dt>
                <dd data-stat="miss">{outcome.counts.miss}</dd>
              </div>
            </>
          )}
        </dl>

        <div className="lv-result__actions">
          <button type="button" className="lv-btn lv-btn--ghost" id="retryLevel" onClick={onRetry}>
            Ulangi
          </button>
          {hasNext && (
            <button type="button" className="lv-btn lv-btn--primary" id="nextLevel" onClick={onNext}>
              Level Berikutnya
            </button>
          )}
          <button type="button" className="lv-btn lv-btn--ghost" id="closeResult" onClick={onClose}>
            Kembali ke Level
          </button>
        </div>
      </div>
    </div>
  );
};
