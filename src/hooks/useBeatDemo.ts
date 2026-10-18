import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { ensureRhythmAudio, stopRhythmAudio, type RhythmAudio } from '../lib/audio';
import { AUDIO_GRACE_MS, isAudioClockStalled, type ClockProbe } from '../lib/clock';

export interface BeatDemoOptions {
  /** Ketukan per menit. */
  bpm?: number;
  /** Jumlah ketukan dalam satu bar. */
  beats?: number;
}

export interface BeatDemo {
  playing: boolean;
  /** Ketukan yang sedang berjalan (1 … beats) atau null saat diam. */
  beat: number | null;
  /** true bila audio tidak tersedia — demo tetap jalan lewat jam visual. */
  silent: boolean;
  /** Elemen playhead yang digerakkan langsung (tanpa re-render tiap frame). */
  playheadRef: RefObject<HTMLSpanElement | null>;
  start: () => void;
  stop: () => void;
}

/**
 * Demo ketukan untuk pengenalan irama: memutar klik metronom satu bar dan
 * menggerakkan playhead. Waktu mengacu pada Tone Transport bila audio aktif,
 * atau jam performance.now() bila audio tidak tersedia.
 */
export const useBeatDemo = ({ bpm = 60, beats = 4 }: BeatDemoOptions = {}): BeatDemo => {
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState<number | null>(null);
  const [silent, setSilent] = useState(false);

  const playheadRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<RhythmAudio | null>(null);
  const playingRef = useRef(false);
  const startPerfRef = useRef(0);
  const beatRef = useRef<number | null>(null);
  const audioClockRef = useRef<ClockProbe | null>(null);
  const watchdogRef = useRef<number | null>(null);

  const beatSeconds = 60 / bpm;
  const duration = beats * beatSeconds;

  const clearLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    playingRef.current = false;
    clearLoop();
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
    stopRhythmAudio();
    audioRef.current = null;
    audioClockRef.current = null;
    beatRef.current = null;
    setBeat(null);
    setPlaying(false);
    if (playheadRef.current) playheadRef.current.style.transform = 'translateX(0)';
  }, [clearLoop]);

  const start = useCallback(() => {
    stop();
    playingRef.current = true;
    setPlaying(true);
    setBeat(1);
    beatRef.current = 1;
    startPerfRef.current = performance.now();

    const loop = () => {
      if (!playingRef.current) return;

      // Jam audio macet? Pindah ke jam visual pada posisi yang sama.
      const audio = audioRef.current;
      const probe = audioClockRef.current;
      if (
        audio &&
        probe &&
        isAudioClockStalled(probe, audio.transport.seconds, performance.now())
      ) {
        const elapsed = Math.max(0, audio.transport.seconds);
        audioRef.current = null;
        audioClockRef.current = null;
        startPerfRef.current = performance.now() - elapsed * 1000;
        setSilent(true);
      }

      const clock = audioRef.current;
      const time = clock
        ? clock.transport.seconds
        : (performance.now() - startPerfRef.current) / 1000;

      if (time >= duration) {
        stop();
        return;
      }

      const ratio = Math.max(0, Math.min(time / duration, 1));
      if (playheadRef.current) {
        playheadRef.current.style.transform = `translateX(calc(${ratio} * (100% - 3px)))`;
      }

      const next = Math.min(beats, Math.floor(time / beatSeconds) + 1);
      if (next !== beatRef.current) {
        beatRef.current = next;
        setBeat(next);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    // Jaring pengaman: bila audio tak kunjung siap, jalankan ketukan dengan
    // jam visual supaya demo tidak membeku di ketukan pertama.
    watchdogRef.current = window.setTimeout(() => {
      watchdogRef.current = null;
      if (!playingRef.current || rafRef.current !== null) return;
      audioRef.current = null;
      setSilent(true);
      rafRef.current = requestAnimationFrame(loop);
    }, AUDIO_GRACE_MS);

    void ensureRhythmAudio().then((audio) => {
      if (!playingRef.current) return;
      if (watchdogRef.current !== null) {
        window.clearTimeout(watchdogRef.current);
        watchdogRef.current = null;
      }
      if (rafRef.current !== null) return; // jam visual sudah berjalan

      setSilent(audio === null);
      audioRef.current = audio;
      if (audio) {
        const { transport, click } = audio;
        transport.stop();
        transport.cancel(0);
        transport.position = 0;
        transport.bpm.value = bpm;
        for (let index = 0; index < beats; index += 1) {
          transport.schedule((time: number) => {
            try {
              click.triggerAttackRelease(index === 0 ? 'C6' : 'C5', '32n', time);
            } catch {
              /* klik terlewat karena jadwal basi */
            }
          }, index * beatSeconds);
        }
        transport.start('+0.1');
        audioClockRef.current = { perf: performance.now(), seconds: transport.seconds };
      }
      rafRef.current = requestAnimationFrame(loop);
    });
  }, [beatSeconds, beats, bpm, duration, stop]);

  // Bersihkan saat komponen dilepas.
  useEffect(
    () => () => {
      playingRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (watchdogRef.current !== null) window.clearTimeout(watchdogRef.current);
      stopRhythmAudio();
    },
    []
  );

  return { playing, beat, silent, playheadRef, start, stop };
};
