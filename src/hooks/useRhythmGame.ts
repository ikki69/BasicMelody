import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Synth } from 'tone';
import type { PadNote, RhythmLevel } from '../data/rhythm';
import { padFor } from '../data/rhythm';
import { ensureRhythmAudio, isAudioUnavailable, stopRhythmAudio, type RhythmAudio } from '../lib/audio';
import { AUDIO_GRACE_MS, isAudioClockStalled, type ClockProbe } from '../lib/clock';
import {
  GOOD_MS,
  STRAY_MS,
  TIMING_OFFSET_MS,
  beatSeconds,
  buildOnsets,
  countVerdicts,
  crownFor,
  nearestPending,
  patternDuration,
  starsFor,
  verdictFor,
  xForTime,
  type Verdict,
  type VerdictCounts,
} from '../lib/rhythm';

export type GamePhase = 'idle' | 'countin' | 'playing' | 'result';

/** Pesan pada feedback tray di bawah paranada. */
export interface TrayMessage {
  id: number;
  kind: Verdict | 'info';
  title: string;
  detail?: string;
}

/** Flash pada kotak nada yang baru ditekan. */
export interface PadFlash {
  id: number;
  note: PadNote;
  ok: boolean;
}

export interface RhythmOutcome {
  stars: 1 | 2 | 3;
  crown: boolean;
  /** Skor berbobot 0–100 (perfect 100%, good 70%). */
  score: number;
  counts: VerdictCounts;
}

interface Options {
  /** Dipanggil sekali setiap kali sebuah percobaan selesai. */
  onFinish?: (outcome: RhythmOutcome) => void;
}

/**
 * Bunyikan nada dengan aman.
 *
 * Bila main thread sempat tersendat, Tone menggeser waktu nada yang sudah
 * terlewat ke "sekarang". Dua nada pada synth yang sama yang jatuh pada saat
 * yang sama persis akan ditolak Tone (start time harus naik). Kesalahan itu
 * tidak boleh menghentikan permainan — ketukan visual tetap berjalan, hanya
 * nada basi yang dilewati.
 */
const safeTrigger = (synth: Synth, note: string, length: string, time: number): void => {
  try {
    synth.triggerAttackRelease(note, length, time);
  } catch {
    /* nada terlewat karena jadwal basi */
  }
};

/**
 * Mesin kuis ritme.
 *
 * Waktu mengacu pada Tone Transport saat audio aktif, atau jam
 * performance.now() bila audio tidak tersedia — jadi permainan selalu bisa
 * dimainkan, dengan atau tanpa suara.
 */
