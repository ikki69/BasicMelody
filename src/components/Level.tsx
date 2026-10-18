import { useCallback, useMemo, useState } from 'react';
import {
  MATERIAL_LEGENDS,
  TOTAL_LEVELS,
  TOTAL_STARS_MAX,
  getExtendedLevel,
  levelsByMaterial,
  nextLevelOf,
  toRhythmLevel,
  type ExtendedLevel,
} from '../data/levelsExtended';
import { getMaterialById, MATERIALS, type MaterialId } from '../data/materials';
import { achievementById, type Achievement } from '../data/rhythm';
import { isIntroCompleted, useLevelProgress } from '../hooks/useLevelProgress';
import type { RhythmOutcome } from '../hooks/useRhythmGame';
import { bigConfetti, burstConfetti } from '../lib/celebrate';
import { levelHashFor } from '../lib/levelRoute';
import { navigateWithFade } from '../lib/navigate';
import { HudLevel } from './HudLevel';
import { AchievementPopup } from './level/AchievementPopup';
import { BadgeCollection } from './level/BadgeCollection';
import { DurationQuiz } from './level/DurationQuiz';
import { IntroLevel } from './level/IntroLevel';
import { LevelPath } from './level/LevelPath';
import { LevelQuiz } from './level/LevelQuiz';
import { LockIcon } from './level/LockIcon';
import { LockedNotice } from './level/LockedNotice';
import { MateriList } from './level/MateriList';
import { PositionQuiz } from './level/PositionQuiz';
import { StarIcon } from './level/Stars';
import { poseForMaterial } from './mentor/mentorPoses';

interface LevelProps {
  /** Materi yang sedang dibuka (dari hash); null = daftar materi. */
  materiId: MaterialId | null;
}

/**
 * Halaman Level — daftar materi → path level → kuis (ala Duolingo, versi gelap).
 *
 * Terkunci sampai halaman Introduction dituntaskan. Level 1 tiap materi adalah
 * pengenalan (tanpa kuis/bintang), level 2+ adalah kuis. Semua progres disimpan
 * ke localStorage; badge yang baru diraih muncul sebagai popup.
 */
