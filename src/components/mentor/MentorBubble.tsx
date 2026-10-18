import type { ReactNode } from 'react';
import { Mentor } from './Mentor';
import type { MentorPose } from './mentorPoses';
import { SpeechBubble } from './SpeechBubble';

type BubbleDirection = 'left' | 'right';

interface MentorBubbleProps {
  pose: MentorPose;
  /** Kalimat maskot yang akan diketik di dalam bubble. */
  text?: string;
  /** Mulai mengetik (mis. hanya saat langkah pemiliknya sedang tampil). */
  active?: boolean;
  children?: ReactNode;
  /** Arah animasi bubble: 'left' = maskot di kiri, bubble tumbuh kiri→kanan (default).
   *  'right' = maskot di kanan, bubble tumbuh kanan→kiri. */
  direction?: BubbleDirection;
  /** Kelas tambahan untuk barisnya (mis. penempatan khusus). */
  className?: string;
  /** Kecepatan mengetik dalam milidetik per huruf (bawaan: 38 ms). */
  speed?: number;
}

/**
 * Satu baris: maskot + balon ucapannya. Di layar sempit maskot mengecil
 * dan tetap di kiri supaya tidak menambah tinggi halaman.
 */
export const MentorBubble = ({ pose, text, active, children, direction = 'left', className, speed }: MentorBubbleProps) => (
  <div className={className ? `mentor-guide ${className}` : 'mentor-guide'}>
    <Mentor pose={pose} />
    <SpeechBubble direction={direction} text={text} active={active} speed={speed}>
      {children}
    </SpeechBubble>
  </div>
);
