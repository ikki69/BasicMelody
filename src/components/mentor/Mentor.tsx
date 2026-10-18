import pointSvg from '../../assets/mentor/mentor-point.svg?raw';
import talkSvg from '../../assets/mentor/mentor-talk.svg?raw';
import waveSvg from '../../assets/mentor/mentor-wave.svg?raw';
import type { MentorPose } from './mentorPoses';

const SRC: Record<MentorPose, string> = {
  point: pointSvg,
  talk: talkSvg,
  wave: waveSvg,
};

interface MentorProps {
  pose: MentorPose;
  className?: string;
}

/**
 * Maskot vektor yang "memeragakan" teks penjelasan.
 *
 * Bentuknya datar (tanpa gradien, tanpa garis 1px): siluet dibangun dari isian
 * warna, dan dimensinya datang dari dua nada warna, bukan bayangan. Asetnya
 * berkas .svg terpisah (satu sumber kebenaran) lalu disisipkan inline lewat
 * import ?raw supaya bagian-bagiannya bisa dianimasikan CSS: badan naik-turun,
 * mata berkedip, mulut bergerak saat pose "talk", syal not berkibar. Maskot ini
 * murni hiasan — teksnya sendiri tetap elemen DOM di dalam bubble.
 */
export const Mentor = ({ pose, className }: MentorProps) => (
  <div
    className={className ? `mentor ${className}` : 'mentor'}
    data-pose={pose}
    aria-hidden="true"
    // Aman: isinya berkas SVG milik sendiri (bukan masukan pengguna).
    dangerouslySetInnerHTML={{ __html: SRC[pose] }}
  />
);
