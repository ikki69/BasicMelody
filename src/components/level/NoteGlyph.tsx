import type { GlyphName } from '../../data/durationQuestions';

interface NoteGlyphProps {
  kind: 'note' | 'rest';
  glyph: GlyphName;
  /** Ukuran sisi terpanjang dalam px (tinggi). */
  size?: number;
  className?: string;
  /** Label pembaca layar; bila kosong, ikon dianggap dekoratif. */
  title?: string;
}

/**
 * Simbol notasi balok sederhana (digambar dengan SVG, tanpa font musik):
 * not 1/1 (berongga, tanpa tangkai), 1/2 (berongga bertangkai),
 * 1/4 (penuh bertangkai), 1/8 (penuh bertangkai berbendera), plus tanda
 * istirahatnya.
 */
export const NoteGlyph = ({ kind, glyph, size = 96, className, title }: NoteGlyphProps) => {
  const filled = glyph === 'quarter' || glyph === 'eighth';
  const hasStem = glyph !== 'whole';

  return (
    <svg
      className={className ? `lv-glyph ${className}` : 'lv-glyph'}
      viewBox="0 0 64 90"
      width={(size * 64) / 90}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {kind === 'note' ? (
        <>
          <ellipse
            className={filled ? 'lv-glyph__head is-filled' : 'lv-glyph__head'}
            cx={26}
            cy={64}
            rx={9.4}
            ry={7}
            transform="rotate(-22 26 64)"
          />
          {hasStem && <line className="lv-glyph__stem" x1={35} y1={63} x2={35} y2={18} />}
          {glyph === 'eighth' && (
            <path className="lv-glyph__flag" d="M35 18c7.5 3.6 11 9.6 8.2 18.5c-.6-6.4-3.4-10.8-8.2-13.4z" />
          )}
        </>
      ) : (
        <>
          {glyph === 'whole' && (
            <>
              <line className="lv-glyph__line" x1={14} y1={40} x2={50} y2={40} />
              <rect className="lv-glyph__block" x={25} y={40} width={13} height={11} rx={1.5} />
            </>
          )}
          {glyph === 'half' && (
            <>
              <line className="lv-glyph__line" x1={14} y1={52} x2={50} y2={52} />
              <rect className="lv-glyph__block" x={25} y={41} width={13} height={11} rx={1.5} />
            </>
          )}
          {glyph === 'quarter' && (
            <path className="lv-glyph__squiggle" d="M33 18l-8 14 9 8-10 14 8 8" />
          )}
          {glyph === 'eighth' && (
            <>
              <path className="lv-glyph__squiggle" d="M38 18c-7-4-13-1-15 5" />
              <line className="lv-glyph__stem" x1={36} y1={21} x2={28} y2={43} />
              <circle className="lv-glyph__head is-filled" cx={29} cy={52} r={3.4} />
            </>
          )}
        </>
      )}
    </svg>
  );
};
