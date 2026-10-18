import { type ExtendedLevel, type LegendItem } from '../../data/levelsExtended';
import { MentorBubble } from '../mentor/MentorBubble';
import type { MentorPose } from '../mentor/mentorPoses';
import { BadgeIcon } from './BadgeIcon';
import { LevelCard } from './LevelCard';

interface LevelPathProps {
  judul: string;
  /** Deskripsi materi — "diucapkan" maskot lewat bubble di kiri peta. */
  lead: string;
  legend: LegendItem[];
  /** Pose maskot pendamping (mengikuti materi). */
  pose: MentorPose;
  levels: ExtendedLevel[];
  starsOf: (levelId: string) => number;
  isDone: (levelId: string) => boolean;
  isCrown: (levelId: string) => boolean;
  isUnlocked: (level: ExtendedLevel) => boolean;
  onSelect: (levelId: string) => void;
  onBack: () => void;
}

/**
 * Path level satu materi: maskot pendamping di kiri (bubble berisi deskripsi
 * materi) dan deretan node level di kanannya, plus tombol kembali ke daftar
 * materi.
 */
export const LevelPath = ({
  judul,
  lead,
  legend,
  pose,
  levels,
  starsOf,
  isDone,
  isCrown,
  isUnlocked,
  onSelect,
  onBack,
}: LevelPathProps) => (
  <section className="lv-path" aria-label={`Daftar level materi ${judul}`}>
    <div className="lv-path__bar">
      <button type="button" className="lv-btn lv-btn--ghost" id="backToMaterials" onClick={onBack}>
        ← Daftar Materi
      </button>
    </div>

    <div className="lv-path__intro">
      <h2 className="lv-path__heading">{judul}</h2>
      {legend.length > 0 && (
        <ul className="lv-legend" aria-label={`Panduan ${judul}`}>
          {legend.map((item) => (
            <li key={item.key}>
              <span className="lv-legend__key">{item.key}</span> {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>

    <div className="lv-path__body">
      {/* Maskot pendamping: deskripsi materi "diucapkan" lewat bubble-nya. */}
      <MentorBubble className="lv-path__guide" pose={pose} direction="left" text={lead} />

      <ol className="lv-path__list">
        {levels.map((level, index) => (
          <li key={level.id} className={`lv-path__item is-${index % 2 === 0 ? 'left' : 'right'}`}>
            <LevelCard
              level={level}
              stars={starsOf(level.id)}
              done={isDone(level.id)}
              crown={isCrown(level.id)}
              unlocked={isUnlocked(level)}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ol>
    </div>

    <p className="lv-path__foot">
      <span className="lv-path__foot-icon" aria-hidden="true">
        <BadgeIcon name="trophy" />
      </span>
      Level 1 tiap materi adalah pengenalan (tanpa bintang). Raih 3 bintang tanpa satu pun kesalahan
      untuk mendapatkan mahkota.
    </p>
  </section>
);
