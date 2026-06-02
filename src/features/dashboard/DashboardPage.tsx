import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/cardly/AppShell';
import { CartaJugador } from '@/components/cardly/CartaJugador';
import { Particles } from '@/components/cardly/Particles';
import {
  IconBolt,
  IconCard,
  IconCoin,
  IconFlame,
  IconPlay,
  IconTrophy,
} from '@/components/cardly/Icon2';
import { useAuthStore } from '@/stores/auth';
import { extractApiError } from '@/lib/api';
import type {
  DashboardSummary,
  EjercicioActivoItem,
  RankingItem,
  UsuarioCartaItem,
} from '@/types/api';

import {
  getDashboardSummary,
  getEjerciciosActivos,
  getMisCartas,
  getRanking,
} from './api';
import { SectionHeader } from './components/SectionHeader';
import { SlimStat } from './components/SlimStat';
import { MisionRow } from './components/MisionRow';
import { CartaRow } from './components/CartaRow';
import { RankingRow } from './components/RankingRow';
import { Skeleton, MissionRowSkeleton } from './components/Skeleton';

interface DashboardData {
  summary: DashboardSummary;
  misiones: EjercicioActivoItem[];
  cartas: UsuarioCartaItem[];
  ranking: RankingItem[];
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [summary, activos, cartas, ranking] = await Promise.all([
          getDashboardSummary(),
          getEjerciciosActivos(),
          getMisCartas(),
          getRanking(5),
        ]);
        if (cancelled) return;
        setData({
          summary,
          misiones: activos.items,
          cartas: cartas.items.slice(0, 3),
          ranking: ranking.items,
        });
        // Refrescar el user en el store con los stats al día.
        if (user) {
          setUser({
            ...user,
            puntos: summary.stats.puntos,
            monedas: summary.stats.monedas,
            rachaEjercicios: summary.stats.rachaEjercicios,
            tiempoJugadoSeg: summary.stats.tiempoJugadoSeg,
          });
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proximaMision = data?.misiones[0];

  return (
    <AppShell>
      <div className="flex flex-col gap-4 lg:gap-5">
        {/* HERO */}
        <Hero
          username={user?.username ?? ''}
          racha={data?.summary.stats.rachaEjercicios ?? 0}
          totalMisiones={data?.misiones.length ?? 0}
          proximaMision={proximaMision}
          cartas={data?.cartas ?? []}
          loading={loading}
          onContinuar={() => {
            if (proximaMision) {
              navigate(`/ejercicios/${proximaMision.ejercicio.id}`);
            } else {
              navigate('/ejercicios');
            }
          }}
          onExplorar={() => navigate('/ejercicios')}
        />

        {/* SLIM STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 lg:gap-3">
          <SlimStat
            icon={<IconBolt size={14} />}
            label="Puntos"
            value={data?.summary.stats.puntos ?? 0}
            accent="#8b5cf6"
          />
          <SlimStat
            icon={<IconCoin size={14} />}
            label="Monedas"
            value={data?.summary.stats.monedas ?? 0}
            accent="#fbbf24"
          />
          <SlimStat
            icon={<IconFlame size={14} />}
            label="Racha"
            value={`${data?.summary.stats.rachaEjercicios ?? 0}d`}
            accent="#f97316"
          />
          <SlimStat
            icon={<IconCard size={14} />}
            label="Cartas"
            value={data?.summary.stats.totalCartas ?? 0}
            accent="#22d3ee"
          />
        </div>

        {/* 3-column body — responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr] gap-3 lg:gap-4">
          {/* Misiones */}
          <div
            className="rounded-2xl border p-4 flex flex-col gap-2.5 md:col-span-2 xl:col-span-1"
            style={{
              background: 'var(--color-bg-elevated)',
              borderColor: 'rgba(148,163,184,0.12)',
            }}
          >
            <SectionHeader
              title="Misiones activas"
              right={
                <span className="text-[11px] text-text-muted">
                  {data ? `${data.misiones.length}/5` : '—'}
                </span>
              }
            />
            {loading ? (
              <>
                <MissionRowSkeleton />
                <MissionRowSkeleton />
                <MissionRowSkeleton />
              </>
            ) : data && data.misiones.length > 0 ? (
              data.misiones
                .slice(0, 4)
                .map((m) => (
                  <MisionRow
                    key={m.id}
                    item={m}
                    onClick={() => navigate(`/ejercicios/${m.ejercicio.id}`)}
                  />
                ))
            ) : (
              <EmptyState
                title="Sin misiones activas"
                hint="Asígnate un ejercicio desde la Arena para empezar."
                action="Ir a la Arena"
                onAction={() => navigate('/ejercicios')}
              />
            )}
          </div>

          {/* Cartas recientes */}
          <div
            className="rounded-2xl border p-4 flex flex-col gap-3"
            style={{
              background: 'var(--color-bg-elevated)',
              borderColor: 'rgba(148,163,184,0.12)',
            }}
          >
            <SectionHeader
              title="Cartas recientes"
              right={
                <button
                  onClick={() => navigate('/inventario')}
                  className="text-accent-cyan text-[11px] hover:underline"
                >
                  Ver todas
                </button>
              }
            />
            <div className="flex flex-col gap-2">
              {loading ? (
                <>
                  <Skeleton className="h-14 rounded-[10px]" />
                  <Skeleton className="h-14 rounded-[10px]" />
                  <Skeleton className="h-14 rounded-[10px]" />
                </>
              ) : data && data.cartas.length > 0 ? (
                data.cartas.map((c) => <CartaRow key={c.id} item={c} />)
              ) : (
                <EmptyState
                  title="Aún no tienes cartas"
                  hint="Resuelve ejercicios para ganarlas."
                />
              )}
            </div>
          </div>

          {/* Right col: Top 5 + Mi posición */}
          <div className="flex flex-col gap-3 lg:gap-4 md:col-span-2 xl:col-span-1">
            {/* Top 5 */}
            <div
              className="rounded-2xl border p-4"
              style={{
                background: 'var(--color-bg-elevated)',
                borderColor: 'rgba(148,163,184,0.12)',
              }}
            >
              <SectionHeader
                title="Top 5"
                right={
                  <button
                    onClick={() => navigate('/ranking')}
                    className="text-accent-cyan text-[11px] hover:underline"
                  >
                    Tabla completa
                  </button>
                }
              />
              <div className="mt-2.5 flex flex-col gap-1">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 rounded-lg" />
                  ))
                ) : (
                  data?.ranking.map((r) => (
                    <RankingRow key={r.id} item={r} isMe={r.id === user?.id} />
                  ))
                )}
              </div>
            </div>

            {/* Mi resumen */}
            <div
              className="rounded-2xl border p-4 flex-1"
              style={{
                background: 'var(--color-bg-elevated)',
                borderColor: 'rgba(148,163,184,0.12)',
              }}
            >
              <SectionHeader title="Mi resumen" />
              {loading ? (
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : data ? (
                <MiResumen
                  posicion={data.summary.ranking.posicion}
                  mejorPuntaje={data.summary.ranking.mejorPuntaje}
                  puntos={data.summary.stats.puntos}
                  resueltos={data.summary.stats.ejerciciosResueltos}
                  tiempoJugadoSeg={data.summary.stats.tiempoJugadoSeg}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

interface HeroProps {
  username: string;
  racha: number;
  totalMisiones: number;
  proximaMision?: EjercicioActivoItem;
  cartas: UsuarioCartaItem[];
  loading: boolean;
  onContinuar: () => void;
  onExplorar: () => void;
}

function Hero({
  username,
  racha,
  totalMisiones,
  proximaMision,
  cartas,
  loading,
  onContinuar,
  onExplorar,
}: HeroProps) {
  const rachaActiva = racha > 0;
  return (
    <div
      className="relative overflow-hidden rounded-[18px] border p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 lg:gap-6 min-h-[180px]"
      style={{
        background: `
          radial-gradient(circle at 90% 50%, rgba(139,92,246,0.25), transparent 50%),
          radial-gradient(circle at 10% 0%, rgba(34,211,238,0.15), transparent 60%),
          linear-gradient(135deg, #161e36, #0e1424)
        `,
        borderColor: 'rgba(139,92,246,0.35)',
      }}
    >
      <div className="relative z-10">
        <div
          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider mb-3.5"
          style={{
            background: 'rgba(139,92,246,0.15)',
            borderColor: 'rgba(139,92,246,0.18)',
            color: 'var(--color-accent-primary-2)',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: rachaActiva ? 'var(--color-accent-success)' : 'var(--color-text-muted)',
              boxShadow: rachaActiva ? '0 0 8px var(--color-accent-success)' : undefined,
            }}
          />
          {rachaActiva ? `Racha activa · ${racha} días` : 'Empieza tu racha hoy'}
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight m-0">
          Bienvenido de vuelta,{' '}
          <span
            className="text-accent-cyan"
            style={{ textShadow: '0 0 16px rgba(34,211,238,0.5)' }}
          >
            {username || '…'}
          </span>
        </h1>

        <p className="mt-3 text-sm text-text-secondary max-w-xl">
          {loading
            ? 'Cargando tu progreso…'
            : totalMisiones > 0
            ? (
              <>
                Tienes{' '}
                <span className="text-accent-gold font-semibold">
                  {totalMisiones} ejercicio{totalMisiones === 1 ? '' : 's'}
                </span>{' '}
                pendiente{totalMisiones === 1 ? '' : 's'}.{' '}
                {proximaMision && (
                  <>
                    Continúa con{' '}
                    <span className="text-accent-cyan font-semibold">
                      {proximaMision.ejercicio.titulo}
                    </span>
                    .
                  </>
                )}
              </>
            )
            : 'Asígnate tu primer ejercicio para empezar a ganar cartas.'}
        </p>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="button"
            onClick={onContinuar}
            className="shimmer inline-flex items-center gap-2 px-5 py-3 rounded-[10px] text-white font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
              boxShadow:
                '0 4px 24px -8px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            <IconPlay size={14} />
            {totalMisiones > 0 ? 'Continuar misión' : 'Asignar un ejercicio'}
          </button>
          <button
            type="button"
            onClick={onExplorar}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] text-text-primary font-semibold text-sm border transition-colors hover:bg-white/5"
            style={{ borderColor: 'rgba(139,92,246,0.18)' }}
          >
            Explorar arena
          </button>
        </div>
      </div>

      {/* Floating cards stack (desktop) */}
      <div className="relative hidden lg:block min-h-[180px]">
        {cartas.slice(0, 3).map((uc, i) => {
          const positions = [
            { right: 0, top: -4, rot: -8, size: 110, delay: 0 },
            { right: 90, top: 8, rot: 4, size: 140, delay: 0.5, z: 2 },
            { right: 190, top: -2, rot: -4, size: 100, delay: 1.0 },
          ];
          const p = positions[i];
          if (!p) return null;
          return (
            <div
              key={uc.id}
              className="absolute"
              style={{
                right: p.right,
                top: p.top,
                transform: `rotate(${p.rot}deg)`,
                animation: `floatCard ${6 + i}s ease-in-out ${p.delay}s infinite`,
                zIndex: p.z ?? 1,
              }}
            >
              <CartaJugador
                carta={{
                  nombre: uc.carta.nombre,
                  rareza: uc.carta.rareza,
                  habilidad: { nombre: uc.carta.habilidad },
                }}
                size={p.size}
                tilt={false}
                holo={false}
              />
            </div>
          );
        })}
        <Particles count={10} />
      </div>
    </div>
  );
}

function MiResumen({
  posicion,
  mejorPuntaje,
  puntos,
  resueltos,
  tiempoJugadoSeg,
}: {
  posicion: number;
  mejorPuntaje: number;
  puntos: number;
  resueltos: number;
  tiempoJugadoSeg: number;
}) {
  const horas = Math.floor(tiempoJugadoSeg / 3600);
  const mins = Math.floor((tiempoJugadoSeg % 3600) / 60);
  const tiempoFmt = horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  const distanciaTop = Math.max(0, mejorPuntaje - puntos);

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(251,191,36,0.1))',
            borderColor: 'rgba(251,191,36,0.4)',
            color: 'var(--color-accent-gold)',
            boxShadow: '0 0 16px -4px var(--color-accent-gold)',
          }}
        >
          <IconTrophy size={22} />
        </div>
        <div>
          <div className="font-display font-bold text-xl text-accent-gold">#{posicion}</div>
          <div className="text-[11px] text-text-muted">en el ranking global</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <ResumenStat label="Ejercicios resueltos" value={resueltos.toLocaleString()} />
        <ResumenStat label="Tiempo jugado" value={tiempoFmt} />
        <ResumenStat
          label="Distancia al top"
          value={distanciaTop > 0 ? `${distanciaTop.toLocaleString()} pts` : '👑 #1'}
        />
        <ResumenStat label="Mejor puntaje" value={mejorPuntaje.toLocaleString()} />
      </div>
    </div>
  );
}

function ResumenStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/20 px-2.5 py-2 border border-white/5">
      <div className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-0.5">
        {label}
      </div>
      <div className="font-display font-bold text-sm text-text-primary tabular-nums truncate">
        {value}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  hint,
  action,
  onAction,
}: {
  title: string;
  hint: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-6 px-4 rounded-lg border border-dashed border-white/10">
      <div className="text-sm font-semibold text-text-primary mb-1">{title}</div>
      <div className="text-xs text-text-muted mb-3">{hint}</div>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs text-accent-cyan hover:underline font-medium"
        >
          {action} →
        </button>
      )}
    </div>
  );
}
