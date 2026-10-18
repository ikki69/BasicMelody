import { useCallback, useEffect, useRef, useState } from 'react';
import {
  pickQuestions,
  shuffleOptions,
  type AnswerOption,
  type DurationCard,
} from '../../data/durationQuestions';
import { levelLabel, type ExtendedLevel } from '../../data/levelsExtended';
import type { LevelResult } from '../../hooks/useLevelProgress';
import type { RhythmOutcome, TrayMessage } from '../../hooks/useRhythmGame';
import { accuracyFrom, countVerdicts, crownFor, starsFor, type Verdict } from '../../lib/rhythm';
import { FeedbackTray } from './FeedbackTray';
import { NoteGlyph } from './NoteGlyph';
import { ResultOverlay } from './ResultOverlay';

interface DurationQuizProps {
  level: ExtendedLevel;
  best: LevelResult | undefined;
  hasNext: boolean;
  onExit: () => void;
  onNext: () => void;
  /** Dipanggil sekali setiap percobaan selesai (untuk menyimpan progres). */
  onComplete: (outcome: RhythmOutcome) => void;
}

type Phase = 'brief' | 'play' | 'result';

/**
 * Kuis nilai not (Materi 2): tampil satu simbol not, pemain memilih berapa
 * ketukan nilainya. Tanpa batas waktu, tanpa suara (agar jawabannya tidak
 * terbaca dari panjang bunyi).
 */
