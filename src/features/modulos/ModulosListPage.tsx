import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/cardly/AppShell';
import { IconBook, IconPlay, IconSwords } from '@/components/cardly/Icon2';
import { IconChevR } from '@/components/cardly/Icon';
import { extractApiError } from '@/lib/api';
import type { ModuloListItem } from '@/types/api';
import { Skeleton } from '@/features/dashboard/components/Skeleton';

import { getModulos } from './api';

export function ModulosListPage() {
  const navigate = useNavigate();
  const [modulos, setModulos] = useState<ModuloListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getModulos();
        if (!cancelled) setModulos(res.items);
      } catch (err) {
        if (!cancelled) toast.error(extractApiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">
            Aprendizaje
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold m-0 mt-1">Módulos</h1>
          <p className="text-sm text-text-secondary mt-1">
            <span className="text-accent-cyan font-semibold">{modulos.length}</span>{' '}
            módulo{modulos.length === 1 ? '' : 's'} disponible{modulos.length === 1 ? '' : 's'} para avanzar paso a paso.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[220px] rounded-2xl" />
            ))}
          </div>
        ) : modulos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {modulos.map((m, idx) => (
              <ModuloCard key={m.id} modulo={m} index={idx} onOpen={() => navigate(`/modulos/${m.id}`)} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

interface ModuloCardProps {
  modulo: ModuloListItem;
  index: number;
  onOpen: () => void;
}

const ACCENTS = ['#8b5cf6', '#22d3ee', '#10b981', '#fbbf24', '#ef4444', '#a855f7'];

function ModuloCard({ modulo, index, onOpen }: ModuloCardProps) {
  const pct = modulo.progreso?.porcentaje ?? 0;
  const completados = modulo.progreso?.completados ?? 0;
  const total = modulo.progreso?.total ?? modulo.totalPasos;
  const accent = ACCENTS[index % ACCENTS.length];
  const completo = pct === 100;
  const empezado = pct > 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex flex-col rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent-primary/40 overflow-hidden"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'rgba(148,163,184,0.12)',
      }}
    >
      {/* Decorative corner glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent}30, transparent 65%)`,
          filter: 'blur(8px)',
        }}
      />

      <div className="relative flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
          style={{
            background: `${accent}15`,
            color: accent,
            borderColor: `${accent}30`,
            boxShadow: `0 0 16px -4px ${accent}`,
          }}
        >
          <IconBook size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
            Módulo {modulo.orden + 1}
          </div>
          <h3 className="text-base font-bold text-text-primary leading-tight mt-0.5 truncate">
            {modulo.titulo}
          </h3>
        </div>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed flex-1 line-clamp-3 mb-4">
        {modulo.descripcion}
      </p>

      {/* Progress */}
      {modulo.progreso && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-text-muted">
              {completados} / {total} pasos
            </span>
            <span
              className="font-display font-bold text-sm tabular-nums"
              style={{ color: completo ? '#10b981' : accent, textShadow: `0 0 8px ${accent}40` }}
            >
              {pct}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(148,163,184,0.12)' }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
                boxShadow: `0 0 10px ${accent}80`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t"
           style={{ borderTopColor: 'rgba(148,163,184,0.12)' }}>
        <div className="flex items-center gap-3 text-[11px] text-text-muted">
          <span className="inline-flex items-center gap-1">
            <IconBook size={11} /> {modulo.totalPasos}
          </span>
          <span className="inline-flex items-center gap-1">
            <IconSwords size={11} /> {modulo.totalEjercicios}
          </span>
        </div>
        <div
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: completo ? '#10b981' : accent }}
        >
          {completo ? '✓ Completado' : empezado ? (
            <>
              <IconPlay size={10} /> Continuar
            </>
          ) : (
            'Empezar'
          )}
          <IconChevR size={11} />
        </div>
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed border-white/10">
      <div className="text-base font-semibold text-text-primary mb-1">
        Sin módulos disponibles
      </div>
      <div className="text-sm text-text-muted">
        Vuelve más tarde cuando el equipo cargue contenido educativo.
      </div>
    </div>
  );
}
