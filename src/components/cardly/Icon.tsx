import type { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  size?: number;
}

export const IconCheck = ({ size = 16, ...p }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="m4 12 5 5 11-12" />
  </svg>
);

export const IconChevR = ({ size = 14, ...p }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconSword = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...p}>
    <path d="m14 2 8 8-3 1-1 3-8-8 4-4z" fill="#cbd5e1" stroke="#94a3b8" />
    <path d="m11 6-7 7 3 3 7-7" stroke="#94a3b8" strokeWidth="1.4" />
    <rect x="2" y="18" width="6" height="3" fill="#475569" rx="0.5" />
  </svg>
);

export const IconHeart = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#ef4444" {...p}>
    <path d="M12 21s-7-4.5-9.5-9.5C1 7 4 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3 0 6 3 4.5 7.5C19 16.5 12 21 12 21z" />
  </svg>
);

export const IconStar = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...p}>
    <path d="m12 2 2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17l-6.1 3.5 1.5-6.8L2.2 9l6.9-.7z" />
  </svg>
);

export const IconEye = ({ size = 16, ...p }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = ({ size = 16, ...p }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6 0-10-7-10-7a19.86 19.86 0 0 1 5.11-5.94M9.9 4.24A10.93 10.93 0 0 1 12 4c6 0 10 7 10 7a19.94 19.94 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22" />
  </svg>
);

export const IconSpinner = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);
