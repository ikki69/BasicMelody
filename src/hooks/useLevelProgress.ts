import { useCallback, useMemo, useState } from 'react';
import {
  EXTENDED_LEVELS,
  QUIZ_LEVELS,
  lastLevelOfMaterial,
  levelsByMaterial,
  starsMaxOfMaterial,
  type ExtendedLevel,
} from '../data/levelsExtended';
import { MATERIALS, type MaterialId } from '../data/materials';
import { ACHIEVEMENTS } from '../data/rhythm';
import { STORAGE_KEYS, readFlag, readJSON, writeFlag, writeJSON } from '../lib/storage';

export interface LevelResult {
  stars: number;
  bestAccuracy: number;
  crown: boolean;
  attempts: number;
  /** true bila level sudah tuntas (pengenalan cukup ditekan selesai). */
  done: boolean;
}

export type LevelProgressMap = Record<string, LevelResult>;

const EMPTY: LevelResult = { stars: 0, bestAccuracy: 0, crown: false, attempts: 0, done: false };

/** Id level irama lama (1–6) → id baru pada Materi 3 (m3-2 … m3-7). */
const migrateLegacyProgress = (legacy: Record<string, unknown>): LevelProgressMap => {
  const migrated: LevelProgressMap = {};
  for (const [key, value] of Object.entries(legacy)) {
    const num = Number(key);
    if (!Number.isInteger(num) || num < 1 || num > 6) continue;
    if (!value || typeof value !== 'object') continue;
    const item = value as Partial<LevelResult>;
    migrated[`m3-${num + 1}`] = {
      stars: typeof item.stars === 'number' ? item.stars : 0,
      bestAccuracy: typeof item.bestAccuracy === 'number' ? item.bestAccuracy : 0,
      crown: item.crown === true,
      attempts: typeof item.attempts === 'number' ? item.attempts : 1,
      done: true,
    };
  }
  return migrated;
};

