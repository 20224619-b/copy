import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { AppShell } from '@/components/cardly/AppShell';
import { CartaJugador, RARITY } from '@/components/cardly/CartaJugador';
import { SegChip } from '@/features/ejercicios/components/SegChip';
import { Skeleton } from '@/features/dashboard/components/Skeleton';
import { extractApiError } from '@/lib/api';
import { getMisCartas } from '@/features/dashboard/api';
import type { Rareza, UsuarioCartaItem } from '@/types/api';

type RarezaFiltro = 'TODAS' | Rareza;
type SortKey = 'recientes' | 'rareza' | 'nivel';

const RAREZA_ORDER: Record<Rareza, number> = {
  LEGENDARIA: 4,
  EPICA: 3,
  RARA: 2,
  COMUN: 1,
};

export function InventarioPage() {
  const [cartas, setCartas] = useState<UsuarioCartaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rarezaFiltro, setRarezaFiltro] = useState<RarezaFiltro>('TODAS');
  const [sortKey, setSortKey] = useState<SortKey>('recientes');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getMisCartas();
        if (!cancelled) setCartas(res.items);
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

  const conteoPorRareza = useMemo(() => {
    const out: Record<Rareza, number> = { COMUN: 0, RARA: 0, EPICA: 0, LEGENDARIA: 0 };
    cartas.forEach((c) => {
      out[c.carta.rareza] = (out[c.carta.rareza] ?? 0) + 1;
    });
    return out;
  }, [cartas]);

  const filteredSorted = useMemo(() => {
    const items =
      rarezaFiltro === 'TODAS' ? cartas : cartas.filter((c) => c.carta.rareza === rarezaFiltro);
    const sorted = [...items].sort((a, b) => {
      if (sortKey === 'recientes') {
        return new Date(b.obtenidaEn).getTime() - new Date(a.obtenidaEn).getTime();
      }
      if (sortKey === 'rareza') {
        return RAREZA_ORDER[b.carta.rareza] - RAREZA_ORDER[a.carta.rareza];
      }
      return b.nivelActual - a.nivelActual;
    });
    return sorted;
  }, [cartas, rarezaFiltro, sortKey]);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">
            Colección
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold m-0 mt-1">Mi inventario</h1>
          <p className="text-sm text-text-secondary mt-1">
            <span className="text-accent-cyan font-semibold">{cartas.length}</span>{' '}
            carta{cartas.length === 1 ? '' : 's'} en tu colección.
          </p>
        </div>

        {/* Stats por rareza */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 lg:gap-3">
          {(['LEGENDARIA', 'EPICA', 'RARA', 'COMUN'] as Rareza[]).map((r) => (
            <RarezaStat
              key={r}
              rareza={r}
              count={conteoPorRareza[r]}
              total={cartas.length}
            />
          ))}
        </div>

        {/* Filtros */}
        <div
          className="rounded-2xl border p-3.5 sm:p-4 flex items-end gap-5 flex-wrap"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'rgba(148,163,184,0.12)',
          }}
        >
          <FilterGroup label="Rareza">
            <SegChip
              items={[
                { v: 'TODAS', label: 'Todas' },
                { v: 'COMUN', label: 'Común', color: '#94a3b8' },
                { v: 'RARA', label: 'Rara', color: '#60a5fa' },
                { v: 'EPICA', label: 'Épica', color: '#c084fc' },
                { v: 'LEGENDARIA', label: 'Legendaria', color: '#fbbf24' },
              ]}
              active={rarezaFiltro}
              onChange={setRarezaFiltro}
            />
          </FilterGroup>

          <FilterGroup label="Ordenar por">
            <SegChip
              items={[
                { v: 'recientes', label: 'Recientes' },
                { v: 'rareza', label: 'Rareza' },
                { v: 'nivel', label: 'Nivel' },
              ]}
              active={sortKey}
              onChange={setSortKey}
            />
          </FilterGroup>

          <div className="ml-auto text-xs text-text-muted">
            {filteredSorted.length} de {cartas.length}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 justify-items-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="rounded-2xl w-[180px] h-[252px]" />
            ))}
          </div>
        ) : filteredSorted.length === 0 ? (
          <EmptyState hasFilter={rarezaFiltro !== 'TODAS'} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 justify-items-center">
            {filteredSorted.map((uc) => (
              <CartaInventarioCard key={uc.id} item={uc} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ────────────────────────────────────────────────────────────

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function RarezaStat({
  rareza,
  count,
  total,
}: {
  rareza: Rareza;
  count: number;
  total: number;
}) {
  const R = RARITY[rareza];
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div
      className="rounded-xl border p-3 sm:p-3.5"
      style={{
        background: `linear-gradient(135deg, ${R.glow}, transparent 60%), var(--color-bg-elevated)`,
        borderColor: R.glow,
      }}
    >
      <div className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
        {R.label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <div
          className="font-display font-extrabold text-2xl tabular-nums"
          style={{ color: R.color, textShadow: `0 0 12px ${R.glow}` }}
        >
          {count}
        </div>
        <div className="text-[11px] text-text-muted">{pct}%</div>
      </div>
    </div>
  );
}

function CartaInventarioCard({ item }: { item: UsuarioCartaItem }) {
  const nivel = item.carta.niveles.find((n) => n.nivel === item.nivelActual) ?? item.carta.niveles[0];
  return (
    <div className="flex flex-col items-center gap-2">
      <CartaJugador
        carta={{
          nombre: item.carta.nombre,
          rareza: item.carta.rareza,
          stats: nivel
            ? {
                dano: nivel.dano,
                salud: nivel.salud,
                mana: nivel.mana,
                danoHabilidad: nivel.danoHabilidad,
              }
            : undefined,
          habilidad: { nombre: item.carta.habilidad },
          descripcion: item.carta.descripcion,
        }}
        size={180}
        tilt
        holo
      />
      <div className="text-[11px] text-text-muted text-center">
        Nv {item.nivelActual} {item.enMazo && <span className="text-accent-cyan">· En mazo</span>}
      </div>
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed border-white/10">
      <div className="text-base font-semibold text-text-primary mb-1">
        {hasFilter ? 'Sin cartas de esta rareza' : 'Aún no tienes cartas'}
      </div>
      <div className="text-sm text-text-muted">
        {hasFilter
          ? 'Prueba con otra rareza o resuelve más ejercicios para conseguirlas.'
          : 'Resuelve ejercicios en la Arena para ganar tus primeras cartas.'}
      </div>
    </div>
  );
}
