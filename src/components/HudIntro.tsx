import { useScrollProgress } from '../hooks/useScrollProgress';

/**
 * Bilah tipis di kaki halaman Introduction: kemajuan gulir digambar sebagai
 * satu batang isian penuh (bukan timecode monospace atau nomor bagian), jadi
 * yang tampil hanya informasi yang benar-benar berguna.
 */
export const HudIntro = () => {
  const { progress } = useScrollProgress();

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 h-1.5 bg-fg/10" aria-hidden="true">
      <div
        className="h-full bg-fg will-change-transform"
        style={{ transform: `scaleX(${Math.min(Math.max(progress, 0), 1)})`, transformOrigin: 'left center' }}
      />
    </div>
  );
};
