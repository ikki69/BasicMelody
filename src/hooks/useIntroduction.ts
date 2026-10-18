import { useCallback, useEffect, useRef, useState } from 'react';
import type { Synth } from 'tone';
import { DEFAULT_PITCH_INDEX, getLevel, indexFromY, nextStep, prevStep, TOTAL_STEPS } from '../lib/intro';

/**
 * State & perilaku halaman Introduction (padanan intro.js + ui.js):
 * navigasi langkah, posisi not pada paranada (digeser langsung), dan pemutaran nada.
 *
 * Tone.js di-lazy-import saat interaksi pertama pengguna supaya bundle awal
 * tetap ringan dan audio tidak diblokir browser.
 */
export const useIntroduction = () => {
  const [step, setStep] = useState(1);
  const [pitchIndex, setPitchIndex] = useState(DEFAULT_PITCH_INDEX);
  /** Posisi y not saat sedang digeser (kontinu). null = menempel di garis/ruang. */
  const [dragY, setDragY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const synthRef = useRef<Synth | null>(null);
  const audioReadyRef = useRef(false);
  const audioLoadingRef = useRef<Promise<void> | null>(null);
  const dragIndexRef = useRef(DEFAULT_PITCH_INDEX);

  /** Siapkan Tone.js sekali saja, dipanggil dari gesture pengguna. */
  const ensureAudio = useCallback((): Promise<void> => {
    if (audioReadyRef.current) return Promise.resolve();
    if (audioLoadingRef.current) return audioLoadingRef.current;

    const loading = import('tone')
      .then(async (Tone) => {
        await Tone.start();
        const synth = new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.02, decay: 0.18, sustain: 0.25, release: 0.6 },
        }).toDestination();
        synth.volume.value = -8;
        synthRef.current = synth;
        audioReadyRef.current = true;
      })
      .catch(() => {
        // Audio gagal dimuat → halaman tetap berfungsi tanpa suara.
        synthRef.current = null;
      })
      .finally(() => {
        audioLoadingRef.current = null;
      });

    audioLoadingRef.current = loading;
    return loading;
  }, []);

  const playNote = useCallback((note: string) => {
    const synth = synthRef.current;
    if (!synth) return;
    try {
      synth.triggerAttackRelease(note, '8n');
    } catch {
      // Abaikan: audio context bisa saja belum siap.
    }
  }, []);

  /** Handler tombol "Kembali". */
  const goPrevStep = useCallback(() => setStep((prev) => prevStep(prev)), []);

  /** Handler tombol "Lanjut" / "Mulai Berlatih". */
  const goNextStep = useCallback(() => setStep((prev) => nextStep(prev)), []);

  /** Handler slider: pindahkan not dan bunyikan nadanya. */
  const changePitch = useCallback(
    (value: number) => {
      const level = getLevel(value);
      setPitchIndex(level.index);
      void ensureAudio().then(() => playNote(level.note));
    },
    [ensureAudio, playNote]
  );

  /** Bunyikan nada saat not pertama kali disentuh (gesture pertama pengguna). */
  const primeAudio = useCallback(() => {
    void ensureAudio();
  }, [ensureAudio]);

  /* ---------------- Drag not (step 3) ---------------- */

  /** Mulai menggeser not dari posisi kursor (koordinat viewBox). */
  const beginDrag = useCallback(
    (y: number) => {
      dragIndexRef.current = pitchIndex;
      setIsDragging(true);
      setDragY(y);
      primeAudio();
    },
    [pitchIndex, primeAudio]
  );

  /** Not mengikuti kursor; nada & label berubah hanya saat posisi terdekat berganti. */
  const moveDrag = useCallback(
    (y: number) => {
      setDragY(y);
      const idx = indexFromY(y);
      if (idx !== dragIndexRef.current) {
        dragIndexRef.current = idx;
        changePitch(idx);
      }
    },
    [changePitch]
  );

  /** Lepas: not merapat (snap) ke garis/ruang terdekat. */
  const endDrag = useCallback(() => {
    setDragY(null);
    setIsDragging(false);
  }, []);

  /** Posisi not yang ditampilkan: kontinu saat digeser, tepat di garis/ruang setelah dilepas. */
  const noteY = dragY ?? getLevel(pitchIndex).y;

  // Bersihkan synth saat keluar halaman.
  useEffect(
    () => () => {
      synthRef.current?.dispose();
      synthRef.current = null;
      audioReadyRef.current = false;
    },
    []
  );

  return {
    step,
    totalSteps: TOTAL_STEPS,
    pitchIndex,
    level: getLevel(pitchIndex),
    noteY,
    isDragging,
    goPrevStep,
    goNextStep,
    changePitch,
    primeAudio,
    beginDrag,
    moveDrag,
    endDrag,
  };
};
