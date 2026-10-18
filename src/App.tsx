import { useEffect, useState } from 'react';
import { Landing } from './components/Landing';
import { Introduction } from './components/Introduction';
import { Level } from './components/Level';
import { MusicBackgroundGate } from './components/MusicBackgroundGate';
import { readRoute, type Route } from './lib/hashRoute';

function App() {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Selalu mulai dari atas saat pindah halaman + bersihkan efek fade-out CTA.
  useEffect(() => {
    document.documentElement.classList.remove('page-leaving');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  let page = <Landing />;
  if (route.name === 'introduction') page = <Introduction />;
  // key per materi: pindah route meng-reset state halaman level (level yang
  // terbuka ikut tertutup), tanpa efek samping tambahan.
  else if (route.name === 'level') page = <Level key={route.materiId ?? 'root'} materiId={route.materiId} />;

  return (
    <>
      {/* Latar not musik: tidak dirender di landing (lihat config/background.ts). */}
      <MusicBackgroundGate />
      {page}
    </>
  );
}

export default App;