export const Level = ({ materiId }: LevelProps) => {
  const [introDone] = useState(isIntroCompleted);
  const store = useLevelProgress();

  // Level yang sedang terbuka (state, bukan route). Karena <Level> di-remount
  // lewat key saat route berubah, pindah hash — termasuk tombol "back" browser —
  // otomatis menutup layar kuis.
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);

  const material = materiId ? getMaterialById(materiId) ?? null : null;
  const materialUnlocked = material ? store.isMaterialUnlocked(material.id) : false;

  const activeLevel = useMemo(
    () => (activeLevelId === null ? null : getExtendedLevel(activeLevelId) ?? null),
    [activeLevelId]
  );

  const dismissAchievement = useCallback(() => setQueue((prev) => prev.slice(1)), []);

  /** Antre badge baru + rayakan bila perlu. */
  const celebrate = useCallback((earned: string[], stars: number) => {
    const newBadges = earned
      .map((id) => achievementById(id))
      .filter((badge): badge is Achievement => Boolean(badge));

    if (newBadges.length > 0) setQueue((prev) => [...prev, ...newBadges]);

    if (earned.includes('special-master')) bigConfetti();
    else if (newBadges.length > 0 || stars === 3) burstConfetti();
  }, []);

  const openLevel = useCallback(
    (levelId: string) => {
      if (!introDone) return;
      const level = getExtendedLevel(levelId);
      if (!level || !store.isLevelUnlocked(level)) return;
      setActiveLevelId(levelId);
    },
    [introDone, store]
  );

  const closeLevel = useCallback(() => setActiveLevelId(null), []);

  const goToNextLevel = useCallback(() => {
    setActiveLevelId((current) => {
      if (current === null) return null;
      const level = getExtendedLevel(current);
      if (!level) return null;
      const next = nextLevelOf(level);
      return next ? next.id : null;
    });
  }, []);

  /** Level kuis selesai: simpan hasil, lalu lanjut ke badge. */
  const handleQuizComplete = useCallback(
    (outcome: RhythmOutcome) => {
      if (activeLevelId === null) return;
      const { earned } = store.recordResult(activeLevelId, {
        stars: outcome.stars,
        accuracy: outcome.score,
        crown: outcome.crown,
      });
      celebrate(earned, outcome.stars);
    },
    [activeLevelId, store, celebrate]
  );

  /** Level pengenalan selesai: tandai tuntas, lalu langsung buka kuisnya. */
  const handleIntroComplete = useCallback(() => {
    if (activeLevelId === null) return;
    const level = getExtendedLevel(activeLevelId);
    const { earned } = store.completeIntro(activeLevelId);
    celebrate(earned, 0);

    const next = level ? nextLevelOf(level) : null;
    setActiveLevelId(next ? next.id : null);
  }, [activeLevelId, store, celebrate]);

  const renderLevel = (level: ExtendedLevel) => {
    const best = store.progress[level.id];
    const next = nextLevelOf(level);
    const hasNext = next !== null;

    if (level.kind === 'intro') {
      return (
        <IntroLevel
          key={level.id}
          level={level}
          onComplete={handleIntroComplete}
          onExit={closeLevel}
        />
      );
    }

    if (level.kind === 'position-quiz') {
      return (
        <PositionQuiz
          key={level.id}
          level={level}
          best={best}
          hasNext={hasNext}
          onExit={closeLevel}
          onNext={goToNextLevel}
          onComplete={handleQuizComplete}
        />
      );
    }

    if (level.kind === 'duration-quiz') {
      return (
        <DurationQuiz
          key={level.id}
          level={level}
          best={best}
          hasNext={hasNext}
          onExit={closeLevel}
          onNext={goToNextLevel}
          onComplete={handleQuizComplete}
        />
      );
    }

    return (
      <LevelQuiz
        key={level.id}
        level={toRhythmLevel(level)}
        best={best}
        hasNext={hasNext}
        onExit={closeLevel}
        onNext={goToNextLevel}
        onComplete={handleQuizComplete}
        label={`Level ${level.urutan}`}
      />
    );
  };

  const previousMaterial = useMemo(() => {
    if (!material) return null;
    const index = MATERIALS.findIndex((item) => item.id === material.id);
    return index > 0 ? MATERIALS[index - 1] : null;
  }, [material]);

  return (
    <>
      {activeLevel ? (
        renderLevel(activeLevel)
      ) : (
        <div className="intro-page level-page">
          <header className="intro-header">
            <a className="intro-logo" href="#/" aria-label="Kembali ke halaman utama Basicmelody">
              Basicmelody.
            </a>
            <p className="step-indicator" aria-live="polite">
              {introDone ? (
                <>
                  <StarIcon className="step-indicator__star" />{' '}
                  {store.totalStars} / {TOTAL_STARS_MAX} · {store.completedCount}/{TOTAL_LEVELS} level
                </>
              ) : (
                '3 / 3 · terkunci'
              )}
            </p>
          </header>

          <div className={`level-shell${material ? ' level-shell--wide' : ''}`}>
            {!introDone ? (
              <LockedNotice />
            ) : !material ? (
              <>
                <MateriList
                  statsOf={store.materialStats}
                  isUnlocked={store.isMaterialUnlocked}
                  onSelect={(id) => navigateWithFade(levelHashFor(id))}
                />
                <BadgeCollection earned={store.earnedAchievements} />
              </>
            ) : materialUnlocked ? (
              <LevelPath
                judul={`Materi ${material.urutan} · ${material.judul}`}
                lead={material.deskripsi}
                legend={MATERIAL_LEGENDS[material.id]}
                pose={poseForMaterial(material.id)}
                levels={levelsByMaterial(material.id)}
                starsOf={store.starsOf}
                isDone={store.isDone}
                isCrown={store.isCrown}
                isUnlocked={store.isLevelUnlocked}
                onSelect={openLevel}
                onBack={() => navigateWithFade(levelHashFor())}
              />
            ) : (
              <section className="lv-locked" aria-label="Materi terkunci">
                <LockIcon />
                <h2 className="lv-locked__title">Materi masih terkunci</h2>
                <p className="lv-locked__text">
                  Selesaikan dulu level terakhir{' '}
                  <strong>{previousMaterial ? `Materi ${previousMaterial.urutan} · ${previousMaterial.judul}` : 'materi sebelumnya'}</strong>.
                  Setelah itu materi ini terbuka otomatis.
                </p>
                <button
                  type="button"
                  className="lv-btn lv-btn--primary"
                  id="backToMaterials"
                  onClick={() => navigateWithFade(levelHashFor())}
                >
                  Lihat Daftar Materi
                </button>
              </section>
            )}
          </div>

          <HudLevel />
        </div>
      )}

      {queue.length > 0 && <AchievementPopup achievement={queue[0]} onDismiss={dismissAchievement} />}
    </>
  );
};
