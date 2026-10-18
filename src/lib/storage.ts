/**
 * Pembungkus aman untuk localStorage.
 *
 * Semua akses dibungkus try/catch karena localStorage bisa melempar error
 * (mode privat, kebijakan browser, kuota penuh). Bila gagal, aplikasi tetap
 * berjalan seperti biasa — hanya progres yang tidak tersimpan.
 *
 * Semua key diberi namespace + versi supaya aman berevolusi di masa depan.
 */
const PREFIX = 'basicmelody.v1';

/** Key yang dipakai aplikasi. */
export const STORAGE_KEYS = {
  /** 'true' bila pengguna sudah menuntaskan halaman Introduction. */
  introCompleted: 'intro.completed',
  /** Peta progres per level versi lama: { [levelId angka]: LevelResult }. */
  levelProgress: 'level.progress',
  /** Daftar id achievement versi lama. */
  achievements: 'level.achievements',
  /** Peta progres per level (materi → level): { [levelId]: LevelResult }. */
  levelProgressV2: 'level.progress.v2',
  /** Daftar id achievement (id = id level, mis. 'm1-2'). */
  achievementsV2: 'level.achievements.v2',
} as const;

const fullKey = (key: string): string => `${PREFIX}.${key}`;

export const readJSON = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(fullKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const writeJSON = (key: string, value: unknown): boolean => {
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const readFlag = (key: string): boolean => {
  try {
    return window.localStorage.getItem(fullKey(key)) === 'true';
  } catch {
    return false;
  }
};

export const writeFlag = (key: string, value: boolean): boolean => {
  try {
    if (value) window.localStorage.setItem(fullKey(key), 'true');
    else window.localStorage.removeItem(fullKey(key));
    return true;
  } catch {
    return false;
  }
};
