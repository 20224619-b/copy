import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/cardly/AppShell';
import { IconCrown, IconFlame, IconBolt } from '@/components/cardly/Icon2';
import { Skeleton } from '@/features/dashboard/components/Skeleton';
import { extractApiError } from '@/lib/api';
import { getRanking } from '@/features/dashboard/api';
import type { RankingItem } from '@/types/api';
import { useAuthStore } from '@/stores/auth';

const DEFAULT_LIMIT = 50;

export function RankingPage() {
  const myId = useAuthStore((s) => s.user?.id);
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getRanking(DEFAULT_LIMIT);
        if (!cancelled) setItems(res.items);
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

  const podium = items.slice(0, 3);
  const rest = items.slice(3);
  const myEntry = useMemo(
    () => (myId ? items.find((r) => r.id === myId) : undefined),
    [items, myId],
  );
  const myEntryInPodium = myEntry && myEntry.posicion <= 3;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">
            Clasificación
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold m-0 mt-1">Ranking</h1>
          <p className="text-sm text-text-secondary mt-1">
            Top <span className="text-accent-cyan font-semibold">{items.length}</span> jugadores ordenados por puntos totales.
          </p>
        </div>

        {/* Mi posición banner — sólo si estoy fuera del top mostrado */}
        {myEntry && !myEntryInPodium && (
          <MiPosicionBanner item={myEntry} />
        )}

        {loading ? (
          <LoadingState />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Podio top 3 */}
            {podium.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
                {/* En desktop: 2°, 1°, 3° (orden de podio); en móvil: 1°, 2°, 3° */}
                <div className="order-2 md:order-1 md:mt-8">
                  {podium[1] && <PodiumCard item={podium[1]} isMe={podium[1].id === myId} place={2} />}
                </div>
                <div className="order-1 md:order-2">
                  {podium[0] && <PodiumCard item={podium[0]} isMe={podium[0].id === myId} place={1} />}
                </div>
                <div className="order-3 md:order-3 md:mt-12">
                  {podium[2] && <PodiumCard item={podium[2]} isMe={podium[2].id === myId} place={3} />}
                </div>
              </div>
            )}

            {/* Resto del ranking */}
            {rest.length > 0 && (
              <div
                className="rounded-2xl border overflow-hidden"
                style={{
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'rgba(148,163,184,0.12)',
                }}
              >
                <table className="w-full">
                  <thead>
                    <tr
                      className="text-[10px] uppercase tracking-wider font-semibold text-text-muted"
                      style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}
                    >
                      <th className="text-left py-3 px-4 w-16">#</th>
                      <th className="text-left py-3 px-2">Jugador</th>
                      <th className="text-right py-3 px-4 hidden sm:table-cell">Racha</th>
                      <th className="text-right py-3 px-4">Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((item) => (
                      <RankingRowFull key={item.id} item={item} isMe={item.id === myId} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

// ────────────────────────────────────────────────────────────
// Podio
// ────────────────────────────────────────────────────────────

const PLACE_STYLES = {
  1: {
    color: '#fbbf24',
    bg: 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.05))',
    border: 'rgba(251,191,36,0.5)',
    glow: '0 0 32px -4px rgba(251,191,36,0.6)',
    medal: '🥇',
    size: 96,
  },
  2: {
    color: '#cbd5e1',
    bg: 'linear-gradient(135deg, rgba(203,213,225,0.18), rgba(148,163,184,0.05))',
    border: 'rgba(203,213,225,0.4)',
    glow: '0 0 24px -4px rgba(203,213,225,0.4)',
    medal: '🥈',
    size: 80,
  },
  3: {
    color: '#fb923c',
    bg: 'linear-gradient(135deg, rgba(251,146,60,0.18), rgba(234,88,12,0.05))',
    border: 'rgba(251,146,60,0.4)',
    glow: '0 0 24px -4px rgba(251,146,60,0.4)',
    medal: '🥉',
    size: 80,
  },
} as const;

function PodiumCard({
  item,
  place,
  isMe,
}: {
  item: RankingItem;
  place: 1 | 2 | 3;
  isMe?: boolean;
}) {
  const s = PLACE_STYLES[place];
  return (
    <div
      className="relative rounded-2xl border p-5 sm:p-6 text-center overflow-hidden"
      style={{
        background: s.bg,
        borderColor: isMe ? 'rgba(34,211,238,0.5)' : s.border,
        boxShadow: s.glow,
      }}
    >
      {/* Glow corner */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${s.color}40, transparent 65%)`,
          filter: 'blur(12px)',
        }}
      />

      <div className="relative">
        <div className="text-4xl sm:text-5xl mb-2 select-none">{s.medal}</div>
        <div
          className="rounded-full mx-auto flex items-center justify-center text-white font-bold border-2"
          style={{
            width: s.size,
            height: s.size,
            background: `linear-gradient(135deg, hsl(${item.username.length * 37}, 70%, 60%), hsl(${
              item.username.length * 37 + 60
            }, 70%, 50%))`,
            borderColor: s.color,
            boxShadow: s.glow,
            fontSize: s.size * 0.32,
          }}
        >
          {item.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="mt-3 font-display text-lg sm:text-xl font-bold text-text-primary truncate">
          {item.username}
          {isMe && <span className="ml-2 text-xs text-accent-cyan font-normal">tú</span>}
        </div>
        <div
          className="font-display font-extrabold tabular-nums mt-1"
          style={{ color: s.color, fontSize: 26, textShadow: `0 0 12px ${s.color}80` }}
        >
          {item.puntos.toLocaleString()} pts
        </div>
        <div className="text-[11px] text-text-muted mt-1.5 inline-flex items-center gap-1">
          <IconFlame size={11} />
          {item.rachaEjercicios} días de racha
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Tabla
// ────────────────────────────────────────────────────────────

function RankingRowFull({ item, isMe }: { item: RankingItem; isMe?: boolean }) {
  return (
    <tr
      className="transition-colors hover:bg-white/5"
      style={{
        background: isMe ? 'linear-gradient(90deg, rgba(139,92,246,0.18), transparent)' : undefined,
        borderTop: '1px solid rgba(148,163,184,0.08)',
      }}
    >
      <td className="py-2.5 px-4">
        <span
          className="font-display font-bold text-sm tabular-nums"
          style={{ color: isMe ? 'var(--color-accent-cyan)' : 'var(--color-text-muted)' }}
        >
          {item.posicion}
        </span>
      </td>
      <td className="py-2.5 px-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, hsl(${item.username.length * 37}, 70%, 60%), hsl(${
                item.username.length * 37 + 60
              }, 70%, 50%))`,
            }}
          >
            {item.username.slice(0, 2).toUpperCase()}
          </div>
          <span
            className="text-sm font-semibold truncate"
            style={{ color: isMe ? 'var(--color-accent-cyan)' : 'var(--color-text-primary)' }}
          >
            {item.username}
            {isMe && <span className="ml-1.5 text-xs text-text-muted font-normal">tú</span>}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-4 text-right hidden sm:table-cell">
        <span className="text-xs text-text-muted inline-flex items-center gap-1">
          <IconFlame size={11} /> {item.rachaEjercicios}
        </span>
      </td>
      <td className="py-2.5 px-4 text-right">
        <span className="font-display font-bold text-sm tabular-nums text-text-primary">
          {item.puntos.toLocaleString()}
        </span>
      </td>
    </tr>
  );
}

