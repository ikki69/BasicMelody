import type { ReactNode } from 'react';
import { Typewriter } from './Typewriter';

type BubbleDirection = 'left' | 'right';

interface SpeechBubbleProps {
  /** Isi bubble yang bukan kalimat tunggal (mis. elemen kaya). */
  children?: ReactNode;
  /** Kalimat yang "diucapkan" maskot — otomatis diketik seperti mesin tik. */
  text?: string;
  /** Mulai mengetik (mis. hanya saat langkah pemiliknya sedang tampil). */
  active?: boolean;
  /** Kelas tambahan untuk pembungkus teks (mis. pengaturan ukuran khusus). */
  textClassName?: string;
  /** Kecepatan mengetik dalam milidetik per huruf (bawaan Typewriter: 38 ms). */
  speed?: number;
  /** Arah animasi masuk: 'left' = tumbuh dari kiri ke kanan (maskot di kiri),
   *  'right' = tumbuh dari kanan ke kiri (maskot di kanan). */
  direction?: BubbleDirection;
  className?: string;
}

/**
 * Balon ucapan maskot. Teksnya tetap elemen DOM biasa (bukan gambar) supaya
 * bisa dibaca screen reader dan diseleksi; hanya bidang + ekornya yang gaya.
 * Animasi masuk mengikuti arah maskot: bubble muncul dari sisi maskot lalu
 * memanjang ke sisi lain secara smooth.
 *
 * Kalimat cukup diberikan lewat prop `text` — mesin tiknya dipasang di sini
 * supaya berlaku otomatis untuk semua bubble, tanpa perlu diingat lagi di
 * setiap tempat pemakaian.
 */
export const SpeechBubble = ({
  children,
  text,
  active = true,
  textClassName,
  speed,
  direction = 'left',
  className,
}: SpeechBubbleProps) => (
  <div className={className ? `mentor-bubble mentor-bubble--${direction} ${className}` : `mentor-bubble mentor-bubble--${direction}`}>
    <div className={textClassName ? `mentor-bubble__text ${textClassName}` : 'mentor-bubble__text'}>
      {text === undefined ? children : <Typewriter text={text} active={active} speed={speed} />}
    </div>
  </div>
);
