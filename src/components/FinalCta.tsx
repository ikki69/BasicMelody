import { useCallback, useState } from 'react';
import { INTRODUCTION_HASH, LEVEL_HASH } from '../lib/intro';
import { isIntroCompleted } from '../hooks/useLevelProgress';
import { useNoteBurst } from '../hooks/useNoteBurst';
import { isPlainLeftClick, navigateWithFade, prefersReducedMotion } from '../lib/navigate';

/**
 * Penutup landing page (bukan floating): bidang pink dengan satu pernyataan dan
 * dua aksi.
 *
 * Dua tombol:
 * - "Mulai Belajar" (utama, pil grafit solid) → halaman Introduction.
 * - "Materi Latihan" (sekunder, bidang putih) → halaman Level (baru terbuka
 *   setelah Introduction tuntas).
 *
 * Keduanya elemen <a href> asli, jadi tanpa JS tetap berfungsi.
 */
export const FinalCta = () => {
  const [introDone] = useState(isIntroCompleted);
  // Partikel not musik saat kursor hover tombol "Mulai Belajar".
  const { onPointerEnter } = useNoteBurst<HTMLAnchorElement>();

  const handleNavigate = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Biarkan klik dengan modifier (buka tab/jendela baru) jalan normal.
    if (!isPlainLeftClick(e)) return;
    if (prefersReducedMotion()) return; // navigasi langsung tanpa animasi

    e.preventDefault();
    navigateWithFade(e.currentTarget.getAttribute('href') ?? '#/');
  }, []);

  return (
    <section
      id="section-4"
      className="relative flex min-h-[100dvh] w-full flex-col justify-center bg-field-pink"
      aria-label="Lanjut belajar"
    >
      {/* pb besar di mobile: memberi zona bebas di bawah konten untuk maskot
          yang berdiri di sana (lihat POSES_MOBILE.finale + avoid axis-y). */}
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-44 pt-14 sm:px-10 lg:px-14 lg:pb-20 lg:pt-20">
        {/*
          Susunan penutup: teks di kiri (col-span-4), panel tombol di tengah
          (col-start-5) dengan ekor balon mengarah kanan ke maskot yang
          berdiri di tepi kanan layar (MascotStage, pose `finale`), dan kolom
          kanan sengaja dikosongkan — tidak ada yang tertimpa maskot.
        */}
        {/* `data-cta-grid`: kotak konten penutup (h2, paragraf, panel) yang
            dipakai `avoid` maskot mobile sebagai batas zona bawah. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14" data-cta-grid>
          <div className="lg:col-span-4">
            <h2 className="type-display-medium text-display-sm text-balance text-fg" data-smear>
              Siap mulai dari nada pertama?
            </h2>
            <p className="type-body mt-5 max-w-[40ch] text-pretty text-fg">
              Tidak perlu alat musik dan tidak perlu latar belakang musik. Buka halaman pengenalan untuk mengenali
              garis paranada dan letak nadanya, lalu lanjut ke materi latihan saat kamu sudah siap.
            </p>
          </div>

          <div className="flex flex-col items-start gap-6 lg:col-span-4 lg:col-start-5">
            <div className="cta-panel">
              <div className="cta-panel__actions">
                <a
                  href={`#/${INTRODUCTION_HASH}`}
                  className="cta-next cta-next--primary"
                  aria-label="Mulai belajar, buka halaman Introduction"
                  onClick={handleNavigate}
                  onPointerEnter={onPointerEnter}
                >
                  <span className="cta-next__label">Mulai Belajar</span>
                  <span className="cta-next__arrow" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </a>

                {introDone ? (
                  <a
                    href={`#/${LEVEL_HASH}`}
                    className="cta-next cta-next--ghost"
                    id="ctaLevel"
                    aria-label="Materi latihan, buka daftar materi"
                    onClick={handleNavigate}
                  >
                    <span className="cta-next__icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <circle cx="8" cy="17.5" r="3" />
                        <path d="M11 17.5V5" />
                        <path d="M11 5c3 0 5 1.6 5 4" />
                      </svg>
                    </span>
                    <span className="cta-next__label">Materi Latihan</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    className="cta-next cta-next--ghost cta-next--locked"
                    id="ctaLevel"
                    disabled
                    title="Selesaikan halaman Introduction dulu untuk membuka Materi Latihan"
                  >
                    <span className="cta-next__icon" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
                        <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
                      </svg>
                    </span>
                    <span className="cta-next__label">Materi Latihan</span>
                  </button>
                )}
              </div>

              {!introDone && (
                <p className="type-label-base text-muted" id="ctaLevelHint">
                  Materi Latihan terbuka setelah Introduction selesai.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
