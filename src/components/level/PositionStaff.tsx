import { RHYTHM_PADS, type PadNote } from '../../data/rhythm';
import { ClefGlyph } from './ClefGlyph';

interface PositionStaffProps {
  /** Nada yang tampil (null = paranada kosong, untuk latihan telinga). */
  note: PadNote | null;
  /** Sorot posisi nada tanpa menampilkan bentuk not (mis. saat menjawab). */
  showMarker?: boolean;
  /**
   * Nyalakan not (glow hijau + pop singkat). Dipakai pengenalan Materi 1 saat
   * kursor menyentuh kotak nada; kuis tidak memakainya.
   */
  lit?: boolean;
  className?: string;
}

const LINE_Y = [30, 55, 80, 105, 130];

/** Garis G = garis ke-2 dari bawah, tempat pusaran kunci G mengunci. */
const G_LINE_Y = LINE_Y[LINE_Y.length - 2];

/**
 * Tinggi kunci. Kunci G asli ≈ 6.9 spasi (≈ 172 unit untuk paranada 100 unit),
 * tapi di sini dibatasi agar tetap masuk viewBox setinggi 196 unit; ukuran
 * berapa pun tetap sah karena penempatannya mengacu ke garis G.
 */
const CLEF_SIZE = 140;

/**
 * Paranada sederhana untuk Materi 1: 5 garis + satu not (opsional).
 * Dipakai kuis posisi not, bukan kuis irama (tidak ada playhead).
 */
export const PositionStaff = ({ note, showMarker = false, lit = false, className }: PositionStaffProps) => {
  const pad = note ? RHYTHM_PADS.find((item) => item.note === note) ?? null : null;

  return (
    <svg
      className={className ? `lv-staff lv-staff--single ${className}` : 'lv-staff lv-staff--single'}
      viewBox="0 0 400 196"
      role="img"
      aria-label={pad ? `Paranada dengan satu not di ${pad.posisi}` : 'Paranada kosong'}
    >
      {LINE_Y.map((y) => (
        <line key={y} className="staff-line" x1={28} y1={y} x2={372} y2={y} />
      ))}

      {/* Kunci G sungguhan (path SVG), menggantikan huruf "G" */}
      <ClefGlyph className="lv-staff__clef" size={CLEF_SIZE} gLineY={G_LINE_Y} x={30} />

      {pad?.ledger && (
        <line className="staff-ledger" aria-hidden="true" pointerEvents="none" x1={180} y1={pad.y} x2={220} y2={pad.y} />
      )}

      {pad && (
        <g
          className={lit ? 'lv-staff__note is-lit' : 'lv-staff__note'}
          data-note={pad.note}
          style={lit ? { transformOrigin: `200px ${pad.y}px` } : undefined}
        >
          <ellipse cx={200} cy={pad.y} rx={11.5} ry={8.5} transform={`rotate(-16 200 ${pad.y})`} />
          <line className="lv-note__stem" x1={210.4} y1={pad.y} x2={210.4} y2={pad.y - 34} />
        </g>
      )}

      {showMarker && pad && (
        <circle
          className={lit ? 'lv-staff__marker is-lit' : 'lv-staff__marker'}
          cx={200}
          cy={pad.y}
          r={22}
        />
      )}
    </svg>
  );
};
