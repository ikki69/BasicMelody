import { isQuizKind, type ExtendedLevel } from '../../data/levelsExtended';
import { Stars } from './Stars';

interface LevelCardProps {
  level: ExtendedLevel;
  stars: number;
  done: boolean;
  crown: boolean;
  unlocked: boolean;
  onSelect: (levelId: string) => void;
}

/** Satu node level pada path — bulat, dengan bintang & gembok. */
export const LevelCard = ({ level, stars, done, crown, unlocked, onSelect }: LevelCardProps) => {
  const quiz = isQuizKind(level.kind);
  const state = !unlocked ? 'locked' : done ? 'done' : 'open';
  const statusText = !unlocked
    ? 'terkunci'
    : quiz
      ? done
        ? `${stars} bintang`
        : 'belum dituntaskan'
      : done
        ? 'pengenalan selesai'
        : 'pengenalan';

  return (
    <div
      className={`lv-node is-${state}`}
      data-level={level.id}
      data-kind={level.kind}
      role="button"
      tabIndex={unlocked ? 0 : -1}
      aria-disabled={!unlocked}
      aria-label={
        unlocked
          ? `Level ${level.urutan}, ${level.judul}, ${statusText}`
          : `Level ${level.urutan}, ${level.judul} (terkunci)`
      }
      onClick={() => unlocked && onSelect(level.id)}
      onKeyDown={(event) => {
        if (!unlocked || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        onSelect(level.id);
      }}
    >
      <div
        className="lv-node__button"
        aria-hidden="true"
      >
        {unlocked ? (
          <span className="lv-node__num">{level.urutan}</span>
        ) : (
          <svg className="lv-node__lock" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="9.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
        {crown && (
          <span className="lv-node__crown" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path
                d="M5 18.5 3.8 8.5l4.7 3.2L12 5.5l3.5 6.2 4.7-3.2L19 18.5H5z"
                fill="currentColor"
              />
            </svg>
          </span>
        )}
      </div>

      <div className="lv-node__meta">
        <p className="lv-node__title">
          Level {level.urutan} · {level.judul}
        </p>
        {quiz ? (
          <Stars value={stars} className="lv-node__stars" />
        ) : (
          <p className="lv-node__tag" data-intro-done={done ? 'true' : 'false'}>
            {done ? 'Pengenalan selesai' : 'Pengenalan'}
          </p>
        )}
      </div>
    </div>
  );
};
