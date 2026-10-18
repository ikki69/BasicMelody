import { useCallback, useEffect, useRef, useState } from 'react';
import { RHYTHM_PADS, padFor, type PadNote } from '../../data/rhythm';
import { levelLabel, type ExtendedLevel, type PositionMode } from '../../data/levelsExtended';
import type { LevelResult } from '../../hooks/useLevelProgress';
import type { PadFlash, RhythmOutcome, TrayMessage } from '../../hooks/useRhythmGame';
import { playNotePreview } from '../../lib/audio';
import { accuracyFrom, countVerdicts, crownFor, starsFor, type Verdict } from '../../lib/rhythm';
import { FeedbackTray } from './FeedbackTray';
import { NotePads } from './NotePads';
import { OrnateFrame } from '../OrnateFrame';
import { PositionStaff } from './PositionStaff';
import { ResultOverlay } from './ResultOverlay';

interface PositionQuizProps {
  level: ExtendedLevel;
  best: LevelResult | undefined;
  hasNext: boolean;
  onExit: () => void;
  onNext: () => void;
  /** Dipanggil sekali setiap percobaan selesai (untuk menyimpan progres). */
  onComplete: (outcome: RhythmOutcome) => void;
}

type Phase = 'brief' | 'play' | 'result';

const pickNotes = (count: number): PadNote[] => {
  const notes: PadNote[] = [];
  let previous: PadNote | null = null;
  for (let index = 0; index < count; index += 1) {
    const pool = RHYTHM_PADS.map((pad) => pad.note).filter((note) => note !== previous);
    const note = pool[Math.floor(Math.random() * pool.length)];
    notes.push(note);
    previous = note;
  }
  return notes;
};

const modeFor = (mode: PositionMode, index: number): 'visual' | 'audio' => {
  if (mode === 'visual') return 'visual';
  if (mode === 'audio') return 'audio';
  return index % 2 === 0 ? 'visual' : 'audio';
};

/**
 * Kuis posisi not (Materi 1): satu nada ditampilkan di paranada atau hanya
 * dibunyikan, pemain menekan kotak nada yang benar. Tanpa batas waktu.
 */
