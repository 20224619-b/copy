import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/cardly/AppShell';
import { IconBook, IconPlay, IconSwords } from '@/components/cardly/Icon2';
import { IconCheck, IconChevR, IconSpinner } from '@/components/cardly/Icon';
import { extractApiError } from '@/lib/api';
import type {
  ModuloDetail,
  ModuloEjercicioItem,
  PasoItem,
} from '@/types/api';
import { DifficultyBadge } from '@/features/dashboard/components/Badges';
import { Skeleton } from '@/features/dashboard/components/Skeleton';
import { asignarEjercicio, getEjerciciosActivos } from '@/features/ejercicios/api';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';

import {
  completarPaso,
  descompletarPaso,
  getModuloDetail,
  getModuloEjercicios,
} from './api';

export function ModuloDetailPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const moduloId = Number(params.id);

  const [modulo, setModulo] = useState<ModuloDetail | null>(null);
  const [ejercicios, setEjercicios] = useState<ModuloEjercicioItem[]>([]);
  const [pendientesIds, setPendientesIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [togglingPasoIds, setTogglingPasoIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!Number.isInteger(moduloId) || moduloId < 1) {
      toast.error('Módulo inválido');
      navigate('/modulos');
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [detail, ejs, activos] = await Promise.all([
          getModuloDetail(moduloId),
          getModuloEjercicios(moduloId),
          getEjerciciosActivos(),
        ]);
        if (cancelled) return;
        setModulo(detail);
        setEjercicios(ejs.items);
        setPendientesIds(new Set(activos.items.map((a) => a.ejercicio.id)));
      } catch (err) {
        if (!cancelled) {
          toast.error(extractApiError(err));
          navigate('/modulos');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [moduloId, navigate]);

  const progreso = useMemo(() => {
    if (!modulo) return { completados: 0, total: 0, pct: 0 };
    const total = modulo.pasos.length;
    const completados = modulo.pasos.filter((p) => p.completado).length;
    const pct = total === 0 ? 0 : Math.round((completados / total) * 100);
    return { completados, total, pct };
  }, [modulo]);

  const handleTogglePaso = async (paso: PasoItem) => {
    if (!modulo) return;
    if (togglingPasoIds.has(paso.id)) return;
    setTogglingPasoIds((prev) => new Set(prev).add(paso.id));

    const target = !paso.completado;
    // Optimistic update
    setModulo({
      ...modulo,
      pasos: modulo.pasos.map((p) => (p.id === paso.id ? { ...p, completado: target } : p)),
    });

    try {
      if (target) await completarPaso(paso.id);
      else await descompletarPaso(paso.id);
    } catch (err) {
      // Revertir si falla
      setModulo({
        ...modulo,
        pasos: modulo.pasos.map((p) => (p.id === paso.id ? { ...p, completado: !target } : p)),
      });
      toast.error(extractApiError(err));
    } finally {
      setTogglingPasoIds((prev) => {
        const next = new Set(prev);
        next.delete(paso.id);
        return next;
      });
    }
  };

  const handleAsignarEjercicio = async (ejercicioId: number) => {
    try {
      await asignarEjercicio(ejercicioId);
      setPendientesIds((prev) => new Set(prev).add(ejercicioId));
      toast.success('Ejercicio asignado a tus misiones');
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {/* Breadcrumb + back */}
        <button
          type="button"
          onClick={() => navigate('/modulos')}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary self-start"
        >
          ← Volver a módulos
        </button>

        {loading ? (
          <LoadingState />
        ) : !modulo ? null : (
          <>
            {/* Header */}
            <div
              className="rounded-2xl border p-5 sm:p-6 relative overflow-hidden"
              style={{
                background: `
                  radial-gradient(circle at 100% 0%, rgba(139,92,246,0.15), transparent 50%),
                  radial-gradient(circle at 0% 100%, rgba(34,211,238,0.10), transparent 50%),
                  var(--color-bg-elevated)
                `,
                borderColor: 'rgba(139,92,246,0.25)',
              }}
            >
              <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">
                Módulo {modulo.orden + 1}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1 mb-2 leading-tight">
                {modulo.titulo}
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
                {modulo.descripcion}
              </p>

              {/* Progress */}
              <div className="mt-5 max-w-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-text-muted">
                    {progreso.completados} de {progreso.total} pasos completados
                  </span>
                  <span
                    className="font-display font-bold text-base tabular-nums"
                    style={{
                      color: progreso.pct === 100 ? '#10b981' : 'var(--color-accent-cyan)',
                    }}
                  >
                    {progreso.pct}%
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(148,163,184,0.12)' }}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${progreso.pct}%`,
                      background:
                        progreso.pct === 100
                          ? 'linear-gradient(90deg, #10b981, #22d3ee)'
                          : 'linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-cyan))',
                      boxShadow: '0 0 10px var(--color-accent-primary)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
              {/* PASOS */}
              <section className="flex flex-col gap-3">
                <h2 className="font-display text-sm uppercase tracking-wider font-bold text-text-primary flex items-center gap-2">
                  <IconBook size={14} /> Pasos del módulo
                </h2>
                {modulo.pasos.length === 0 ? (
                  <div className="text-sm text-text-muted py-8 text-center rounded-2xl border border-dashed border-white/10">
                    Este módulo aún no tiene pasos.
                  </div>
                ) : (
                  <ol className="flex flex-col gap-2.5 list-none m-0 p-0">
                    {modulo.pasos.map((paso, idx) => (
                      <PasoRow
                        key={paso.id}
                        paso={paso}
                        idx={idx}
                        toggling={togglingPasoIds.has(paso.id)}
                        onToggle={() => handleTogglePaso(paso)}
                      />
                    ))}
                  </ol>
                )}
              </section>

              {/* EJERCICIOS */}
              <aside className="flex flex-col gap-3">
                <h2 className="font-display text-sm uppercase tracking-wider font-bold text-text-primary flex items-center gap-2">
                  <IconSwords size={14} /> Ejercicios
                </h2>
                {ejercicios.length === 0 ? (
                  <div className="text-sm text-text-muted py-8 text-center rounded-2xl border border-dashed border-white/10">
                    Sin ejercicios asociados todavía.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {ejercicios.map((e) => (
                      <EjercicioMini
                        key={e.id}
                        ejercicio={e}
                        estado={pendientesIds.has(e.id) ? 'PENDIENTE' : 'SIN_ASIGNAR'}
                        onAsignar={() => handleAsignarEjercicio(e.id)}
                        onResolver={() => navigate(`/ejercicios/${e.id}`)}
                      />
                    ))}
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

// ────────────────────────────────────────────────────────────
// PasoRow
// ────────────────────────────────────────────────────────────

function PasoRow({
  paso,
  idx,
  toggling,
  onToggle,
}: {
  paso: PasoItem;
  idx: number;
  toggling: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li
      className="rounded-2xl border overflow-hidden transition-all"
      style={{
        background: paso.completado
          ? 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(34,211,238,0.02))'
          : 'var(--color-bg-elevated)',
        borderColor: paso.completado ? 'rgba(16,185,129,0.3)' : 'rgba(148,163,184,0.12)',
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          disabled={toggling}
          className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center border-2 transition-all disabled:opacity-60"
          style={{
            background: paso.completado ? 'var(--color-accent-success)' : 'transparent',
            borderColor: paso.completado ? 'var(--color-accent-success)' : 'rgba(148,163,184,0.3)',
            color: paso.completado ? 'white' : 'var(--color-text-muted)',
            boxShadow: paso.completado ? '0 0 12px -2px var(--color-accent-success)' : 'none',
          }}
          aria-label={paso.completado ? 'Marcar como no completado' : 'Marcar como completado'}
        >
          {toggling ? (
            <IconSpinner size={12} className="animate-spin" />
          ) : paso.completado ? (
            <IconCheck size={12} />
          ) : (
            <span className="text-xs font-bold">{idx + 1}</span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`text-[15px] font-semibold leading-snug m-0 ${
                paso.completado ? 'text-text-secondary line-through' : 'text-text-primary'
              }`}
            >
              {paso.titulo}
            </h3>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex-shrink-0 text-[11px] text-accent-cyan hover:underline whitespace-nowrap"
            >
              {expanded ? 'Ocultar' : 'Ver contenido'}
            </button>
          </div>

          {expanded && (
            <div className="mt-4 space-y-3 pr-2">
              <MarkdownRenderer source={paso.contenidoTextual} />
              {paso.video && (
                <a
                  href={paso.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-accent-cyan hover:underline mt-2"
                >
                  <IconPlay size={11} /> Ver video
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

// ────────────────────────────────────────────────────────────
// EjercicioMini
// ────────────────────────────────────────────────────────────

function EjercicioMini({
  ejercicio: e,
  estado,
  onAsignar,
  onResolver,
}: {
  ejercicio: ModuloEjercicioItem;
  estado: 'PENDIENTE' | 'SIN_ASIGNAR';
  onAsignar: () => Promise<void> | void;
  onResolver: () => void;
}) {
  const [asignando, setAsignando] = useState(false);
  const tiempoMin = Math.max(1, Math.round(e.tiempoEstimadoSeg / 60));

  const handleClick = async () => {
    if (estado === 'PENDIENTE') {
      onResolver();
      return;
    }
    if (asignando) return;
    setAsignando(true);
    try {
      await onAsignar();
    } finally {
      setAsignando(false);
    }
  };

  return (
    <div
      className="rounded-xl border p-3 flex flex-col gap-2"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'rgba(148,163,184,0.12)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-text-primary leading-snug m-0 line-clamp-2">
          {e.titulo}
        </h4>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <DifficultyBadge dif={e.dificultad} />
        <span className="text-[11px] text-text-muted">· ⏱ {tiempoMin} min</span>
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={asignando}
        className="mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-60"
        style={
          estado === 'PENDIENTE'
            ? {
                background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
                color: 'white',
                boxShadow: '0 4px 12px -4px var(--color-accent-primary)',
              }
            : {
                background: 'transparent',
                border: '1px solid rgba(139,92,246,0.4)',
                color: 'var(--color-accent-primary-2)',
              }
        }
      >
        {estado === 'PENDIENTE' ? (
          <>
            <IconPlay size={10} /> Resolver
          </>
        ) : asignando ? (
          <>
            <IconSpinner size={10} className="animate-spin" /> Asignando…
          </>
        ) : (
          <>
            + Asignar
          </>
        )}
        {estado === 'PENDIENTE' && <IconChevR size={10} />}
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <>
      <Skeleton className="h-[180px] rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-2xl" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))}
        </div>
      </div>
    </>
  );
}
