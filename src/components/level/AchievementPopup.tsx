import { useEffect } from 'react';
import type { Achievement } from '../../data/rhythm';
import { BadgeIcon } from './BadgeIcon';

interface AchievementPopupProps {
  achievement: Achievement;
  onDismiss: () => void;
  /** Lama popup tampil sebelum menutup sendiri (ms). */
  duration?: number;
}

/** Popup badge yang diraih — muncul di atas layar lalu hilang sendiri. */
export const AchievementPopup = ({ achievement, onDismiss, duration = 3600 }: AchievementPopupProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onDismiss, achievement.id]);

  return (
    <div className="lv-achievement" role="status" aria-live="polite" data-badge={achievement.id}>
      <span className="lv-achievement__icon" aria-hidden="true">
        <BadgeIcon name={achievement.ikon} />
      </span>
      <span className="lv-achievement__text">
        <span className="lv-achievement__label">Achievement unlocked</span>
        <span className="lv-achievement__name">{achievement.nama}</span>
      </span>
      <button type="button" className="lv-achievement__close" onClick={onDismiss} aria-label="Tutup pemberitahuan">
        ×
      </button>
    </div>
  );
};
