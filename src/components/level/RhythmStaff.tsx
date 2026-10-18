import type { RefObject } from 'react';
import type { RhythmLevel } from '../../data/rhythm';
import { padFor } from '../../data/rhythm';
import { TRACK_START_X, beatSeconds, xForTime, type RhythmOnset, type Verdict } from '../../lib/rhythm';

interface RhythmStaffProps {
  level: RhythmLevel;
  onsets: RhythmOnset[];
  verdicts: (Verdict | null)[];
  activeIndex: number | null;
  playheadRef: RefObject<SVGLineElement | null>;
}

/**
 * Paranada kuis: 5 garis, ruler ketukan, not pola (posisi x = waktu,
 * y = tinggi nada), dan playhead yang digerakkan langsung lewat transform
 * (tanpa re-render React tiap frame).
 */
export const RhythmStaff = ({ level, onsets, verdicts, activeIndex, playheadRef }: RhythmStaffProps) => {
  const beat = beatSeconds(level);
  const beats = Array.from({ length: level.beats }, (_, index) => index);
  const startX = xForTime(0, level);
  const endX = xForTime(level.beats * beat, level);
  const restSlots = level.steps
    .map((note, slot) => (note ? null : slot))
    .filter((slot): slot is number => slot !== null);

  return (
    <svg
      className="lv-staff"
      viewBox="0 0 400 196"
      id="rhythm-staff"
      role="img"
      aria-label={`Paranada pola level ${level.id} dengan ${onsets.length} not`}
    >
      {/* 5 garis paranada */}
      {[30, 55, 80, 105, 130].map((y) => (
        <line key={y} className="staff-line" x1={28} y1={y} x2={372} y2={y} />
      ))}

      {/* Ruler ketukan — di bawah not luar paranada (D4/C4) agar tak bertabrakan. */}
      {beats.map((index) => {
        const x = xForTime(index * beat, level);
        return (
          <g key={`beat-${index}`} className="lv-beat">
            <line x1={x} y1={172} x2={x} y2={179} />
            <text x={x} y={188} textAnchor="middle">
              {index + 1}
            </text>
          </g>
        );
      })}

      {/* Awal & akhir track: sampai bawah agar not D4/C4 tetap di dalam track */}
      <line className="lv-track-edge" x1={startX} y1={24} x2={startX} y2={168} />
      <line className="lv-track-edge" x1={endX} y1={24} x2={endX} y2={168} />

      {/* Istirahat: penanda kecil di posisi tengah paranada */}
      {restSlots.map((slot) => (
        <text
          key={`rest-${slot}`}
          className="lv-rest"
          x={xForTime((slot * beat) / level.subdivisions, level)}
          y={84}
          textAnchor="middle"
        >
          ·
        </text>
      ))}

      {/* Garis bantu not di bawah paranada (C4), digambar sebelum notnya */}
      {onsets.map((onset) => {
        const pad = padFor(onset.note);
        return pad.ledger ? (
          <line
            key={`ledger-${onset.index}`}
            className="staff-ledger"
            aria-hidden="true"
            pointerEvents="none"
            x1={onset.x - 20}
            y1={pad.y}
            x2={onset.x + 20}
            y2={pad.y}
          />
        ) : null;
      })}

      {/* Not pola */}
      {onsets.map((onset) => {
        const verdict = verdicts[onset.index];
        const pad = padFor(onset.note);
        const isActive = activeIndex === onset.index;
        return (
          <g
            key={onset.index}
            className={`lv-note${verdict ? ` is-${verdict}` : ''}${isActive ? ' is-active' : ''}`}
            data-onset={onset.index}
            data-note={onset.note}
          >
            <ellipse cx={onset.x} cy={pad.y} rx={11.5} ry={8.5} transform={`rotate(-16 ${onset.x} ${pad.y})`} />
            <line className="lv-note__stem" x1={onset.x + 10.4} y1={pad.y} x2={onset.x + 10.4} y2={pad.y - 34} />
          </g>
        );
      })}

      {/* Playhead */}
      <line
        ref={playheadRef}
        className="lv-playhead"
        x1={0}
        y1={18}
        x2={0}
        y2={168}
        style={{ transform: `translate(${TRACK_START_X}px, 0)` }}
      />
    </svg>
  );
};
