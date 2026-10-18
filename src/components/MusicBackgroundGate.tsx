import { useCallback, useEffect, useRef, useState } from 'react';
import { NO_MUSIC_BG_ROUTES } from '../config/background';
import { notesForBreakpoint } from '../data/notes';
import { useMusicBreakpoint } from '../hooks/useMusicBackground';
import { readRoute, routePath } from '../lib/hashRoute';
import { MusicBackground } from './MusicBackground';

/** Apakah route saat ini memakai latar not (bukan salah satu yang dikecualikan). */
const shouldShow = (): boolean => !NO_MUSIC_BG_ROUTES.includes(routePath(readRoute()));

/**
 * Gerbang latar not musik.
 *
 * Latar hanya dipasang di luar route yang dikecualikan (lihat
 * config/background.ts — landing beserta seluruh scane-nya). Saat berpindah
 * dari/ke landing, latar memudar 0.6s lalu benar-benar dilepas dari DOM,
 * sehingga di landing tidak ada elemen latar sama sekali.
 */
export const MusicBackgroundGate = () => {
  const breakpoint = useMusicBreakpoint();
  const [show, setShow] = useState(shouldShow);
  const [mounted, setMounted] = useState(show);
  const showRef = useRef(show);

  // Perubahan route ditangani di event handler (bukan di body effect) agar
  // state latar ikut diperbarui tanpa render berantai.
  useEffect(() => {
    const onHashChange = () => {
      const next = shouldShow();
      showRef.current = next;
      setShow(next);
      if (next) setMounted(true);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleHidden = useCallback(() => {
    // Jangan dilepas bila latar sudah diminta tampil lagi saat fade-out berjalan.
    if (!showRef.current) setMounted(false);
  }, []);

  if (!mounted) return null;

  return (
    <MusicBackground
      // Remount saat breakpoint berubah → jumlah & susunan not menyesuaikan.
      key={breakpoint}
      notes={notesForBreakpoint(breakpoint)}
      active={show}
      onHidden={handleHidden}
    />
  );
};
