import type { Synth, getTransport } from 'tone';

/**
 * Audio kuis ritme — singleton tingkat modul.
 *
 * Tone.js dimuat malas (lazy import) saat interaksi pertama pengguna, jadi
 * bundle awal tetap ringan. Synth dibuat sekali dan dipakai ulang antar level
 * supaya masuk/keluar level tidak menunggu pemuatan ulang.
 */
export interface RhythmAudio {
  /** Tone Transport global (tempat semua nada dijadwalkan). */
  transport: ReturnType<typeof getTransport>;
  /** Synth melodi (nada pola). */
  synth: Synth;
  /** Synth klik metronom/hitung-masuk. */
  click: Synth;
}

let audio: RhythmAudio | null = null;
let loading: Promise<RhythmAudio | null> | null = null;
let unavailable = false;

/**
 * Pastikan audio siap. WAJIB dipanggil dari gesture pengguna (klik tombol)
 * agar browser mengizinkan AudioContext berbunyi.
 * Mengembalikan null bila audio tidak tersedia — permainan tetap berjalan
 * memakai jam visual.
 */
export const ensureRhythmAudio = (): Promise<RhythmAudio | null> => {
  if (audio) return Promise.resolve(audio);
  if (loading) return loading;
  if (unavailable) return Promise.resolve(null);

  loading = import('tone')
    .then(async (Tone) => {
      await Tone.start();
      if (Tone.getContext().state !== 'running') {
        // Autoplay diblokir → jalankan mode tanpa suara.
        unavailable = true;
        return null;
      }

      const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.015, decay: 0.16, sustain: 0.22, release: 0.45 },
      }).toDestination();
      synth.volume.value = -8;

      const click = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 },
      }).toDestination();
      click.volume.value = -22;

      const transport = Tone.getTransport();
      transport.stop();
      transport.cancel(0);
      transport.position = 0;

      audio = { transport, synth, click };
      return audio;
    })
    .catch(() => {
      unavailable = true;
      return null;
    })
    .finally(() => {
      loading = null;
    });

  return loading;
};

/** Hentikan transport dan bersihkan jadwal nada, lalu lepaskan nada yang berbunyi. */
export const stopRhythmAudio = (): void => {
  if (!audio) return;
  try {
    audio.transport.stop();
    audio.transport.cancel(0);
    audio.transport.position = 0;
    audio.synth.triggerRelease();
  } catch {
    // Abaikan: transport bisa saja sudah berhenti.
  }
};

/** Apakah mode tanpa suara (autoplay diblokir / Tone gagal dimuat). */
export const isAudioUnavailable = (): boolean => unavailable;

/**
 * Bunyikan satu nada pendek (dipakai halaman pengenalan materi).
 * Selalu dipanggil dari interaksi pengguna. Mengembalikan false bila audio
 * tidak tersedia supaya pemanggil bisa menampilkan penanda "tanpa suara".
 */
export const playNotePreview = async (note: string, durationSeconds: number): Promise<boolean> => {
  const audio = await ensureRhythmAudio();
  if (!audio) return false;
  try {
    audio.synth.triggerAttackRelease(note, durationSeconds);
    return true;
  } catch {
    return false;
  }
};

/** Bunyikan satu klik metronom (accent = ketukan pertama). */
export const playClickPreview = async (accent = false): Promise<boolean> => {
  const audio = await ensureRhythmAudio();
  if (!audio) return false;
  try {
    audio.click.triggerAttackRelease(accent ? 'C6' : 'C5', '32n');
    return true;
  } catch {
    return false;
  }
};
