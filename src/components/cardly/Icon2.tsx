import type { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  size?: number;
}

export const IconBolt = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="url(#g-bolt)" stroke="#8b5cf6" strokeWidth="1" />
    <defs>
      <linearGradient id="g-bolt" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c4b5fd" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

export const IconCoin = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...p}>
    <circle cx="12" cy="12" r="9" fill="url(#g-coin)" stroke="#f59e0b" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6" fill="none" stroke="#fef3c7" strokeWidth="0.8" opacity="0.7" />
    <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="800" fill="#78350f" fontFamily="Orbitron">
      C
    </text>
    <defs>
      <radialGradient id="g-coin">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </radialGradient>
    </defs>
  </svg>
);

export const IconFlame = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...p}>
    <path d="M12 2c0 4-5 6-5 11a5 5 0 0 0 10 0c0-3-2-4-2-7 0 2-3 2-3-4z" fill="url(#g-flame)" />
    <defs>
      <linearGradient id="g-flame" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="60%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>
  </svg>
);

export const IconCard = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...p}>
    <rect x="4" y="3" width="13" height="18" rx="2" fill="#1a2238" stroke="#8b5cf6" strokeWidth="1.4" />
    <rect x="7" y="6" width="7" height="9" rx="1" fill="url(#g-card)" opacity="0.8" />
    <defs>
      <linearGradient id="g-card" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
  </svg>
);

export const IconPlay = ({ size = 16, ...p }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" {...p}>
    <path d="M7 4v16l13-8z" />
  </svg>
);

export const IconHome = ({ size = 16, ...p }: IconProps) => (
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
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
  </svg>
);

export const IconSwords = ({ size = 16, ...p }: IconProps) => (
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
    <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
    <path d="m13 19 6-6" />
    <path d="m16 16 4 4" />
    <path d="m19 21 2-2" />
    <path d="M14.5 6.5 18 3h3v3l-3.5 3.5" />
    <path d="m5 14 4 4" />
    <path d="m3 19 2 2" />
    <path d="m11 13-2 2" />
  </svg>
);

export const IconBook = ({ size = 16, ...p }: IconProps) => (
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
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const IconCards = ({ size = 16, ...p }: IconProps) => (
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
    <rect x="3" y="6" width="11" height="14" rx="2" />
    <path d="M7 3h10a2 2 0 0 1 2 2v12" />
  </svg>
);

export const IconCrown = ({ size = 16, ...p }: IconProps) => (
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
    <path d="M2 18h20l-2-10-5 5-3-8-3 8-5-5z" />
  </svg>
);

export const IconLogout = ({ size = 16, ...p }: IconProps) => (
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
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const IconMenu = ({ size = 16, ...p }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    {...p}
  >
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const IconX = ({ size = 16, ...p }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    {...p}
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export const IconCode = ({ size = 16, ...p }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...p}
  >
    <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
  </svg>
);

export const IconTrophy = ({ size = 16, ...p }: IconProps) => (
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
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
