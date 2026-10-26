import { useEffect } from 'react';
import { RHYTHM_PADS, type PadNote } from '../../data/rhythm';
import type { PadFlash } from '../../hooks/useRhythmGame';

/**
 * Batas antar tuts putih yang ditimpa tuts hitam (hiasan): C|D, D|E, F|G, A|B, C|D, D|E, F|G.
 * E–F dan B–C tidak punya tuts hitam.
 */
const SHARP_BOUNDARIES = [1, 2, 4, 6, 8, 9, 11];

interface NotePadsProps {
  onPress: (note: PadNote) => void;
  disabled: boolean;
  flash: PadFlash | null;
  /**
   * Pratinjau saat kursor masuk ke kotak nada (dipakai pengenalan Materi 1).
   * Opsional — kuis posisi & game irama tidak memakainya.
   */
  onPreview?: (note: PadNote) => void;
  /** Kursor keluar dari kotak nada → batalkan pratinjau. */
  onPreviewEnd?: () => void;
}

/**
 * Papan tuts 5 nada (C D E F G) di bawah paranada. Bisa ditekan dengan
 * klik/sentuh atau tombol keyboard sesuai hurufnya (C, D, E, F, G).
 *
 * Bila `onPreview` diisi, kursor yang masuk/keluar kotak nada ikut memicu
 * pratinjau. Perangkat layar sentuh dilewati agar tap tetap jadi jalur
 * utamanya (di sana tidak ada hover).
 */
export const NotePads = ({ onPress, disabled, flash, onPreview, onPreviewEnd }: NotePadsProps) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const key = e.key.toLowerCase();
      // Bisa memakai huruf nada (C D E F G) atau angka 1–5.
      const pad = RHYTHM_PADS.find((item, index) => item.key === key || String(index + 1) === key);
      if (!pad) return;
      e.preventDefault();
      if (disabled) return;
      onPress(pad.note);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [disabled, onPress]);

  return (
    <div
      className="lv-pads"
      role="group"
      aria-label="Kotak nada"
      style={{ gridTemplateColumns: `repeat(${RHYTHM_PADS.length}, 1fr)` }}
    >
      {RHYTHM_PADS.map((pad, index) => {
        const isFlashing = flash?.note === pad.note;
        const flashClass = isFlashing ? (flash.ok ? ' is-ok' : ' is-off') : '';
        return (
          <button
            key={pad.note}
            type="button"
            className={`lv-pad${flashClass}`}
            data-note={pad.note}
            disabled={disabled}
            onPointerEnter={(e) => {
              if (disabled || e.pointerType === 'touch') return;
              onPreview?.(pad.note);
            }}
            onPointerLeave={(e) => {
              if (e.pointerType === 'touch') return;
              onPreviewEnd?.();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              if (disabled) return;
              onPress(pad.note);
            }}
            aria-label={`Nada ${pad.note} (${pad.posisi}), tombol keyboard ${pad.label} atau ${index + 1}`}
          >
            <span className="lv-pad__note">{pad.note}</span>
          </button>
        );
      })}

      {/* Tuts hitam: murni hiasan, tak bisa difokus/ditekan */}
      {SHARP_BOUNDARIES.filter((at) => at < RHYTHM_PADS.length).map((at) => (
        <span
          key={at}
          className="lv-pads__sharp"
          style={{ left: `${(at / RHYTHM_PADS.length) * 100}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};
