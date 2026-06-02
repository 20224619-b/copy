interface SlimStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delta?: string;
  accent: string;
}

export function SlimStat({ icon, label, value, delta, accent }: SlimStatProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3.5 py-3 border transition-all hover:-translate-y-0.5"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'rgba(148,163,184,0.12)',
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center border"
        style={{
          background: `${accent}15`,
          color: accent,
          borderColor: `${accent}30`,
          boxShadow: `0 0 12px -4px ${accent}`,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
          {label}
        </div>
        <div className="font-display font-extrabold text-xl leading-tight text-text-primary tabular-nums truncate">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
      {delta && (
        <div className="text-[11px] font-semibold whitespace-nowrap" style={{ color: accent }}>
          {delta}
        </div>
      )}
    </div>
  );
}
