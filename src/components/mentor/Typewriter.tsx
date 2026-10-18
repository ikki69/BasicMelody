import { useEffect, useRef, useState } from 'react';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

interface TypewriterProps {
  /** Teks lengkap yang "diucapkan" maskot. */
  text: string;
  /** Mulai mengetik (mis. hanya saat langkah pemiliknya sedang tampil). */
  active?: boolean;
  /** Jeda sebelum karakter pertama (ms) — memberi ruang animasi bubble masuk. */
  delay?: number;
  /** Jeda antar karakter (ms). */
  speed?: number;
}

interface Progress {
  /** Teks pemilik kemajuan ini; kemajuan diabaikan bila teksnya berganti. */
  text: string;
  shown: number;
  typing: boolean;
}

/**
 * Teks yang tampil seolah diketik mesin tik, dengan kursor tipis yang berkedip.
 *
 * Seluruh kalimat sudah berada di DOM sejak awal (hanya opacity-nya 0), jadi
 * tata letak tidak bergeser saat mengetik dan screen reader tetap membaca
 * kalimat utuhnya. Bila pengguna memilih "kurangi gerak", teks langsung tampil
 * penuh (lihat aturan prefers-reduced-motion pada .mentor-type__ch).
 *
 * Aman untuk StrictMode: di mode dev React menjalankan effect dua kali
 * (setup → cleanup → setup). Karena itu cleanup hanya membatalkan timer dan
 * tidak pernah mengubah state, sementara penanda "sudah selesai" baru dipasang
 * saat pengetikan benar-benar tuntas — sehingga jalannya timer tidak ikut mati
 * dan teks tetap mengetik dari awal, bukan langsung tampil utuh.
 */
export const Typewriter = ({ text, active = true, delay = 320, speed = 38 }: TypewriterProps) => {
  const [progress, setProgress] = useState<Progress>({ text, shown: 0, typing: false });
  /** Teks yang pengetikannya sudah tuntas — supaya tidak diulang. */
  const finishedFor = useRef<string | null>(null);
  /** Posisi karakter terakhir yang tampil; membuat pengetikan yang terputus
   *  (mis. pengguna pindah langkah) bisa dilanjutkan, bukan diulang dari nol. */
  const cursor = useRef<{ text: string; index: number }>({ text, index: 0 });

  // Teks berganti pada elemen yang sama → mulai lagi dari nol. Diturunkan saat
  // render supaya effect tidak perlu setState sinkron hanya untuk mereset.
  const state = progress.text === text ? progress : { shown: 0, typing: false };
  // Bubble yang tidak sedang tampil memperlihatkan kalimat utuh tanpa animasi;
  // hanya nilai turunannya yang berubah, state pengetikan tidak disentuh.
  const shown = active ? state.shown : text.length;
  const typing = active && state.typing;

  useEffect(() => {
    if (!active || finishedFor.current === text) return;

    // Kembali ke teks ini setelah terputus: lanjutkan dari posisi terakhir.
    if (cursor.current.text !== text) cursor.current = { text, index: 0 };
    const resuming = cursor.current.index > 0;

    // Kurangi gerak: tanpa animasi — CSS yang menampilkan teks.
    if (window.matchMedia(REDUCED_MOTION).matches) {
      finishedFor.current = text;
      return;
    }

    let timer = window.setTimeout(
      function typeNext() {
        const index = cursor.current.index + 1;
        cursor.current.index = index;
        setProgress({ text, shown: index, typing: index < text.length });
        if (index < text.length) timer = window.setTimeout(typeNext, speed);
        else finishedFor.current = text;
      },
      // Melanjutkan kalimat yang sempat terputus: langsung lanjut, tidak perlu
      // menunggu animasi masuk bubble lagi.
      resuming ? 0 : delay
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [active, text, delay, speed]);

  return (
    <span className={typing ? 'mentor-type is-typing' : 'mentor-type'}>
      {Array.from(text).map((char, i) => (
        <span key={`${i}-${char}`} className={i < shown ? 'mentor-type__ch is-shown' : 'mentor-type__ch'}>
          {char}
          {/* Kursor mengikuti posisi karakter terakhir yang tampil. */}
          {typing && i === shown - 1 ? <span className="mentor-type__caret" aria-hidden="true" /> : null}
        </span>
      ))}
    </span>
  );
};
