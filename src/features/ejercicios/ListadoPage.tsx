import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { AppShell } from '@/components/cardly/AppShell';
import { extractApiError } from '@/lib/api';
import type {
  Dificultad,
  EjercicioListItem,
  ModuloListItem,
} from '@/types/api';

import { asignarEjercicio, getEjercicios, getEjerciciosActivos } from './api';
import { getModulos } from '@/features/modulos/api';
import { FilterGroup } from './components/FilterGroup';
import { SegChip } from './components/SegChip';
import { ModuloSelect } from './components/ModuloSelect';
import { EjercicioCard, type EstadoEjercicioListing } from './components/EjercicioCard';
import { Skeleton } from '@/features/dashboard/components/Skeleton';

// Wrapper memoizado para que el grid no re-renderice todas las cards
// cuando cambia el estado de la página (filtros, carga, etc.)
const EjercicioCardMemo = memo(function EjercicioCardMemo({
  ejercicio,
  modulo,
  estado,
  ejercicioId,
  onAsignar,
  onResolver,
}: {
  ejercicio: EjercicioListItem;
  modulo: { id: number; titulo: string } | null;
  estado: EstadoEjercicioListing;
  ejercicioId: number;
  onAsignar: (id: number) => Promise<void>;
  onResolver: (path: string) => void;
}) {
  return (
    <EjercicioCard
      ejercicio={ejercicio}
      modulo={modulo}
      estado={estado}
      onAsignar={() => onAsignar(ejercicioId)}
      onResolver={() => onResolver(`/ejercicios/${ejercicioId}`)}
    />
  );
});

type DificultadFiltro = 'TODAS' | Dificultad;
type EstadoFiltro = 'TODOS' | 'PENDIENTE' | 'SIN_ASIGNAR';

