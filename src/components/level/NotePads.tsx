import { useEffect, useMemo } from 'react';
import { padsFor, type PadNote, type RhythmPad } from '../../data/rhythm';
import type { PadFlash } from '../../hooks/useRhythmGame';

/** Pasangan nada yang dipisahkan tuts hitam: C–D, D–E, F–G, G–A, A–B. */
const SHARP_PAIRS = new Set(['CD', 'DE', 'FG', 'GA', 'AB']);

/**
 * Batas antar tuts yang ditimpa tuts hitam (hiasan), dihitung dari nada yang
 * benar-benar tampil. E–F dan B–C tidak punya tuts hitam.
 */
const sharpBoundariesOf = (pads: RhythmPad[]): number[] =>
  pads.slice(0, -1).flatMap((pad, index) => {
    const left = pad.note.slice(0, -1);
    const right = pads[index + 1].note.slice(0, -1);
    return SHARP_PAIRS.has(`${left}${right}`) ? [index + 1] : [];
  });

interface NotePadsProps {
  onPress: (note: PadNote) => void;
  disabled: boolean;
  flash: PadFlash | null;
  /**
   * Nada yang ditampilkan (urut bebas; selalu diurutkan sesuai paranada).
   * Tanpa isian → semua nada C4–G5.
   */
  notes?: readonly PadNote[];
  /**
   * Pratinjau saat kursor masuk ke kotak nada (dipakai pengenalan Materi 1).
   * Opsional — kuis posisi & game irama tidak memakainya.
   */
  onPreview?: (note: PadNote) => void;
  /** Kursor keluar dari kotak nada → batalkan pratinjau. */
  onPreviewEnd?: () => void;
}

/**
 * Papan tuts nada di bawah paranada. Default menampilkan semua nada C4–G5;
 * level yang punya `notes` (mis. Materi 1) hanya menampilkan nadanya saja.
 * Bisa ditekan dengan klik/sentuh atau tombol keyboard sesuai huruf nadanya.
 *
 * Bila `onPreview` diisi, kursor yang masuk/keluar kotak nada ikut memicu
 * pratinjau. Perangkat layar sentuh dilewati agar tap tetap jadi jalur
 * utamanya (di sana tidak ada hover).
 */
export const NotePads = ({ onPress, disabled, flash, notes, onPreview, onPreviewEnd }: NotePadsProps) => {
  const pads = useMemo(() => padsFor(notes), [notes]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const key = e.key.toLowerCase();
      // Huruf/nada milik tuts diutamakan; nomor urut kotak jadi cadangan
      // (berguna untuk papan 5 nada yang hanya punya tombol C D E F G).
      const pad = pads.find((item) => item.key === key) ?? pads.find((_, index) => String(index + 1) === key);
      if (!pad) return;
      e.preventDefault();
      if (disabled) return;
      onPress(pad.note);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [disabled, onPress, pads]);

  return (
    <div
      className="lv-pads"
      role="group"
      aria-label="Kotak nada"
      data-count={pads.length}
      style={{ gridTemplateColumns: `repeat(${Math.max(pads.length, 1)}, 1fr)` }}
    >
      {pads.map((pad) => {
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
            aria-label={`Nada ${pad.note} (${pad.posisi}), tombol keyboard ${pad.key.toUpperCase()}`}
          >
            <span className="lv-pad__note">{pad.note}</span>
          </button>
        );
      })}

      {/* Tuts hitam: murni hiasan, tak bisa difokus/ditekan */}
      {sharpBoundariesOf(pads).map((at) => (
        <span
          key={at}
          className="lv-pads__sharp"
          style={{ left: `${(at / Math.max(pads.length, 1)) * 100}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};
