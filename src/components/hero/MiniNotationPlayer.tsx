import { useCallback, useEffect, useRef, useState } from 'react';
import { playNotePreview } from '../../lib/audio';
import { ClefGlyph } from '../level/ClefGlyph';

/** Nada yang ditampilkan di paranada mini dan diputar berurutan. */
const MELODY = [
  { note: 'C4', x: 126, y: 110, ledger: true },
  { note: 'E4', x: 184, y: 95, ledger: false },
  { note: 'G4', x: 242, y: 80, ledger: false },
  { note: 'C5', x: 300, y: 27.5, ledger: false },
] as const;

/** Jarak antar nada (ms) — cukup longgar supaya tiap nada terdengar terpisah. */
const STEP_MS = 240;
/** Lama satu nada berbunyi (detik). */
const NOTE_SECONDS = 0.38;

/**
 * Kartu pratinjau notasi di hero: paranada mini berisi empat nada (C mayor)
 * dengan tombol putar. Menekan tombol memutar nada berurutan lewat
 * `playNotePreview` sekaligus menjalankan animasi nada + garis playhead.
 *
 * Semua animasi ada di CSS (kelas `is-playing`), jadi tidak ada state React
 * per frame. Prefers-reduced-motion mematikan animasi lewat media query,
 * tetapi bunyi tetap bisa diputar karena dipicu klik pengguna.
 */
export const MiniNotationPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    setPlaying(false);
  }, [clearTimers]);

  const play = useCallback(() => {
    if (playing) {
      stop();
      return;
    }

    clearTimers();
    setPlaying(true);

    MELODY.forEach((item, index) => {
      timers.current.push(
        window.setTimeout(() => {
          void playNotePreview(item.note, NOTE_SECONDS);
        }, index * STEP_MS)
      );
    });

    timers.current.push(
      window.setTimeout(() => {
        setPlaying(false);
      }, MELODY.length * STEP_MS + 420)
    );
  }, [clearTimers, playing, stop]);

  // Bersihkan timer bila kartu dilepas saat nada masih berjalan.
  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div
      className={`hero-mini${playing ? ' is-playing' : ''}`}
      role="group"
      aria-label="Pratinjau notasi musik"
      data-hero-mini
    >
      <div className="hero-mini__head">
        <div className="hero-mini__copy">
          <p className="hero-mini__eyebrow">
            <span className="hero-mini__dot" aria-hidden="true" />
            Contoh melodi
          </p>
          <p className="hero-mini__title">Empat nada, satu birama</p>
        </div>

        <button
          type="button"
          className="hero-mini__play"
          onClick={play}
          aria-label={playing ? 'Hentikan contoh melodi' : 'Putar contoh melodi C mayor'}
          aria-pressed={playing}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <rect x="7" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" />
              <rect x="13.4" y="5" width="3.6" height="14" rx="1.2" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M8 5.4v13.2c0 .9 1 1.4 1.7.9l9.2-6.6c.6-.4.6-1.4 0-1.8L9.7 4.5C9 4 8 4.5 8 5.4z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      <div className="hero-mini__staff">
        <svg
          className="hero-mini__svg"
          viewBox="0 0 340 130"
          role="img"
          aria-label="Paranada dengan empat not: C4, E4, G4, dan C5"
        >
          <g aria-hidden="true">
            {[35, 50, 65, 80, 95].map((y) => (
              <line key={y} className="hero-mini__staff-line" x1="14" y1={y} x2="326" y2={y} />
            ))}
          </g>

          <ClefGlyph className="hero-mini__clef" size={96} gLineY={80} x={18} />

          {MELODY.map((item, index) => (
            <g
              key={item.note}
              className="hero-mini__note"
              style={{ animationDelay: `${index * STEP_MS}ms` }}
              aria-hidden="true"
            >
              {item.ledger && (
                <line className="hero-mini__ledger" x1={item.x - 13} y1={item.y} x2={item.x + 13} y2={item.y} />
              )}
              <ellipse
                className="hero-mini__notehead"
                cx={item.x}
                cy={item.y}
                rx="7.2"
                ry="5.4"
                transform={`rotate(-18 ${item.x} ${item.y})`}
              />
              <line className="hero-mini__stem" x1={item.x + 6.2} y1={item.y} x2={item.x + 6.2} y2={item.y - 34} />
            </g>
          ))}

          <line className="hero-mini__playhead" x1="14" y1="26" x2="14" y2="104" aria-hidden="true" />
        </svg>
      </div>

      <div className="hero-mini__foot">
        <span className="hero-mini__notes">C4 · E4 · G4 · C5</span>
        <span className="hero-mini__status" aria-hidden="true">
          {playing ? 'Memutar…' : 'Tekan putar'}
        </span>
      </div>

      <span className="sr-only" aria-live="polite">
        {playing ? 'Memutar contoh melodi C mayor.' : 'Contoh melodi siap diputar.'}
      </span>
    </div>
  );
};
