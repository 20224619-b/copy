import type { ModuloListItem } from '@/types/api';

interface Props {
  modulos: ModuloListItem[];
  value: number | null;
  onChange: (v: number | null) => void;
  disabled?: boolean;
}

export function ModuloSelect({ modulos, value, onChange, disabled }: Props) {
  return (
    <div
      className="relative inline-flex items-center rounded-lg border min-w-[200px]"
      style={{
        background: 'rgba(10,14,26,0.6)',
        borderColor: 'rgba(139,92,246,0.18)',
      }}
    >
      <select
        disabled={disabled}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="appearance-none w-full bg-transparent border-none outline-none text-sm text-text-primary px-3 py-2 pr-8 cursor-pointer disabled:opacity-60"
      >
        <option value="" className="bg-bg-base">
          Todos los módulos
        </option>
        {modulos.map((m) => (
          <option key={m.id} value={m.id} className="bg-bg-base">
            {m.titulo}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-text-muted">▾</span>
    </div>
  );
}
