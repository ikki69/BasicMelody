import { ACHIEVEMENTS, type Achievement } from '../../data/rhythm';
import { BadgeIcon } from './BadgeIcon';

interface BadgeCollectionProps {
  earned: Achievement[];
}

/** Koleksi badge: yang sudah diraih terang, yang belum redup. */
export const BadgeCollection = ({ earned }: BadgeCollectionProps) => {
  const earnedIds = earned.map((item) => item.id);

  return (
    <section className="lv-badges" aria-label="Koleksi badge">
      <header className="lv-badges__head">
        <h3 className="lv-badges__title">Koleksi Badge</h3>
        <p className="lv-badges__count" data-earned-count={earnedIds.length}>
          {earnedIds.length} / {ACHIEVEMENTS.length}
        </p>
      </header>

      <ul className="lv-badges__list">
        {ACHIEVEMENTS.map((badge) => {
          const isEarned = earnedIds.includes(badge.id);
          return (
            <li key={badge.id} className={`lv-badge${isEarned ? ' is-earned' : ''}`} data-badge={badge.id}>
              <span className="lv-badge__icon" aria-hidden="true">
                <BadgeIcon name={badge.ikon} />
              </span>
              <span className="lv-badge__text">
                <span className="lv-badge__name">{badge.nama}</span>
                <span className="lv-badge__desc">{isEarned ? badge.deskripsi : 'Belum diraih'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
