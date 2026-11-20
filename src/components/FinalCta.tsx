import { useCallback, useState } from 'react';
import { INTRODUCTION_HASH, LEVEL_HASH } from '../lib/intro';
import { isIntroCompleted } from '../hooks/useLevelProgress';
import { isPlainLeftClick, navigateWithFade, prefersReducedMotion } from '../lib/navigate';

/**
 * Penutup landing page (bukan floating): bidang pink dengan satu pernyataan dan
 * dua aksi.
 *
 * Dua tombol:
 * - "Pengenalan" (utama, pil grafit solid) → halaman Introduction.
 * - "Materi Latihan" (sekunder, bidang putih) → halaman Level (baru terbuka
 *   setelah Introduction tuntas).
 *
 * Keduanya elemen <a href> asli, jadi tanpa JS tetap berfungsi.
 */
export const FinalCta = () => {
  const [introDone] = useState(isIntroCompleted);

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
                  className="cta-next cta-next--explore"
                  aria-label="Pengenalan, buka halaman Introduction"
                  onClick={handleNavigate}
                >
                  <span className="cta-next__icon" aria-hidden="true">
                    <svg className="cta-next__explore-icon" viewBox="0 0 512 512">
                      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
                    </svg>
                  </span>
                  <span className="cta-next__label">Pengenalan</span>
                </a>

                {introDone ? (
                  <a
                    href={`#/${LEVEL_HASH}`}
                    className="cta-next cta-next--ghost cta-next--explore"
                    id="ctaLevel"
                    aria-label="Materi latihan, buka daftar materi"
                    onClick={handleNavigate}
                  >
                    <span className="cta-next__icon" aria-hidden="true">
                      <svg className="cta-next__explore-icon" viewBox="0 0 512 512" aria-hidden="true">
                        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
                      </svg>
                    </span>
                    <span className="cta-next__label">Materi Latihan</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    className="cta-next cta-next--ghost cta-next--locked cta-next--explore"
                    id="ctaLevel"
                    disabled
                    title="Selesaikan halaman Introduction dulu untuk membuka Materi Latihan"
                  >
                    <span className="cta-next__icon" aria-hidden="true">
                      <svg className="cta-next__explore-icon" viewBox="0 0 512 512" aria-hidden="true">
                        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31L325.1 306.7c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
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
