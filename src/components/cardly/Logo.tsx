interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({ size = 28, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1">
      <div
        className="relative flex items-center justify-center rounded-lg shadow-[0_0_20px_-4px_var(--color-accent-primary)]"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
        }}
      >
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="white">
          <rect x="5" y="3" width="10" height="16" rx="2" transform="rotate(-12 10 11)" opacity="0.7" />
          <rect x="9" y="5" width="10" height="16" rx="2" transform="rotate(8 14 13)" fill="white" />
        </svg>
      </div>
      {showText && (
        <div className="font-display text-lg font-extrabold tracking-wider">CARDLY</div>
      )}
    </div>
  );
}
