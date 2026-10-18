interface StarsProps {
  /** Jumlah bintang yang didapat (0–3). */
  value: number;
  className?: string;
}

/** Satu bintang kecil untuk dipakai di dalam kalimat (bukan deret nilai). */
export const StarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.5l6.6-.9 2.9-6z" />
  </svg>
);

/** Tiga bintang: terisi sesuai nilai, sisanya redup. */
export const Stars = ({ value, className }: StarsProps) => (
  <span className={`lv-stars${className ? ` ${className}` : ''}`} aria-label={`${value} dari 3 bintang`}>
    {[1, 2, 3].map((index) => (
      <svg
        key={index}
        className={`lv-star${index <= value ? ' is-on' : ''}`}
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
      >
        <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.5l6.6-.9 2.9-6z" />
      </svg>
    ))}
  </span>
);
