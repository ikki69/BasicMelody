import type { TrayMessage } from '../../hooks/useRhythmGame';

interface FeedbackTrayProps {
  message: TrayMessage | null;
  /** Lama pesan tampil sebelum menutup sendiri (ms). */
  duration?: number;
}

/** Ikon kecil di dalam medali feedback, mengikuti jenis pesan. */
const FeedbackIcon = ({ kind }: { kind: TrayMessage['kind'] }) => {
  if (kind === 'miss') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }

  if (kind === 'good') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.5l6.6-.9 2.9-6z" />
      </svg>
    );
  }

  if (kind === 'info') {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5.5" />
        <path d="M12 7.5h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 12.5l5 5 10-11" />
    </svg>
  );
};

/**
 * Popup feedback di tengah layar: muncul setiap kali pemain menjawab atau
 * menekan kotak nada (benar/salah/informasi).
 *
 * Muncul/hilangnya diatur satu animasi CSS (pop masuk → diam → memudar),
 * jadi tidak ada timer/state React di sini. Elemen di-key dengan id pesan
 * supaya animasi ikut berjalan ulang setiap pesan baru.
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
      <div className="lv-tray__card">
        <span className="lv-tray__icon" aria-hidden="true">
          <FeedbackIcon kind={message.kind} />
        </span>
        <div className="lv-tray__inner">
          <p className="lv-tray__title">{message.title}</p>
          {message.detail && <p className="lv-tray__detail">{message.detail}</p>}
        </div>
      </div>
    </div>
  );
};
