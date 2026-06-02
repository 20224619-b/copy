// Listado de ejercicios — filters + grid

const EJERCICIOS_GRID = [
  { id: 1, titulo: 'FizzBuzz Arcano', dif: 'FACIL', desc: 'Imprime números 1-100, sustituyendo múltiplos de 3 y 5.', tiempo: 8, recompensa: 'COMUN', modulo: 'Fundamentos', estado: 'RESUELTO' },
  { id: 2, titulo: 'Inversor de Listas', dif: 'FACIL', desc: 'Implementa reverse(lst) sin slicing.', tiempo: 6, recompensa: 'COMUN', modulo: 'Listas', estado: 'RESUELTO' },
  { id: 3, titulo: 'Detector de Palíndromos', dif: 'MEDIO', desc: 'Ignora espacios y mayúsculas.', tiempo: 10, recompensa: 'RARA', modulo: 'Strings', estado: 'PENDIENTE' },
  { id: 4, titulo: 'Fibonacci Recursivo', dif: 'MEDIO', desc: 'Memoización obligatoria. F(50) en <1s.', tiempo: 15, recompensa: 'EPICA', modulo: 'Recursión', estado: 'PENDIENTE' },
  { id: 5, titulo: 'Conteo de Vocales', dif: 'FACIL', desc: 'Función que retorna cuántas vocales tiene una cadena.', tiempo: 5, recompensa: 'COMUN', modulo: 'Strings', estado: 'RESUELTO' },
  { id: 6, titulo: 'Suma de Diagonal', dif: 'MEDIO', desc: 'Dada una matriz NxN, suma su diagonal principal.', tiempo: 10, recompensa: 'RARA', modulo: 'Matrices', estado: 'SIN_ASIGNAR' },
  { id: 7, titulo: 'Dijkstra del Grafo Mágico', dif: 'DIFICIL', desc: 'Camino más corto en grafo ponderado. Bonus: ciclos.', tiempo: 25, recompensa: 'LEGENDARIA', modulo: 'Grafos', estado: 'SIN_ASIGNAR' },
  { id: 8, titulo: 'Validador de Brackets', dif: 'MEDIO', desc: 'Verifica balance de paréntesis, corchetes y llaves.', tiempo: 12, recompensa: 'RARA', modulo: 'Pilas', estado: 'SIN_ASIGNAR' },
  { id: 9, titulo: 'Anagrama Detector', dif: 'FACIL', desc: 'True si dos strings son anagramas.', tiempo: 7, recompensa: 'COMUN', modulo: 'Strings', estado: 'PENDIENTE' },
  { id: 10, titulo: 'N-Queens', dif: 'DIFICIL', desc: 'Coloca N reinas en tablero NxN sin atacarse.', tiempo: 30, recompensa: 'LEGENDARIA', modulo: 'Backtracking', estado: 'SIN_ASIGNAR' },
  { id: 11, titulo: 'Counter de Palabras', dif: 'FACIL', desc: 'Top-K palabras más frecuentes de un texto.', tiempo: 8, recompensa: 'COMUN', modulo: 'Diccionarios', estado: 'PENDIENTE' },
  { id: 12, titulo: 'Quicksort Arcano', dif: 'MEDIO', desc: 'Implementa quicksort in-place.', tiempo: 18, recompensa: 'EPICA', modulo: 'Ordenamiento', estado: 'SIN_ASIGNAR' },
];

