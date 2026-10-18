import type { ReactNode } from 'react';
import type { BadgeIcon as BadgeIconName } from '../../data/rhythm';

const PATHS: Record<BadgeIconName, ReactNode> = {
  note: (
    <>
      <circle cx="8" cy="17.5" r="3" />
      <path d="M11 17.5V5" />
      <path d="M11 5c3 0 5 1.6 5 4" />
    </>
  ),
  rest: <path d="M10 6v12M14 6v12" />,
  step: <path d="M5 19v-3.5h4.5V11h4.5V6.5H19" />,
  leap: (
    <>
      <path d="M4 18l5-6 4 3 7-9" />
      <path d="M15 6h5v5" />
    </>
  ),
  fast: <path d="M13 3 5 13.5h5.5L11 21l8-10.5h-5.5L13 3z" />,
  crown: <path d="M5 18.5 3.8 8.5l4.7 3.2L12 5.5l3.5 6.2 4.7-3.2L19 18.5H5z" />,
  spark: <path d="M12 3.5l1.7 4.6 4.6 1.7-4.6 1.7L12 16.1l-1.7-4.6L5.7 9.8l4.6-1.7L12 3.5z" />,
  medal: (
    <>
      <circle cx="12" cy="14.5" r="4.8" />
      <path d="M9.2 9.8 7 3.5M14.8 9.8 17 3.5" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5.2a4 4 0 0 1-8 0V4z" />
      <path d="M8 6H5.2v1.6A3.2 3.2 0 0 0 8 10.8" />
      <path d="M16 6h2.8v1.6A3.2 3.2 0 0 1 16 10.8" />
      <path d="M12 13.2v4.3M9 20h6" />
    </>
  ),
};

interface BadgeIconProps {
  name: BadgeIconName;
  className?: string;
}

/** Ikon garis untuk badge — satu tempat supaya semua badge konsisten. */
export const BadgeIcon = ({ name, className }: BadgeIconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {PATHS[name]}
  </svg>
);
