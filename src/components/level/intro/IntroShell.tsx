import { useCallback, useEffect, type ReactNode } from 'react';
import type { ExtendedLevel } from '../../../data/levelsExtended';
import { Mentor } from '../../mentor/Mentor';
import { poseForMaterial } from '../../mentor/mentorPoses';
import { SpeechBubble } from '../../mentor/SpeechBubble';

interface IntroShellProps {
  level: ExtendedLevel;
  /** Konten interaktif pengenalan. */
  children: ReactNode;
  /** Tombol "Lanjut ke Kuis" ditekan → level ditandai tuntas. */
  onComplete: () => void;
  /** Keluar tanpa menandai tuntas. */
  onExit: () => void;
}

/**
 * Rangka halaman pengenalan (level 1 tiap materi): tampil penuh layar seperti
 * kuis, tetapi tanpa penilaian bintang.
 */
export const IntroShell = ({ level, children, onComplete, onExit }: IntroShellProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    },
    [onExit]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="lv-quiz lv-intro" id="level-intro" data-level={level.id} data-kind="intro">
      <header className="lv-quiz__header">
        <button type="button" className="lv-quiz__exit" onClick={onExit} aria-label="Keluar dari pengenalan">
          <span aria-hidden="true">×</span> Keluar
        </button>
        <p className="lv-intro__kicker">Pengenalan · tanpa kuis</p>
        <p className="lv-quiz__meta" />
      </header>

      <div className="lv-quiz__stage">
        <div className="lv-quiz__info">
          <Mentor pose={poseForMaterial(level.materialId)} />
          <div className="lv-quiz__heading">
            <h1 className="lv-quiz__title">{level.judul}</h1>
            <SpeechBubble direction="left" text={level.deskripsi} textClassName="lv-quiz__sub" />
          </div>
        </div>

        {children}

        <div className="lv-intro__foot">
          <button type="button" className="lv-btn lv-btn--ghost" id="introBack" onClick={onExit}>
            Kembali
          </button>
          <button type="button" className="lv-btn lv-btn--primary" id="introDone" onClick={onComplete}>
            Lanjut ke Kuis
          </button>
        </div>
      </div>
    </div>
  );
};
