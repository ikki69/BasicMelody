import { INTRODUCTION_HASH } from '../../lib/intro';
import { navigateWithFade } from '../../lib/navigate';
import { LockIcon } from './LockIcon';

/** Layar terkunci bila halaman Introduction belum dituntaskan. */
export const LockedNotice = () => (
  <section className="lv-locked" aria-label="Halaman terkunci">
    <LockIcon />
    <h2 className="lv-locked__title">Level masih terkunci</h2>
    <p className="lv-locked__text">
      Selesaikan dulu halaman <strong>Introduction</strong> sampai langkah terakhir. Setelah menekan
      tombol <em>Mulai Berlatih</em>, halaman level akan terbuka.
    </p>
    <button
      type="button"
      className="lv-btn lv-btn--primary"
      id="goIntroduction"
      onClick={() => navigateWithFade(`#/${INTRODUCTION_HASH}`)}
    >
      Kerjakan Introduction
    </button>
  </section>
);