export function ListadoPage() {
  const navigate = useNavigate();


  // Filtros (todos manejados client-side excepto módulo, que también puede ir al back).
  const [moduloFiltro, setModuloFiltro] = useState<number | null>(null);
  const [dificultadFiltro, setDificultadFiltro] = useState<DificultadFiltro>('TODAS');
  const [lenguajeFiltro, setLenguajeFiltro] = useState<string>('TODOS');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('TODOS');

  // fetcher estable: useCallback evita que SWR use una closure stale
  // cuando los filtros cambian al mismo tiempo que se dispara el fetch.
  const fetcher = useCallback(async () => {
    const [ejs, mods, activos] = await Promise.all([
      getEjercicios({
        moduloId: moduloFiltro ?? undefined,
        dificultad: dificultadFiltro === 'TODAS' ? undefined : dificultadFiltro,
      }),
      getModulos(),
      getEjerciciosActivos(),
    ]);
    return {
      ejercicios: ejs.items,
      modulos: mods.items,
      pendientesIds: new Set(activos.items.map((a) => a.ejercicio.id)),
    };
  }, [moduloFiltro, dificultadFiltro]);

  const { data, isLoading: loading, error, mutate } = useSWR(
    ['arena-data', moduloFiltro, dificultadFiltro],
    fetcher,
    {
      keepPreviousData: true,
      revalidateOnMount: true,
      dedupingInterval: 5000,
    }
  );

  // 3. Extraemos los datos de manera segura para que el resto del archivo no se rompa
  const ejercicios = data?.ejercicios ?? [];
  const modulos = data?.modulos ?? [];
  const pendientesIds = data?.pendientesIds ?? new Set<number>();

  // 4. Si hay error de red, lo mostramos
  useEffect(() => {
    if (error) toast.error(extractApiError(error));
  }, [error]);
  // -------------------------

  // Lista de lenguajes disponibles para los chips (de los ejercicios cargados).
  const lenguajesDisponibles = useMemo(() => {
    const set = new Set<string>();
    ejercicios.forEach((e) => set.add(e.lenguaje));
    return ['TODOS', ...Array.from(set).sort()];
  }, [ejercicios]);

  // Filtrado client-side de lenguaje + estado.
  const filtered = useMemo(() => {
    return ejercicios.filter((e) => {
      if (lenguajeFiltro !== 'TODOS' && e.lenguaje !== lenguajeFiltro) return false;
      const estado: EstadoEjercicioListing = pendientesIds.has(e.id) ? 'PENDIENTE' : 'SIN_ASIGNAR';
      if (estadoFiltro === 'PENDIENTE' && estado !== 'PENDIENTE') return false;
      if (estadoFiltro === 'SIN_ASIGNAR' && estado !== 'SIN_ASIGNAR') return false;
      return true;
    });
  }, [ejercicios, lenguajeFiltro, estadoFiltro, pendientesIds]);

  // Mapa moduloId → titulo para usarlo en las cards.
  const modulosById = useMemo(() => {
    const map = new Map<number, ModuloListItem>();
    modulos.forEach((m) => map.set(m.id, m));
    return map;
  }, [modulos]);

  const handleAsignar = useCallback(async (ejercicioId: number) => {
    // Límite de 5 misiones activas — igual que el back
    if ((data?.pendientesIds.size ?? 0) >= 5) {
      toast.error('Ya tienes 5 misiones activas. Completa alguna antes de asignar otra.');
      return;
    }
    try {
      await asignarEjercicio(ejercicioId);
      // Actualización optimista: el ejercicio aparece como PENDIENTE
      // inmediatamente sin esperar el re-fetch del servidor
      mutate((current) => {
        if (!current) return current;
        const newPendientes = new Set(current.pendientesIds);
        newPendientes.add(ejercicioId);
        return { ...current, pendientesIds: newPendientes };
      }, { revalidate: false });
      toast.success('Ejercicio asignado. ¡A resolverlo!');
      navigate(`/ejercicios/${ejercicioId}`);
    } catch (err) {
      toast.error(extractApiError(err));
      // No re-lanzar: EjercicioCard ya maneja el estado de carga en finally
    }
  }, [data?.pendientesIds, mutate, navigate]);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">
              Arena
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold m-0 mt-1">Ejercicios</h1>
            <p className="text-sm text-text-secondary mt-1">
              <span className="text-accent-cyan font-semibold">{ejercicios.length} retos</span>
              {' '}disponibles{ejercicios.length !== filtered.length && ` · ${filtered.length} con los filtros aplicados`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div
          className="rounded-2xl border p-4 sm:p-5 flex items-end gap-5 flex-wrap"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'rgba(148,163,184,0.12)',
          }}
        >
          <FilterGroup label="Módulo">
            <ModuloSelect modulos={modulos} value={moduloFiltro} onChange={setModuloFiltro} />
          </FilterGroup>

          <FilterGroup label="Dificultad">
            <SegChip
              items={[
                { v: 'TODAS', label: 'Todas' },
                { v: 'FACIL', label: 'Fácil', color: '#34d399' },
                { v: 'MEDIO', label: 'Medio', color: '#fbbf24' },
                { v: 'DIFICIL', label: 'Difícil', color: '#ef4444' },
              ]}
              active={dificultadFiltro}
              onChange={setDificultadFiltro}
            />
          </FilterGroup>

          {lenguajesDisponibles.length > 2 && (
            <FilterGroup label="Lenguaje">
              <SegChip
                items={lenguajesDisponibles.map((l) => ({
                  v: l,
                  label: l === 'TODOS' ? 'Todos' : l.charAt(0).toUpperCase() + l.slice(1),
                }))}
                active={lenguajeFiltro}
                onChange={setLenguajeFiltro}
              />
            </FilterGroup>
          )}

          <FilterGroup label="Estado">
            <SegChip
              items={[
                { v: 'TODOS', label: 'Todos' },
                { v: 'PENDIENTE', label: 'Pendientes' },
                { v: 'SIN_ASIGNAR', label: 'Sin asignar' },
              ]}
              active={estadoFiltro}
              onChange={setEstadoFiltro}
            />
          </FilterGroup>

          <div className="ml-auto text-xs text-text-muted self-end">
            {filtered.length} resultado{filtered.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyArena
            hasFilters={
              moduloFiltro !== null ||
              dificultadFiltro !== 'TODAS' ||
              lenguajeFiltro !== 'TODOS' ||
              estadoFiltro !== 'TODOS'
            }
            onReset={() => {
              setModuloFiltro(null);
              setDificultadFiltro('TODAS');
              setLenguajeFiltro('TODOS');
              setEstadoFiltro('TODOS');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filtered.map((e) => {
              const estado: EstadoEjercicioListing = pendientesIds.has(e.id)
                ? 'PENDIENTE'
                : 'SIN_ASIGNAR';
              const modulo = e.moduloId ? modulosById.get(e.moduloId) ?? null : null;
              return (
                <EjercicioCardMemo
                  key={e.id}
                  ejercicio={e}
                  modulo={modulo ? { id: modulo.id, titulo: modulo.titulo } : null}
                  estado={estado}
                  ejercicioId={e.id}
                  onAsignar={handleAsignar}
                  onResolver={navigate}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function EmptyArena({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed border-white/10">
      <div className="text-base font-semibold text-text-primary mb-1">
        {hasFilters ? 'Sin ejercicios para estos filtros' : 'Sin ejercicios disponibles'}
      </div>
      <div className="text-sm text-text-muted mb-4">
        {hasFilters
          ? 'Prueba con otros criterios o limpia los filtros.'
          : 'Aún no se han cargado ejercicios en la plataforma.'}
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-accent-cyan hover:underline font-medium"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
