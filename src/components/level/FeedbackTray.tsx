import type { TrayMessage } from '../../hooks/useRhythmGame';

interface FeedbackTrayProps {
  message: TrayMessage | null;
  /** Lama pesan tampil sebelum menutup sendiri (ms). */
  duration?: number;
}

/**
 * Feedback tray ala Duolingo: panel yang meluncur dari bawah setiap kali
 * pemain menekan kotak nada (benar/salah/informasi).
 *
 * Muncul/hilangnya diatur satu animasi CSS (naik → diam → turun), jadi tidak
 * ada timer/state React di sini. Elemen di-key dengan id pesan supaya animasi
 * ikut berjalan ulang setiap pesan baru.
 */
export const FeedbackTray = ({ message, duration = 1500 }: FeedbackTrayProps) => {
  if (!message) return null;

  return (
    <div
      key={message.id}
      className={`lv-tray is-${message.kind}`}
      style={{ animationDuration: `${duration + 400}ms` }}
      role="status"
      aria-live="polite"
      data-kind={message.kind}
    >
      <div className="lv-tray__inner">
        <p className="lv-tray__title">{message.title}</p>
        {message.detail && <p className="lv-tray__detail">{message.detail}</p>}
      </div>
    </div>
  );
};