// ────────────────────────────────────────────────────────────
// Mi posición banner
// ────────────────────────────────────────────────────────────

function MiPosicionBanner({ item }: { item: RankingItem }) {
  return (
    <div
      className="rounded-2xl border p-4 flex items-center gap-4 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(34,211,238,0.06))',
        borderColor: 'rgba(34,211,238,0.4)',
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(139,92,246,0.1))',
          borderColor: 'rgba(34,211,238,0.4)',
          color: 'var(--color-accent-cyan)',
          boxShadow: '0 0 16px -4px var(--color-accent-cyan)',
        }}
      >
        <IconCrown size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">
          Tu posición
        </div>
        <div className="font-display font-bold text-xl mt-0.5">
          #{item.posicion}{' '}
          <span className="text-text-secondary text-sm font-normal">· {item.puntos.toLocaleString()} pts</span>
        </div>
      </div>
      <div className="text-[11px] text-text-muted hidden sm:inline-flex items-center gap-1">
        <IconBolt size={11} />
        Sigue sumando para subir
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[240px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[280px] rounded-2xl" />
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed border-white/10">
      <div className="text-base font-semibold text-text-primary mb-1">
        Sin jugadores aún
      </div>
      <div className="text-sm text-text-muted">
        Sé el primero en empezar a sumar puntos.
      </div>
    </div>
  );
}
