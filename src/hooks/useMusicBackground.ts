import { useEffect, useState } from 'react';
import { MUSIC_BG_BREAKPOINTS, breakpointForWidth, type MusicBgBreakpointName } from '../data/notes';

/** Breakpoint tata letak not yang sedang aktif (mobile/tablet/desktop). */
export const useMusicBreakpoint = (): MusicBgBreakpointName => {
  const [name, setName] = useState<MusicBgBreakpointName>(() => breakpointForWidth(window.innerWidth));

  useEffect(() => {
    const queries = MUSIC_BG_BREAKPOINTS.map((bp) => window.matchMedia(`(min-width: ${bp.minWidth}px)`));
    const onChange = () => setName(breakpointForWidth(window.innerWidth));
    queries.forEach((query) => query.addEventListener('change', onChange));
    return () => queries.forEach((query) => query.removeEventListener('change', onChange));
  }, []);

  return name;
};
