import { useScrollProgress } from '../hooks/useScrollProgress';

/**
 * Bilah kemajuan halaman Level — sama seperti halaman Introduction: satu
 * batang isian di kaki layar, tanpa nomor bagian atau timecode.
 */
export const HudLevel = () => {
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
