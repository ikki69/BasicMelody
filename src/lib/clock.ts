/**
 * Penjaga jam audio untuk kuis ritme dan demo ketukan.
 *
 * Tone Transport dipakai sebagai acuan waktu saat audio tersedia. Dua hal bisa
 * membuatnya tidak layak dipakai, dan keduanya tidak boleh membekukan permainan:
 *  1. Audio tidak kunjung siap (memuat Tone atau ditahan kebijakan autoplay).
 *  2. AudioContext melaporkan state `running` tetapi tidak benar-benar berjalan
 *     (tanpa perangkat keluaran, tab tanpa fokus, dsb).
 *
 * Dalam dua hal itu waktu dialihkan ke jam visual `performance.now()`.
 */

/** Tenggang tunggu audio sebelum beralih ke jam visual (ms). */
export const AUDIO_GRACE_MS = 2500;

/** Batas deteksi jam audio yang macet (ms) dan ambang pergerakan transport (detik). */
export const CLOCK_STALL_MS = 900;
export const CLOCK_STALL_EPSILON = 0.25;

/** Titik ukur jam audio: waktu dinding (ms) + posisi transport (detik). */
export interface ClockProbe {
  perf: number;
  seconds: number;
}

/**
 * Apakah jam audio tampak macet: waktu dinding sudah lewat tenggang, tetapi
 * posisi transport tidak bergerak berarti.
 */
export const isAudioClockStalled = (
  probe: ClockProbe,
  audioSeconds: number,
  nowPerf: number
): boolean =>
  nowPerf - probe.perf > CLOCK_STALL_MS &&
  audioSeconds - probe.seconds < CLOCK_STALL_EPSILON;
