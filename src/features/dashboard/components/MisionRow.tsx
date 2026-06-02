import type { EjercicioActivoItem } from '@/types/api';
import { DifficultyBadge } from './Badges';
import { IconPlay } from '@/components/cardly/Icon2';

interface Props {
  item: EjercicioActivoItem;
  onClick?: () => void;
}

export function MisionRow({ item, onClick }: Props) {
  const e = item.ejercicio;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-[10px] border border-white/5 bg-black/20 px-3 py-2.5 text-left transition-all hover:border-accent-primary/40 hover:bg-black/30 w-full"
    >
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-text-primary truncate mb-1">{e.titulo}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <DifficultyBadge dif={e.dificultad} />
          <span className="text-[11px] text-text-muted">· {e.lenguaje}</span>
        </div>
      </div>
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
          boxShadow: '0 4px 12px -4px var(--color-accent-primary)',
        }}
      >
        <IconPlay size={12} />
      </div>
    </button>
  );
}
