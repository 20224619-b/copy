import { useState } from 'react';
import type { Dificultad, EjercicioListItem } from '@/types/api';
import { DifficultyBadge, LangBadge } from '@/features/dashboard/components/Badges';
import { IconPlay, IconCode } from '@/components/cardly/Icon2';
import { IconSpinner } from '@/components/cardly/Icon';

export type EstadoEjercicioListing = 'PENDIENTE' | 'SIN_ASIGNAR';

const DIFF_COLORS: Record<Dificultad, string> = {
  FACIL: '#34d399',
  MEDIO: '#fbbf24',
  DIFICIL: '#ef4444',
};

interface EjercicioCardProps {
  ejercicio: EjercicioListItem;
  modulo?: { id: number; titulo: string } | null;
  estado: EstadoEjercicioListing;
  onAsignar: () => Promise<void> | void;
  onResolver: () => void;
}

export function EjercicioCard({
  ejercicio: e,
  modulo,
  estado,
  onAsignar,
  onResolver,
}: EjercicioCardProps) {
  const [asignando, setAsignando] = useState(false);
  const accent = DIFF_COLORS[e.dificultad];

  const handleAsignar = async () => {
    if (asignando) return;
    setAsignando(true);
    try {
      await onAsignar();
    } finally {
      setAsignando(false);
    }
  };

  const tiempoMin = Math.max(1, Math.round(e.tiempoEstimadoSeg / 60));

  return (
    <div
      className="relative flex flex-col rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:border-accent-primary/40"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'rgba(148,163,184,0.12)',
        borderLeftWidth: 3,
        borderLeftColor: accent,
        minHeight: 200,
      }}
    >
      {/* top-right lang */}
      <div className="absolute top-3 right-3">
        <LangBadge lang={e.lenguaje} />
      </div>

      {/* difficulty */}
      <div className="mb-2.5">
        <DifficultyBadge dif={e.dificultad} />
      </div>

      {/* title */}
      <h3 className="text-[15px] font-bold text-text-primary leading-snug m-0 mb-1.5 pr-16 line-clamp-2">
        {e.titulo}
      </h3>

      {/* description */}
      <p className="text-xs text-text-secondary leading-relaxed m-0 flex-1 line-clamp-3">
        {e.descripcion}
      </p>

      {/* footer */}
      <div
        className="flex items-center justify-between gap-2 mt-3 pt-3 border-t"
        style={{ borderTopColor: 'rgba(148,163,184,0.12)' }}
      >
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted min-w-0">
          {modulo && (
            <>
              <IconCode size={11} />
              <span className="truncate">{modulo.titulo}</span>
              <span>·</span>
            </>
          )}
          <span>⏱ {tiempoMin} min</span>
        </div>

        {estado === 'PENDIENTE' ? (
          <button
            type="button"
            onClick={onResolver}
            className="shimmer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white text-[11px] font-semibold whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
              boxShadow: '0 4px 12px -4px var(--color-accent-primary)',
            }}
          >
            <IconPlay size={10} />
            Resolver
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAsignar}
            disabled={asignando}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold whitespace-nowrap border transition-colors hover:bg-white/5 disabled:opacity-60"
            style={{
              borderColor: 'rgba(139,92,246,0.4)',
              color: 'var(--color-accent-primary-2)',
            }}
          >
            {asignando ? <IconSpinner size={10} className="animate-spin" /> : '+'}
            {asignando ? 'Asignando…' : 'Asignar'}
          </button>
        )}
      </div>

      {/* estado pill — top left subtle */}
      {estado === 'PENDIENTE' && (
        <div
          className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border opacity-0"
          aria-hidden
        >
          {/* placeholder for symmetry; estado mostrado en footer ya */}
        </div>
      )}
    </div>
  );
}