export const DurationQuiz = ({ level, best, hasNext, onExit, onNext, onComplete }: DurationQuizProps) => {
  const count = level.duration?.count ?? 8;

  const [questions, setQuestions] = useState<DurationCard[]>(() => pickQuestions(count));
  const [options, setOptions] = useState<AnswerOption[]>(() => shuffleOptions());

  const [phase, setPhase] = useState<Phase>('brief');
  const [index, setIndex] = useState(0);
  const [verdicts, setVerdicts] = useState<(Verdict | null)[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [tray, setTray] = useState<TrayMessage | null>(null);
  const [outcome, setOutcome] = useState<RhythmOutcome | null>(null);

  const trayIdRef = useRef(0);
  const reportedRef = useRef(false);

  const current: DurationCard | null = questions[index] ?? null;
  const answered = picked !== null;
  const pickedCorrect = answered && current ? picked === current.beats : false;

  const pushTray = useCallback((kind: TrayMessage['kind'], title: string, detail?: string) => {
    trayIdRef.current += 1;
    setTray({ id: trayIdRef.current, kind, title, detail });
  }, []);

  const start = useCallback(() => {
    const nextQuestions = pickQuestions(count);
    setQuestions(nextQuestions);
    setOptions(shuffleOptions());
    setVerdicts(nextQuestions.map(() => null));
    setIndex(0);
    setPicked(null);
    setTray(null);
    setOutcome(null);
    reportedRef.current = false;
    setPhase('play');
  }, [count]);

  const answer = useCallback(
    (value: number) => {
      if (phase !== 'play' || picked !== null || !current) return;
      const correct = value === current.beats;
      const next = [...verdicts];
      next[index] = correct ? 'perfect' : 'miss';
      setVerdicts(next);
      setPicked(value);
      if (correct) {
        pushTray('perfect', 'Benar!', `${current.nama} bernilai ${current.beats} ketukan`);
      } else {
        pushTray('miss', 'Belum tepat', `${current.nama} bernilai ${current.beats} ketukan, bukan ${value}`);
      }
    },
    [current, index, phase, picked, pushTray, verdicts]
  );

  const advance = useCallback(() => {
    if (index + 1 >= questions.length) {
      setPhase('result');
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
  }, [index, questions.length]);

  // Nilai hasil sekali per percobaan (dijaga dari StrictMode & dari
  // perubahan identitas prop onComplete).
  useEffect(() => {
    if (phase !== 'result' || reportedRef.current) return;
    reportedRef.current = true;
    const finalVerdicts = verdicts.map((verdict) => verdict ?? 'miss');
    const counts = countVerdicts(finalVerdicts);
    const stars = starsFor(finalVerdicts, counts);
    const result: RhythmOutcome = {
      stars,
      crown: crownFor(stars, counts),
      score: Math.round(accuracyFrom(finalVerdicts)),
      counts,
    };
    setOutcome(result);
    onComplete(result);
  }, [onComplete, phase, verdicts]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  const progress = questions.length > 0 ? index / questions.length : 0;

  return (
    <div className="lv-quiz" id="level-quiz" data-level={level.id} data-kind="duration">
      <header className="lv-quiz__header">
        <button type="button" className="lv-quiz__exit" onClick={onExit} aria-label="Keluar dari kuis">
          <span aria-hidden="true">×</span> Keluar
        </button>
        <div
          className="lv-quiz__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span className="lv-quiz__progress-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
        <p className="lv-quiz__meta" data-score={verdicts.filter((v) => v === 'perfect').length}>
          benar {verdicts.filter((v) => v === 'perfect').length}/{questions.length}
        </p>
      </header>

      <div className="lv-quiz__stage">
        <div className="lv-quiz__info">
          <h1 className="lv-quiz__title">
            {levelLabel(level)} · {level.judul}
          </h1>
          <p className="lv-quiz__sub">
            Soal {Math.min(index + 1, questions.length)}/{questions.length}
          </p>
        </div>

        {phase === 'brief' ? (
          <div className="lv-brief">
            <p className="lv-brief__title">Cara bermain</p>
            <ol className="lv-brief__list">
              <li>Satu simbol not ditampilkan.</li>
              <li>Pilih berapa ketukan nilai simbol itu (birama 4/4: not 1/4 = 1 ketukan).</li>
              <li>Tidak ada batas waktu. Hitung dulu, lalu pilih jawabannya.</li>
            </ol>
            {best && (
              <p className="lv-brief__best" data-best-stars={best.stars}>
                Bintang terbaikmu: {best.stars}/3 · skor terbaik {Math.round(best.bestAccuracy)}%
              </p>
            )}
            <button type="button" className="lv-btn lv-btn--primary" id="startLevel" onClick={start}>
              Mulai
            </button>
          </div>
        ) : (
          current && (
            <>
              <div className="lv-glyph-stage" data-card={current.id}>
                <NoteGlyph
                  kind="note"
                  glyph={current.glyph}
                  size={140}
                  title={`${current.nama} ${current.nilai}`}
                />
              </div>

              <p className="lv-quiz__sub">Not ini berapa ketukan?</p>

              <div className="lv-answers" role="group" aria-label="Pilihan nilai ketukan">
                {options.map((option) => {
                  const isPicked = picked === option.value;
                  const state = !answered
                    ? ''
                    : option.value === current.beats
                      ? ' is-correct'
                      : isPicked
                        ? ' is-wrong'
                        : '';
                  return (
                    <button
                      key={option.label}
                      type="button"
                      className={`lv-answer${state}`}
                      data-value={option.value}
                      disabled={answered}
                      onClick={() => answer(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <p className="lv-hint" data-answer={pickedCorrect ? 'correct' : 'wrong'}>
                  {pickedCorrect
                    ? `Tepat! ${current.nama} bernilai ${current.beats} ketukan.`
                    : `${current.nama} bernilai ${current.beats} ketukan.`}
                </p>
              )}

              {answered && (
                <button type="button" className="lv-btn lv-btn--primary" id="nextQuestion" onClick={advance}>
                  {index + 1 >= questions.length ? 'Lihat hasil' : 'Soal berikutnya'}
                </button>
              )}
            </>
          )
        )}
      </div>

      <FeedbackTray message={tray} />

      {phase === 'result' && outcome && (
        <ResultOverlay
          variant="quiz"
          levelJudul={level.judul}
          outcome={outcome}
          previousBest={best?.stars ?? 0}
          hasNext={hasNext}
          onRetry={start}
          onNext={onNext}
          onClose={onExit}
        />
      )}
    </div>
  );
};
