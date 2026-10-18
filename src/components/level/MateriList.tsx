import { MATERIALS, type MaterialId } from '../../data/materials';
import type { MaterialStats } from '../../hooks/useLevelProgress';
import { MentorBubble } from '../mentor/MentorBubble';
import { StarIcon } from './Stars';

interface MateriListProps {
  statsOf: (materialId: MaterialId) => MaterialStats;
  isUnlocked: (materialId: MaterialId) => boolean;
  onSelect: (materialId: MaterialId) => void;
}

/**
 * Daftar materi (halaman Level tanpa segmen materi): tiga kartu yang terbuka
 * berurutan. Klik kartu membuka path level materi tersebut.
 */
export const MateriList = ({ statsOf, isUnlocked, onSelect }: MateriListProps) => (
  <section className="lv-materi" aria-label="Daftar materi latihan">
    <div className="lv-path__intro">
      <h2 className="lv-path__heading">Materi Latihan</h2>
    </div>

    {/* Maskot pendamping: teks pengantar "diucapkan" lewat bubble-nya. */}
    <MentorBubble
      className="lv-materi__guide"
      pose="wave"
      direction="right"
      text="Tiap materi dimulai dengan pengenalan singkat, lalu kuis. Selesaikan satu materi untuk membuka materi berikutnya."
    />

    <ol className="lv-materi__list @container">
      {MATERIALS.map((material) => {
        const unlocked = isUnlocked(material.id);
        const stats = statsOf(material.id);
        const complete = stats.done === stats.total;

        return (
          <li key={material.id}>
            <div
              className={`lv-materi__card${unlocked ? '' : ' is-locked'}${complete ? ' is-done' : ''}`}
              data-materi={material.id}
              data-unlocked={unlocked ? 'true' : 'false'}
            >
              <button
                type="button"
                className="lv-materi__button"
                onClick={() => onSelect(material.id)}
                disabled={!unlocked}
                aria-label={
                  unlocked
                    ? `Materi ${material.urutan}: ${material.judul}, ${stats.stars} dari ${stats.max} bintang`
                    : `Materi ${material.urutan}: ${material.judul} (terkunci)`
                }
              >
                <span className="lv-materi__num">{material.urutan}</span>
                <span className="lv-materi__text">
                  <span className="lv-materi__title">{material.judul}</span>
                </span>
              </button>

              <div className="lv-materi__foot">
                <span className="lv-materi__progress">
                  <StarIcon className="lv-materi__star" />{' '}
                  {stats.stars} / {stats.max} · {stats.done}/{stats.total} level
                </span>
                {!unlocked && <span className="lv-materi__lock">Terkunci</span>}
                {complete && <span className="lv-materi__badge">Tuntas</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  </section>
);
