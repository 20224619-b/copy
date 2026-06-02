interface SegOption<V extends string> {
  v: V;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

interface SegChipProps<V extends string> {
  items: SegOption<V>[];
  active: V;
  onChange: (v: V) => void;
  size?: 'sm' | 'md';
}

export function SegChip<V extends string>({ items, active, onChange, size = 'md' }: SegChipProps<V>) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';
  return (
    <div
      className="inline-flex items-center gap-1 p-[3px] rounded-lg border"
      style={{
        background: 'rgba(10,14,26,0.6)',
        borderColor: 'rgba(148,163,184,0.12)',
      }}
    >
      {items.map((it) => {
        const isOn = it.v === active;
        return (
          <button
            key={it.v}
            type="button"
            onClick={() => onChange(it.v)}
            className={`${pad} rounded-md inline-flex items-center gap-1.5 font-medium transition-all`}
            style={{
              background: isOn
                ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(34,211,238,0.1))'
                : 'transparent',
              color: isOn ? it.color ?? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              fontWeight: isOn ? 600 : 500,
              boxShadow: isOn
                ? '0 0 0 1px rgba(139,92,246,0.4), 0 2px 8px -2px var(--color-accent-primary)'
                : 'none',
            }}
          >
            {it.icon}
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