/** Id badge lama (level-1 … level-6) → id level baru pada Materi 3. */
const migrateLegacyBadge = (id: string): string => {
  const match = /^level-(\d+)$/.exec(id);
  return match ? `m3-${Number(match[1]) + 1}` : id;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

/** Progres per level, dengan migrasi sekali dari format lama. */
const readProgress = (): LevelProgressMap => {
  const stored = asRecord(readJSON<unknown>(STORAGE_KEYS.levelProgressV2, null));
  if (stored) return stored as LevelProgressMap;

  const legacy = asRecord(readJSON<unknown>(STORAGE_KEYS.levelProgress, {}));
  const migrated = legacy ? migrateLegacyProgress(legacy) : {};
  writeJSON(STORAGE_KEYS.levelProgressV2, migrated);
  return migrated;
};

const readAchievements = (): string[] => {
  const stored = readJSON<unknown>(STORAGE_KEYS.achievementsV2, null);
  if (Array.isArray(stored)) return stored.filter((id): id is string => typeof id === 'string');

  const legacy = readJSON<unknown>(STORAGE_KEYS.achievements, []);
  const migrated = Array.isArray(legacy)
    ? legacy.filter((id): id is string => typeof id === 'string').map(migrateLegacyBadge)
    : [];
  writeJSON(STORAGE_KEYS.achievementsV2, migrated);
  return migrated;
};

/** Apakah halaman Introduction sudah dituntaskan? */
export const isIntroCompleted = (): boolean => readFlag(STORAGE_KEYS.introCompleted);

/** Tandai Introduction tuntas (dipanggil dari tombol "Mulai Berlatih"). */
export const markIntroCompleted = (): void => {
  writeFlag(STORAGE_KEYS.introCompleted, true);
};

export interface MaterialStats {
  stars: number;
  max: number;
  done: number;
  total: number;
}

export interface RecordedOutcome {
  /** Id badge yang baru saja diraih (untuk memicu popup + confetti). */
  earned: string[];
  /** Hasil tersimpan setelah percobaan ini. */
  level: LevelResult;
}

interface ResultPatch {
  stars?: number;
  bestAccuracy?: number;
  crown?: boolean;
  attempts?: number;
  done?: boolean;
}

/**
 * Progres level + badge, tersimpan di localStorage.
 * Penulisan dilakukan langsung (bukan lewat efek) supaya nilai yang dibaca
 * setelah refresh selalu konsisten.
 */
export const useLevelProgress = () => {
  const [progress, setProgress] = useState<LevelProgressMap>(readProgress);
  const [earnedIds, setEarnedIds] = useState<string[]>(readAchievements);

  const starsOf = useCallback((levelId: string): number => progress[levelId]?.stars ?? 0, [progress]);

  const isDone = useCallback((levelId: string): boolean => progress[levelId]?.done === true, [progress]);

  const isCrown = useCallback((levelId: string): boolean => progress[levelId]?.crown === true, [progress]);

  const attemptsOf = useCallback((levelId: string): number => progress[levelId]?.attempts ?? 0, [progress]);

  /** Level terbuka bila level sebelumnya di materi yang sama sudah tuntas. */
  const isLevelUnlocked = useCallback(
    (level: ExtendedLevel): boolean => {
      if (level.urutan <= 1) return true;
      const previous = levelsByMaterial(level.materialId).find((item) => item.urutan === level.urutan - 1);
      return previous ? progress[previous.id]?.done === true : false;
    },
    [progress]
  );

  /** Materi terbuka bila level terakhir materi sebelumnya sudah tuntas. */
  const isMaterialUnlocked = useCallback(
    (materialId: MaterialId): boolean => {
      const index = MATERIALS.findIndex((item) => item.id === materialId);
      if (index <= 0) return true;
      const previous = MATERIALS[index - 1];
      const last = lastLevelOfMaterial(previous.id);
      return last ? progress[last.id]?.done === true : false;
    },
    [progress]
  );

  const totalStars = useMemo(
    () => EXTENDED_LEVELS.reduce((sum, level) => sum + (progress[level.id]?.stars ?? 0), 0),
    [progress]
  );

  const completedCount = useMemo(
    () => EXTENDED_LEVELS.filter((level) => progress[level.id]?.done === true).length,
    [progress]
  );

  const materialStats = useCallback(
    (materialId: MaterialId): MaterialStats => {
      const list = levelsByMaterial(materialId);
      return {
        stars: list.reduce((sum, level) => sum + (progress[level.id]?.stars ?? 0), 0),
        max: starsMaxOfMaterial(materialId),
        done: list.filter((level) => progress[level.id]?.done === true).length,
        total: list.length,
      };
    },
    [progress]
  );

  /** Simpan hasil satu level, hitung badge baru, kembalikan ringkasannya. */
  const persist = useCallback((levelId: string, patch: ResultPatch): RecordedOutcome => {
    const stored = readProgress();
    const before = stored[levelId] ?? EMPTY;
    const next: LevelResult = {
      stars: Math.max(before.stars, patch.stars ?? 0),
      bestAccuracy: Math.max(before.bestAccuracy, patch.bestAccuracy ?? 0),
      crown: before.crown || patch.crown === true,
      attempts: before.attempts + (patch.attempts ?? 0),
      done: before.done || patch.done === true,
    };
    const nextProgress: LevelProgressMap = { ...stored, [levelId]: next };
    writeJSON(STORAGE_KEYS.levelProgressV2, nextProgress);

    const already = readAchievements();
    const earned: string[] = [];
    const grant = (id: string) => {
      if (!already.includes(id) && !earned.includes(id)) earned.push(id);
    };

    // Badge level (id badge = id level) saat level tuntas.
    if (next.done && ACHIEVEMENTS.some((item) => item.id === levelId)) grant(levelId);

    const doneCount = EXTENDED_LEVELS.filter((item) => nextProgress[item.id]?.done === true).length;
    if (doneCount >= 1) grant('special-first');

    const crowns = QUIZ_LEVELS.filter((item) => nextProgress[item.id]?.crown === true).length;
    if (crowns >= 1) grant('special-crown');
    if (crowns === QUIZ_LEVELS.length) grant('special-master');

    if (earned.length > 0) writeJSON(STORAGE_KEYS.achievementsV2, [...already, ...earned]);

    setProgress(nextProgress);
    if (earned.length > 0) setEarnedIds([...already, ...earned]);

    return { earned, level: next };
  }, []);

  /** Level kuis selesai: simpan bintang, akurasi, dan mahkota. */
  const recordResult = useCallback(
    (
      levelId: string,
      outcome: { stars: number; accuracy: number; crown: boolean }
    ): RecordedOutcome =>
      persist(levelId, {
        stars: outcome.stars,
        bestAccuracy: outcome.accuracy,
        crown: outcome.crown,
        attempts: 1,
        done: true,
      }),
    [persist]
  );

  /** Level pengenalan selesai: tanpa bintang, hanya ditandai tuntas. */
  const completeIntro = useCallback(
    (levelId: string): RecordedOutcome => persist(levelId, { attempts: 1, done: true }),
    [persist]
  );

  const earnedAchievements = useMemo(
    () => ACHIEVEMENTS.filter((item) => earnedIds.includes(item.id)),
    [earnedIds]
  );

  return {
    progress,
    earnedAchievements,
    starsOf,
    isDone,
    isCrown,
    attemptsOf,
    isLevelUnlocked,
    isMaterialUnlocked,
    materialStats,
    totalStars,
    completedCount,
    recordResult,
    completeIntro,
  };
};
