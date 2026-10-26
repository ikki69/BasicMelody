import { useCallback, useRef } from 'react';

/** Not musik yang dilempar keluar dari tombol (dipilih acak per partikel). */
const NOTES = ['♪', '♫', '♩', '♬'] as const;

/** Jumlah not per burst & jeda antar not (ms) supaya kelihatan menyebar. */
const BURST_COUNT = 7;
const STAGGER_MS = 60;

/** Jeda minimum antar burst — hover yang goyang tidak membanjiri DOM. */
const COOLDOWN_MS = 600;

interface NoteBurstHandlers<T extends HTMLElement> {
  onPointerEnter: (e: React.PointerEvent<T>) => void;
}

/**
 * Efek partikel not musik saat kursor masuk ke tombol CTA ("Mulai Belajar").
 *
 * Cara kerja: pada pointerenter (hanya mouse asli — sentuhan diabaikan) span
 * kecil berisi simbol not dibuat di dalam tombol, diberi posisi/geseran/putaran
 * acak lewat custom properties, lalu dibuang sendiri saat animasi CSS-nya
 * selesai (listener animationend once). Semua gerakan ada di keyframes
 * `noteBurst` (index.css), jadi thread scroll tidak tersentuh.
 *
 * Guard: `prefers-reduced-motion: reduce` → tidak ada partikel sama sekali;
 * cooldown mencegah ledakan dobel saat kursor bergetar di tepi tombol.
 * Tombolnya tetap elemen <a> biasa — hook ini hanya menambahkan listener.
 */
export const useNoteBurst = <T extends HTMLElement>(): NoteBurstHandlers<T> => {
  const lastBurst = useRef(0);

  const onPointerEnter = useCallback((e: React.PointerEvent<T>) => {
    // Hanya mouse sungguhan; stylus/touch tidak perlu hover effect.
    if (e.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const now = performance.now();
    if (now - lastBurst.current < COOLDOWN_MS) return;
    lastBurst.current = now;

    const host = e.currentTarget;
    for (let i = 0; i < BURST_COUNT; i++) {
      const note = document.createElement('span');
      note.className = 'note-burst__n';
      note.setAttribute('aria-hidden', 'true');
      note.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];
      note.style.left = `${12 + Math.random() * 76}%`;
      note.style.setProperty('--dx', `${(Math.random() * 2 - 1) * 28}px`);
      note.style.setProperty('--rot', `${(Math.random() * 2 - 1) * 32}deg`);
      note.style.animationDelay = `${i * STAGGER_MS}ms`;
      note.addEventListener('animationend', () => note.remove(), { once: true });
      host.appendChild(note);
    }
  }, []);

  return { onPointerEnter };
};
