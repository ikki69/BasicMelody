import { forwardRef, useMemo } from 'react';

type SplitMode = 'chars' | 'words';

interface SplitTextProps {
  text: string;
  className?: string;
  /** kelas untuk tiap potongan (span) */
  pieceClassName?: string;
  mode?: SplitMode;
  /** aria-label untuk aksesibilitas; default memakai `text` */
  ariaLabel?: string;
}

/**
 * Memecah teks menjadi span per huruf/kata dengan overflow-hidden per potongan,
 * sehingga bisa dianimasikan yPercent 100 -> 0.
 * Rendering dilakukan di React (bukan imperatif) agar tetap deklaratif.
 */
export const SplitText = forwardRef<HTMLSpanElement, SplitTextProps>(
  ({ text, className = '', pieceClassName = '', mode = 'chars', ariaLabel }, outerRef) => {
    const pieces = useMemo(() => {
      if (mode === 'words') {
        return text.split(' ').map((w) => ({ key: w, value: w }));
      }
      return Array.from(text).map((ch, i) => ({ key: `${ch}-${i}`, value: ch === ' ' ? '\u00A0' : ch }));
    }, [text, mode]);

    return (
      <span ref={outerRef} className={`inline-block ${className}`} aria-label={ariaLabel ?? text}>
        {pieces.map((p, i) => (
          // Masker potongan diberi ruang naik/turun huruf (lalu ditarik kembali
          // dengan margin negatif) supaya ekor seperti "y" tidak terpotong
          // saat leading display 0.9 dipakai.
          <span
            key={p.key}
            className="inline-block overflow-hidden align-bottom pt-[0.16em] pb-[0.16em] -mt-[0.16em] -mb-[0.16em]"
            aria-hidden="true"
          >
            <span className={`split-piece inline-block will-change-transform ${pieceClassName}`} data-piece-index={i}>
              {p.value}
            </span>
          </span>
        ))}
      </span>
    );
  }
);

SplitText.displayName = 'SplitText';

/** Ambil elemen potongan dari dalam sebuah SplitText ref. */
export const getPieces = (el: HTMLElement | null): HTMLElement[] => {
  if (!el) return [];
  return Array.from(el.querySelectorAll<HTMLElement>('.split-piece'));
};