export const useRhythmGame = (level: RhythmLevel, options: Options = {}) => {
  const onsets = useMemo(() => buildOnsets(level), [level]);
  const duration = useMemo(() => patternDuration(level), [level]);
  const countInSeconds = useMemo(() => level.countIn * beatSeconds(level), [level]);

  const [phase, setPhase] = useState<GamePhase>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [verdicts, setVerdicts] = useState<(Verdict | null)[]>(() => onsets.map(() => null));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [tray, setTray] = useState<TrayMessage | null>(null);
  const [padFlash, setPadFlash] = useState<PadFlash | null>(null);
  const [outcome, setOutcome] = useState<RhythmOutcome | null>(null);
  const [metronome, setMetronome] = useState(true);
  const [silent, setSilent] = useState(false);

  const playheadRef = useRef<SVGLineElement | null>(null);
  const verdictsRef = useRef<(Verdict | null)[]>(onsets.map(() => null));
  const phaseRef = useRef<GamePhase>('idle');
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<RhythmAudio | null>(null);
  const metronomeRef = useRef(true);
  const startPerfRef = useRef(0);
  const comboRef = useRef(0);
  const activeRef = useRef<number | null>(null);
  const trayIdRef = useRef(0);
  const padIdRef = useRef(0);
  const watchdogRef = useRef<number | null>(null);
  const audioClockRef = useRef<ClockProbe | null>(null);

  const onFinishRef = useRef(options.onFinish);
  useEffect(() => {
    onFinishRef.current = options.onFinish;
  });

  const setPhaseSafe = useCallback((next: GamePhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  /** Waktu relatif terhadap awal pola (negatif saat hitung-masuk). */
  const readPatternTime = useCallback((): number => {
    const audio = audioRef.current;
    if (audio) return audio.transport.seconds - countInSeconds;
    return (performance.now() - startPerfRef.current) / 1000 - countInSeconds;
  }, [countInSeconds]);

  const applyVerdict = useCallback((index: number, verdict: Verdict): void => {
    if (verdictsRef.current[index] !== null) return;
    const next = [...verdictsRef.current];
    next[index] = verdict;
    verdictsRef.current = next;
    setVerdicts(next);
  }, []);

  const pushTray = useCallback((kind: TrayMessage['kind'], title: string, detail?: string) => {
    trayIdRef.current += 1;
    setTray({ id: trayIdRef.current, kind, title, detail });
  }, []);

  const flashPad = useCallback((note: PadNote, ok: boolean) => {
    padIdRef.current += 1;
    setPadFlash({ id: padIdRef.current, note, ok });
  }, []);

  /** Akhiri percobaan: sisa ketukan yang belum dinilai dihitung meleset. */
  const finish = useCallback(() => {
    if (phaseRef.current === 'result') return;
    clearWatchdog();
    const finalVerdicts = verdictsRef.current.map((v) => v ?? 'miss');
    verdictsRef.current = finalVerdicts;
    setVerdicts(finalVerdicts);

    const counts = countVerdicts(finalVerdicts);
    const stars = starsFor(finalVerdicts, counts);
    const result: RhythmOutcome = {
      stars,
      crown: crownFor(stars, counts),
      score: Math.round((counts.perfect + counts.good * 0.7) / Math.max(1, counts.total) * 100),
      counts,
    };

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    stopRhythmAudio();
    setCountdown(null);
    setActiveIndex(null);
    activeRef.current = null;
    audioClockRef.current = null;
    setOutcome(result);
    setPhaseSafe('result');
    onFinishRef.current?.(result);
  }, [clearWatchdog, setPhaseSafe]);

  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  /** Loop utama: memindahkan playhead, menandai ketukan yang terlewat. */
  const tick = useCallback(function tickLoop() {
    // Jam audio macet? Pindah ke jam visual tanpa mengubah posisi ketukan.
    const audio = audioRef.current;
    const probe = audioClockRef.current;
    if (audio && probe && isAudioClockStalled(probe, audio.transport.seconds, performance.now())) {
      // Simpan posisi pola (bisa negatif = masih hitung-masuk) lalu pindah jam.
      const stalled = audio.transport.seconds - countInSeconds;
      audioRef.current = null;
      audioClockRef.current = null;
      startPerfRef.current = performance.now() - (countInSeconds + stalled) * 1000;
      setSilent(true);
    }

    const t = readPatternTime();

    if (t < 0) {
      const next = Math.max(1, Math.ceil(-t / beatSeconds(level)));
      setCountdown((prev) => (prev === next ? prev : next));
    } else {
      setCountdown((prev) => (prev === null ? prev : null));
    }

    const clamped = Math.min(Math.max(t, 0), duration);
    const x = xForTime(clamped, level);
    if (playheadRef.current) {
      playheadRef.current.style.transform = `translate(${x}px, 0)`;
    }

    // Sorot onset yang sedang di depan playhead.
    let nearest: number | null = null;
    let nearestAbs = Number.POSITIVE_INFINITY;
    onsets.forEach((onset) => {
      const abs = Math.abs(t - onset.time);
      if (abs < nearestAbs) {
        nearestAbs = abs;
        nearest = onset.index;
      }
    });
    const active = nearestAbs <= GOOD_MS / 1000 ? nearest : null;
    if (activeRef.current !== active) {
      activeRef.current = active;
      setActiveIndex(active);
    }

    // Ketukan yang playhead-nya sudah lewat → meleset.
    onsets.forEach((onset) => {
      if (verdictsRef.current[onset.index] === null && t > onset.time + GOOD_MS / 1000) {
        applyVerdict(onset.index, 'miss');
        comboRef.current = 0;
        setCombo(0);
        pushTray('miss', 'Terlewat', `${padFor(onset.note).label} tidak ditekan tepat waktu`);
      }
    });

    if (t > duration + 0.5) {
      finishRef.current();
      return;
    }

    rafRef.current = requestAnimationFrame(tickLoop);
  }, [
    applyVerdict,
    countInSeconds,
    duration,
    level,
    onsets,
    pushTray,
    readPatternTime,
    setCountdown,
  ]);

  /** Mulai (atau ulangi) satu percobaan. */
  const start = useCallback(async () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    clearWatchdog();
    stopRhythmAudio();

    verdictsRef.current = onsets.map(() => null);
    setVerdicts(onsets.map(() => null));
    comboRef.current = 0;
    setCombo(0);
    setBestCombo(0);
    setTray(null);
    setPadFlash(null);
    setOutcome(null);
    setActiveIndex(null);
    activeRef.current = null;
    setCountdown(level.countIn);
    setPhaseSafe('countin');
    startPerfRef.current = performance.now();
    audioClockRef.current = null;

    if (playheadRef.current) {
      playheadRef.current.style.transform = `translate(${xForTime(0, level)}px, 0)`;
    }

    // Jaring pengaman: bila audio tak kunjung siap (memuat Tone atau ditahan
    // kebijakan autoplay), mulai ketukan dengan jam visual supaya permainan
    // tidak pernah berhenti di hitung-masuk.
    watchdogRef.current = window.setTimeout(() => {
      watchdogRef.current = null;
      if (phaseRef.current !== 'countin' || rafRef.current !== null) return;
      audioRef.current = null;
      setSilent(true);
      rafRef.current = requestAnimationFrame(tick);
    }, AUDIO_GRACE_MS);

    const audio = await ensureRhythmAudio();
    if (phaseRef.current !== 'countin') {
      clearWatchdog();
      return; // pengguna sudah keluar/ulangi lagi
    }
    if (rafRef.current !== null) {
      return; // jam visual sudah berjalan lewat jaring pengaman
    }
    clearWatchdog();

    setSilent(audio === null || isAudioUnavailable());
    audioRef.current = audio;

    if (audio) {
      const { transport, synth, click } = audio;
      const beat = beatSeconds(level);
      transport.stop();
      transport.cancel(0);
      transport.position = 0;
      transport.bpm.value = level.bpm;

      // Hitung-masuk: satu klik tiap ketukan.
      for (let b = 0; b < level.countIn; b += 1) {
        transport.schedule((time: number) => {
          if (metronomeRef.current) safeTrigger(click, 'C6', '32n', time);
        }, b * beat);
      }

      // Not pola.
      const noteLength = level.subdivisions === 1 ? '8n' : '16n';
      onsets.forEach((onset) => {
        transport.schedule((time: number) => {
          safeTrigger(synth, onset.note, noteLength, time);
        }, countInSeconds + onset.time);
      });

      // Metronom pelan selama pola (membantu menjaga tempo).
      for (let b = 0; b < level.beats; b += 1) {
        transport.schedule((time: number) => {
          if (metronomeRef.current) safeTrigger(click, 'C5', '32n', time);
        }, countInSeconds + b * beat);
      }

      transport.start('+0.12');
      // Mulai memantau apakah jam audio benar-benar berjalan.
      audioClockRef.current = { perf: performance.now(), seconds: transport.seconds };
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [clearWatchdog, countInSeconds, level, onsets, setPhaseSafe, tick]);

  /** Pemain menekan sebuah kotak nada. */
  const tap = useCallback(
    (note: PadNote) => {
      if (phaseRef.current === 'idle' || phaseRef.current === 'result') return;

      const t = readPatternTime() + TIMING_OFFSET_MS / 1000;
      if (t < -0.3) {
        flashPad(note, false);
        pushTray('info', 'Belum waktunya', 'Tunggu hitungan masuk selesai');
        return;
      }

      const found = nearestPending(onsets, verdictsRef.current, t);
      if (!found || Math.abs(found.deviationMs) > STRAY_MS) {
        flashPad(note, false);
        pushTray('info', 'Di luar ketukan', 'Tidak ada not di sekitar situ');
        return;
      }

      const { onset, deviationMs } = found;
      const pad = padFor(note);

      if (onset.note !== note) {
        applyVerdict(onset.index, 'miss');
        comboRef.current = 0;
        setCombo(0);
        flashPad(note, false);
        pushTray('miss', 'Nada belum tepat', `Kotak yang benar: ${padFor(onset.note).label} (${padFor(onset.note).posisi})`);
        return;
      }

      const verdict = verdictFor(deviationMs);
      applyVerdict(onset.index, verdict);

      if (verdict === 'miss') {
        comboRef.current = 0;
        setCombo(0);
        flashPad(note, false);
        pushTray('miss', deviationMs > 0 ? 'Agak lambat' : 'Agak cepat', `Nada ${pad.label} meleset dari ketukan`);
        return;
      }

      comboRef.current += 1;
      setCombo(comboRef.current);
      setBestCombo((prev) => Math.max(prev, comboRef.current));
      flashPad(note, verdict === 'perfect');
      pushTray(
        verdict,
        verdict === 'perfect' ? 'Perfect!' : 'Bagus!',
        verdict === 'perfect' ? undefined : 'Sedikit di luar titik tepat, masih masuk'
      );
    },
    [applyVerdict, flashPad, onsets, pushTray, readPatternTime]
  );

  /** Keluar dari percobaan (dipakai saat menutup kuis). */
  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    clearWatchdog();
    stopRhythmAudio();
    audioRef.current = null;
    audioClockRef.current = null;
    setCountdown(null);
    setActiveIndex(null);
    activeRef.current = null;
    setPhaseSafe('idle');
  }, [clearWatchdog, setPhaseSafe]);

  const toggleMetronome = useCallback(() => {
    setMetronome((prev) => {
      metronomeRef.current = !prev;
      return !prev;
    });
  }, []);

  // Bersihkan saat komponen dilepas.
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (watchdogRef.current !== null) window.clearTimeout(watchdogRef.current);
      stopRhythmAudio();
      audioRef.current = null;
    },
    []
  );

  return {
    phase,
    countdown,
    onsets,
    verdicts,
    activeIndex,
    combo,
    bestCombo,
    tray,
    padFlash,
    outcome,
    metronome,
    silent,
    playheadRef,
    start,
    retry: start,
    tap,
    stop,
    toggleMetronome,
  };
};