export const PositionQuiz = ({ level, best, hasNext, onExit, onNext, onComplete }: PositionQuizProps) => {
  const mode = level.position?.mode ?? 'visual';
  const count = level.position?.count ?? 8;

  const [questions, setQuestions] = useState<PadNote[]>(() => pickNotes(count));

  const [phase, setPhase] = useState<Phase>('brief');
  const [index, setIndex] = useState(0);
  const [verdicts, setVerdicts] = useState<(Verdict | null)[]>([]);
  const [picked, setPicked] = useState<PadNote | null>(null);
  const [answeredCorrect, setAnsweredCorrect] = useState<boolean | null>(null);
  const [tray, setTray] = useState<TrayMessage | null>(null);
  const [flash, setFlash] = useState<PadFlash | null>(null);
  const [outcome, setOutcome] = useState<RhythmOutcome | null>(null);
  const [silent, setSilent] = useState(false);

  const trayIdRef = useRef(0);
  const reportedRef = useRef(false);

  const current = questions[index] ?? null;
  const currentMode = modeFor(mode, index);
  /** Not yang tampil di paranada: mode lihat selalu tampil, mode dengar saat sudah dijawab. */
  const staffNote = currentMode === 'visual' ? current : answeredCorrect === null ? null : current;

  const pushTray = useCallback((kind: TrayMessage['kind'], title: string, detail?: string) => {
    trayIdRef.current += 1;
    setTray({ id: trayIdRef.current, kind, title, detail });
  }, []);

  const start = useCallback(() => {
    const nextQuestions = pickNotes(count);
    setQuestions(nextQuestions);
    setVerdicts(nextQuestions.map(() => null));
    setIndex(0);
    setPicked(null);
    setAnsweredCorrect(null);
    setTray(null);
    setOutcome(null);
    reportedRef.current = false;
    setPhase('play');
  }, [count]);

  const answer = useCallback(
    (note: PadNote) => {
      if (phase !== 'play' || answeredCorrect !== null || !current) return;

      const correct = note === current;
      const next = [...verdicts];
      next[index] = correct ? 'perfect' : 'miss';
      setVerdicts(next);
      setPicked(note);
      setAnsweredCorrect(correct);
      setFlash({ id: Date.now(), note, ok: correct });

      if (correct) {
        pushTray('perfect', 'Benar!', `${padFor(current).label} memang di ${padFor(current).posisi}`);
      } else {
        pushTray(
          'miss',
          `Bukan itu: ${padFor(current).label}`,
          `${padFor(current).label} berada di ${padFor(current).posisi}`
        );
      }
    },
    [answeredCorrect, current, index, phase, pushTray, verdicts]
  );

  const advance = useCallback(() => {
    if (index + 1 >= questions.length) {
      setPhase('result');
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
    setAnsweredCorrect(null);
  }, [index, questions.length]);

  // Bunyikan nada saat soal baru muncul (mode dengar / campuran).
  useEffect(() => {
    if (phase !== 'play' || !current) return;
    if (modeFor(mode, index) !== 'audio') return;
    void playNotePreview(current, 0.9).then((ok) => {
      if (!ok) setSilent(true);
    });
  }, [current, index, mode, phase]);

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

  const handleRetry = useCallback(() => {
    start();
  }, [start]);

  const progress = questions.length > 0 ? index / questions.length : 0;

  return (
    <div
      className="lv-quiz"
      id="level-quiz"
      data-level={level.id}
      data-kind="position"
      data-picked={picked ?? ''}
    >
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
            {mode === 'audio' ? 'Latihan telinga' : mode === 'mixed' ? 'Campuran' : 'Membaca paranada'} · soal{' '}
            {Math.min(index + 1, questions.length)}/{questions.length}
          </p>
        </div>

        {phase === 'brief' ? (
          <div className="lv-brief">
            <p className="lv-brief__title">Cara bermain</p>
            <ol className="lv-brief__list">
              <li>
                {mode === 'audio'
                  ? 'Sebuah nada dibunyikan. Paranada tidak menampilkan notnya.'
                  : 'Sebuah not muncul di paranada.'}
              </li>
              <li>
                Tekan kotak nada (<strong>C D E F G</strong>) yang menurutmu benar. Bisa juga pakai tombol
                keyboard C, D, E, F, G.
              </li>
              <li>Tidak ada batas waktu. Pikirkan dulu, lalu tekan.</li>
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
          <>
            <OrnateFrame className="lv-staff-frame">
              <div className="lv-staff-wrap">
                <PositionStaff note={staffNote} />
              </div>
            </OrnateFrame>

            {currentMode === 'audio' && answeredCorrect === null && (
              <button
                type="button"
                className="lv-btn lv-btn--ghost"
                id="replayNote"
                onClick={() => {
                  if (current) void playNotePreview(current, 0.9).then((ok) => { if (!ok) setSilent(true); });
                }}
              >
                Putar ulang nada
              </button>
            )}

            {answeredCorrect !== null && current && (
              <p className="lv-hint" data-answer={answeredCorrect ? 'correct' : 'wrong'}>
                {answeredCorrect
                  ? `Tepat! Itu nada ${padFor(current).label} (${padFor(current).posisi}).`
                  : `Jawaban yang benar: ${padFor(current).label} (${padFor(current).posisi}).`}
              </p>
            )}

            <NotePads onPress={answer} disabled={phase !== 'play' || answeredCorrect !== null} flash={flash} />

            {answeredCorrect !== null && (
              <button type="button" className="lv-btn lv-btn--primary" id="nextQuestion" onClick={advance}>
                {index + 1 >= questions.length ? 'Lihat hasil' : 'Soal berikutnya'}
              </button>
            )}

            {silent && <p className="lv-brief__warn">Audio tidak aktif, tebak dari petunjuk visualnya.</p>}
          </>
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
          onRetry={handleRetry}
          onNext={onNext}
          onClose={onExit}
        />
      )}
    </div>
  );
};