function ListadoEjercicios() {
  return (
    <AppShell active="ejercicios">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, fontWeight: 600, textTransform: 'uppercase' }}>Arena</div>
            <h1 className="display" style={{ fontSize: 28, fontWeight: 700, margin: '4px 0 0' }}>Ejercicios</h1>
            <p style={{ marginTop: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>137 retos</span> · 3 nuevos esta semana
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>
              ⚙ Avanzados
            </button>
            <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
              <Icon.Bolt size={13}/> Reto del día
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="elev" style={{ padding: '14px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
          <FilterGroup label="Módulo">
            <Select value="Todos los módulos"/>
          </FilterGroup>
          <FilterGroup label="Dificultad">
            <SegChip items={[
              { v: 'TODAS', label: 'Todas' },
              { v: 'FACIL', label: 'Fácil', color: '#34d399' },
              { v: 'MEDIO', label: 'Medio', color: '#fbbf24' },
              { v: 'DIFICIL', label: 'Difícil', color: '#ef4444' },
            ]} active="TODAS"/>
          </FilterGroup>
          <FilterGroup label="Lenguaje">
            <SegChip items={[
              { v: 'PY', label: 'Python', icon: <Icon.Python/>, active: true },
            ]} active="PY"/>
          </FilterGroup>
          <FilterGroup label="Estado">
            <SegChip items={[
              { v: 'TODOS', label: 'Todos' },
              { v: 'PEND', label: 'Pendientes' },
              { v: 'OK', label: 'Resueltos' },
            ]} active="TODOS"/>
          </FilterGroup>
          <div style={{ flex: 1 }}/>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{EJERCICIOS_GRID.length} resultados</div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14,
          overflow: 'hidden', alignContent: 'start',
        }}>
          {EJERCICIOS_GRID.map(e => <EjercicioCard key={e.id} e={e}/>)}
        </div>
      </div>
    </AppShell>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Select({ value }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '7px 12px', borderRadius: 8,
      background: 'rgba(10,14,26,0.6)', border: '1px solid var(--border-soft)',
      fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', minWidth: 200,
    }}>
      <span>{value}</span>
      <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>▾</span>
    </div>
  );
}
function SegChip({ items, active }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(10,14,26,0.6)', borderRadius: 8, border: '1px solid var(--border-card)' }}>
      {items.map(it => {
        const isOn = it.v === active;
        return (
          <button key={it.v} style={{
            padding: '6px 12px', borderRadius: 6, border: 'none',
            background: isOn ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(34,211,238,0.1))' : 'transparent',
            color: isOn ? (it.color || 'var(--text-primary)') : 'var(--text-secondary)',
            fontWeight: isOn ? 600 : 500, fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: isOn ? '0 0 0 1px rgba(139,92,246,0.4), 0 2px 8px -2px var(--accent-primary)' : 'none',
          }}>{it.icon}{it.label}</button>
        );
      })}
    </div>
  );
}

function EjercicioCard({ e }) {
  const difColors = { FACIL: '#34d399', MEDIO: '#fbbf24', DIFICIL: '#ef4444' };
  const dc = difColors[e.dif];
  const R = RARITY[e.recompensa];
  const estadoLabel = { RESUELTO: '✓ Resuelto', PENDIENTE: '● Pendiente', SIN_ASIGNAR: '○ Sin asignar' }[e.estado];
  const estadoColor = { RESUELTO: 'var(--accent-success)', PENDIENTE: 'var(--accent-cyan)', SIN_ASIGNAR: 'var(--text-muted)' }[e.estado];

  return (
    <div className="elev lift" style={{
      padding: 16, borderRadius: 14, cursor: 'pointer',
      borderLeft: `3px solid ${dc}`,
      position: 'relative', overflow: 'hidden',
      minHeight: 200,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top corner: lang */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, color: 'var(--text-muted)',
      }}>
        <Icon.Python size={14}/>
      </div>

      {/* Difficulty stripe + recompensa */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
        <DifficultyBadge dif={e.dif}/>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)', lineHeight: 1.25 }}>{e.titulo}</h3>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, flex: 1 }}>{e.desc}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14,
        paddingTop: 12, borderTop: '1px solid var(--border-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
            color: R.color, fontWeight: 600,
          }}>
            <Icon.Card size={12}/> {R.label}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>⏱ {e.tiempo} min</span>
        </div>
        <div style={{ fontSize: 11, color: estadoColor, fontWeight: 600 }}>{estadoLabel}</div>
      </div>
    </div>
  );
}

window.ListadoEjercicios = ListadoEjercicios;
