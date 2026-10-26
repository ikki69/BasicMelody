import type { ExtendedLevel } from '../../data/levelsExtended';
import { DurationIntro } from './intro/DurationIntro';
import { PositionIntro } from './intro/PositionIntro';
import { RhythmIntro } from './intro/RhythmIntro';
import { SymbolIntro } from './intro/SymbolIntro';

interface IntroLevelProps {
  level: ExtendedLevel;
  /** Tombol "Lanjut ke Kuis" ditekan → level ditandai tuntas. */
  onComplete: () => void;
  /** Keluar tanpa menandai tuntas. */
  onExit: () => void;
}

/**
 * Level pengenalan (urutan 1 di tiap materi). Isinya berbeda per materi:
 * posisi not, nilai not, atau ketukan & tempo.
 */
export const IntroLevel = ({ level, onComplete, onExit }: IntroLevelProps) => {
  if (level.materialId === 'm1' || level.materialId === 'm4') {
    return <PositionIntro level={level} onComplete={onComplete} onExit={onExit} />;
  }
  if (level.materialId === 'm2') {
    return <DurationIntro level={level} onComplete={onComplete} onExit={onExit} />;
  }
  if (level.materialId === 'm5') {
    return <SymbolIntro level={level} onComplete={onComplete} onExit={onExit} />;
  }
  return <RhythmIntro level={level} onComplete={onComplete} onExit={onExit} />;
};
