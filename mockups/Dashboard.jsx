// Dashboard — 2 variations (A: 3-column classic, B: hero-led + grid)

function TypingHello({ name = 'aria_dev', delay = 0 }) {
  // For a static prototype, we just show the full string with a blinking cursor.
  return (
    <span>Bienvenido de vuelta, <span style={{ color: 'var(--accent-cyan)', textShadow: '0 0 16px rgba(34,211,238,0.5)' }}>{name}</span>
      <span style={{
        display: 'inline-block', width: 3, height: '1em', background: 'var(--accent-cyan)',
        verticalAlign: '-2px', marginLeft: 6, animation: 'typingBlink 1s steps(1) infinite',
      }}/>
    </span>
  );
}

const ACTIVE_EJERCICIOS = [
  { id: 1, titulo: 'FizzBuzz Arcano', dificultad: 'FACIL', desc: 'Imprime los números del 1 al 100 — múltiplos de 3 → "Fizz", de 5 → "Buzz".', tiempo: 480, lang: 'Python', recompensa: 'COMUN', modulo: 'Fundamentos' },
  { id: 2, titulo: 'Inversor de Listas', dificultad: 'FACIL', desc: 'Implementa una función reverse(lst) sin usar slicing ni list.reverse().', tiempo: 360, lang: 'Python', recompensa: 'COMUN', modulo: 'Listas' },
  { id: 3, titulo: 'Detector de Palíndromos', dificultad: 'MEDIO', desc: 'Devuelve True si una cadena es palíndromo ignorando espacios y case.', tiempo: 600, lang: 'Python', recompensa: 'RARA', modulo: 'Strings' },
  { id: 4, titulo: 'Fibonacci Recursivo', dificultad: 'MEDIO', desc: 'Calcula F(n) con memoización. Debe resolver F(50) en < 1s.', tiempo: 900, lang: 'Python', recompensa: 'EPICA', modulo: 'Recursión' },
  { id: 5, titulo: 'Dijkstra del Grafo Mágico', dificultad: 'DIFICIL', desc: 'Camino más corto en un grafo ponderado. Bonus: detectar ciclos.', tiempo: 1500, lang: 'Python', recompensa: 'LEGENDARIA', modulo: 'Grafos' },
];

const RECENT_CARDS = [
  { nombre: 'Hechicero del Loop', rareza: 'EPICA', theme: 'loop', stats: { dano: 6, salud: 5, mana: 3, danoHabilidad: 8 }, habilidad: { nombre: 'Iteración Arcana' } },
  { nombre: 'Aprendiz de Listas', rareza: 'COMUN', theme: 'list', stats: { dano: 2, salud: 3, mana: 1, danoHabilidad: 3 }, habilidad: { nombre: 'Indexar' } },
  { nombre: 'Vidente del If', rareza: 'RARA', theme: 'cond', stats: { dano: 4, salud: 6, mana: 2, danoHabilidad: 5 }, habilidad: { nombre: 'Ramificación' } },
];

const RANKING = [
  { pos: 1, name: 'kodama_rust', pts: 8420, racha: 24, move: 0 },
  { pos: 2, name: 'shiro_py', pts: 7180, racha: 18, move: 1 },
  { pos: 3, name: 'volt.kernel', pts: 6940, racha: 12, move: -1 },
  { pos: 4, name: 'nina_async', pts: 5210, racha: 8, move: 2 },
  { pos: 5, name: 'aria_dev', pts: 2840, racha: 12, move: 3, me: true },
];

const MODULOS_PROGRESO = [
  { nombre: 'Fundamentos de Python', pasos: 12, completados: 12, color: '#10b981' },
  { nombre: 'Estructuras de control', pasos: 8, completados: 5, color: '#8b5cf6' },
  { nombre: 'Funciones & Recursión', pasos: 10, completados: 3, color: '#22d3ee' },
];

/* ============ DASHBOARD V1 — 3 columnas clásica ============ */
function DashboardV1() {
  return (
    <AppShell active="home">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>

        {/* Hero header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>
              Martes · 27 de Mayo · Temporada 03
            </div>
            <h1 className="display" style={{ fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
              <TypingHello />
            </h1>
            <p style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
              Tienes <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>3 ejercicios activos</span> y estás
              a <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>160 PTS</span> del top 10.
            </p>
          </div>
          <button className="btn btn-primary shimmer" style={{ padding: '12px 22px', fontSize: 14 }}>
            <Icon.Play size={14}/> Continuar misión
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <StatCard label="Puntos" value={2840} icon={<Icon.Bolt size={18}/>} accent="#8b5cf6"
                    sparkline={[120, 180, 210, 200, 260, 240, 320]} sub="+320 esta semana"/>
          <StatCard label="Monedas" value={175} icon={<Icon.Coin size={18}/>} accent="#fbbf24"
                    sparkline={[40, 50, 80, 65, 90, 110, 175]} sub="2 sobres listos"/>
          <StatCard label="Racha" value="12 días" icon={<Icon.Flame size={18}/>} accent="#f97316"
                    sparkline={[1,1,1,1,1,1,1]} sub="🔥 mejor racha"/>
          <StatCard label="Cartas" value="34 / 120" icon={<Icon.Card size={18}/>} accent="#22d3ee"
                    sparkline={[10,12,15,18,22,28,34]} sub="28% colección"/>
        </div>

        {/* 2-column body */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, flex: 1, minHeight: 0 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
            <SectionHeader title="Ejercicios activos" right={<><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>5 / 5</span><a style={{ color: 'var(--accent-cyan)', fontSize: 12, cursor: 'pointer' }}>Ver todos →</a></>}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACTIVE_EJERCICIOS.slice(0,3).map(e => <ActiveEjercicioRow key={e.id} e={e}/>)}
            </div>

            <SectionHeader title="Continúa aprendiendo" right={<a style={{ color: 'var(--accent-cyan)', fontSize: 12, cursor: 'pointer' }}>Ver módulos →</a>}/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {MODULOS_PROGRESO.map(m => <ModuloProgresoCard key={m.nombre} m={m}/>)}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
            <SectionHeader title="Ranking global" right={<a style={{ color: 'var(--accent-cyan)', fontSize: 12, cursor: 'pointer' }}>Tabla completa →</a>}/>
            <div className="elev" style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {RANKING.map(r => <RankingRow key={r.name} r={r}/>)}
            </div>

            <SectionHeader title="Cartas recientes" right={<a style={{ color: 'var(--accent-cyan)', fontSize: 12, cursor: 'pointer' }}>Inventario →</a>}/>
            <div style={{
              display: 'flex', gap: 10, overflow: 'visible',
              padding: '12px 0 4px',
              alignItems: 'flex-start',
            }}>
              {RECENT_CARDS.map((c,i) => (
                <div key={i} style={{ transform: `rotate(${(i-1)*4}deg)`, transformOrigin: 'top center' }}>
                  <CartaJugador carta={c} size={120} tilt={false}/>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}

function SectionHeader({ title, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--font-display)' }}>{title}</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>{right}</div>
    </div>
  );
}

function ActiveEjercicioRow({ e }) {
  return (
    <div className="elev lift" style={{
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
      borderRadius: 12, cursor: 'pointer',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(34,211,238,0.1))',
        border: '1px solid var(--border-soft)',
        color: 'var(--accent-cyan)',
      }}><Icon.Code size={20}/></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{e.titulo}</div>
          <DifficultyBadge dif={e.dificultad}/>
          <LangBadge lang={e.lang}/>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {e.modulo}</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.desc}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          ⏱ {Math.round(e.tiempo/60)} min
        </div>
        <button className="btn btn-primary shimmer" style={{ padding: '7px 14px', fontSize: 12 }}>
          <Icon.Play size={11}/> Resolver
        </button>
      </div>
    </div>
  );
}

function ModuloProgresoCard({ m }) {
  const pct = Math.round((m.completados / m.pasos) * 100);
  return (
    <div className="elev lift" style={{ padding: 16, borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{m.nombre}</div>
        <div className="display" style={{ fontSize: 18, fontWeight: 800, color: m.color, textShadow: `0 0 12px ${m.color}80` }}>{pct}%</div>
      </div>
      <div style={{ height: 6, background: 'rgba(148,163,184,0.12)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${m.color}, ${m.color}cc)`,
          boxShadow: `0 0 10px ${m.color}80`,
        }}/>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.completados} / {m.pasos} pasos</div>
    </div>
  );
}

function RankingRow({ r }) {
  const medal = r.pos === 1 ? '🥇' : r.pos === 2 ? '🥈' : r.pos === 3 ? '🥉' : null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 8,
      background: r.me ? 'linear-gradient(90deg, rgba(139,92,246,0.18), transparent)' : 'transparent',
      border: r.me ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.3)', fontSize: 13, fontWeight: 700,
        color: r.pos <= 3 ? 'var(--accent-gold)' : 'var(--text-muted)',
        fontFamily: 'var(--font-display)',
      }}>{medal || r.pos}</div>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: `linear-gradient(135deg, hsl(${r.name.length*37}, 70%, 60%), hsl(${r.name.length*37+60}, 70%, 50%))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700,
      }}>{r.name.slice(0,2).toUpperCase()}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: r.me ? 'var(--accent-cyan)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}{r.me && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6, fontSize: 11 }}>tú</span>}</div>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)', alignItems: 'center' }}>
          <Icon.Flame size={10}/> {r.racha} · {r.pts.toLocaleString()} pts
        </div>
      </div>
      {r.move !== 0 && (
        <div style={{ fontSize: 10, color: r.move > 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 600 }}>
          {r.move > 0 ? '▲' : '▼'} {Math.abs(r.move)}
        </div>
      )}
    </div>
  );
}

/* ============ DASHBOARD V2 — hero-led + arena view ============ */
function DashboardV2() {
  return (
    <AppShell active="home">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

        {/* Hero — full-width arena card */}
        <div className="elev" style={{
          padding: '28px 32px', borderRadius: 18, position: 'relative', overflow: 'hidden',
          background: `
            radial-gradient(circle at 90% 50%, rgba(139,92,246,0.25), transparent 50%),
            radial-gradient(circle at 10% 0%, rgba(34,211,238,0.15), transparent 60%),
            linear-gradient(135deg, #161e36, #0e1424)
          `,
          border: '1px solid rgba(139,92,246,0.35)',
          display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24,
          minHeight: 196,
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 10px',
              background: 'rgba(139,92,246,0.15)', border: '1px solid var(--border-soft)',
              borderRadius: 999, fontSize: 11, fontWeight: 600, color: 'var(--accent-primary-2)',
              letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 14,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-success)', boxShadow: '0 0 8px var(--accent-success)' }}/>
              Racha activa · 12 días
            </div>
            <h1 className="display" style={{ fontSize: 30, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
              <TypingHello />
            </h1>
            <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 14, maxWidth: 540 }}>
              Resolver <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>3 ejercicios</span> hoy
              te dará el sobre épico que llevas días persiguiendo. ¿Listo?
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 18, alignItems: 'center' }}>
              <button className="btn btn-primary shimmer" style={{ padding: '12px 20px' }}>
                <Icon.Play size={14}/> Continuar Fibonacci recursivo
              </button>
              <button className="btn btn-ghost" style={{ padding: '12px 18px' }}>Explorar arena</button>
            </div>
          </div>
          {/* hero card stack */}
          <div style={{ position: 'relative', height: 180 }}>
            <div style={{ position: 'absolute', right: 32, top: -4, transform: 'rotate(-8deg)', animation: 'float 7s ease-in-out infinite' }}>
              <CartaJugador carta={RECENT_CARDS[2]} size={120} tilt={false}/>
            </div>
            <div style={{ position: 'absolute', right: 110, top: 10, transform: 'rotate(2deg)', zIndex: 2, animation: 'float 6s ease-in-out 0.5s infinite' }}>
              <CartaJugador carta={RECENT_CARDS[0]} size={150} tilt={false}/>
            </div>
            <div style={{ position: 'absolute', right: 220, top: -2, transform: 'rotate(-4deg)', animation: 'float 8s ease-in-out 1s infinite' }}>
              <CartaJugador carta={RECENT_CARDS[1]} size={110} tilt={false}/>
            </div>
            <Particles count={12} />
          </div>
        </div>

        {/* Stats row — slim */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <SlimStat icon={<Icon.Bolt size={14}/>} label="Puntos" value="2,840" delta="+320" accent="#8b5cf6"/>
          <SlimStat icon={<Icon.Coin size={14}/>} label="Monedas" value="175" delta="+45" accent="#fbbf24"/>
          <SlimStat icon={<Icon.Flame size={14}/>} label="Racha" value="12d" delta="🔥 best" accent="#f97316"/>
          <SlimStat icon={<Icon.Card size={14}/>} label="Cartas" value="34/120" delta="28%" accent="#22d3ee"/>
        </div>

        {/* 3-column grid body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>

          {/* Active exercises */}
          <div className="elev" style={{ padding: 16, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SectionHeader title="Misiones activas" right={<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>5/5</span>}/>
            {ACTIVE_EJERCICIOS.slice(0,4).map(e => <CompactEjRow key={e.id} e={e}/>)}
          </div>

          {/* Recent cards (vertical stack) */}
          <div className="elev" style={{ padding: 16, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionHeader title="Cartas recientes" right={<a style={{ color: 'var(--accent-cyan)', fontSize: 11, cursor: 'pointer' }}>Ver todas</a>}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RECENT_CARDS.map((c,i) => <CartaRow key={i} c={c}/>)}
            </div>
            <div style={{ marginTop: 'auto', padding: 12, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))',
              border: '1px dashed rgba(251,191,36,0.4)',
              textAlign: 'center', cursor: 'pointer',
            }}>
              <div style={{ fontSize: 11, color: 'var(--accent-gold)', fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>Sobre épico listo</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Coste: 100 monedas · Tienes 175</div>
            </div>
          </div>

          {/* Ranking + activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
            <div className="elev" style={{ padding: 14, borderRadius: 14 }}>
              <SectionHeader title="Top 5"/>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {RANKING.slice(0,5).map(r => <RankingRow key={r.name} r={r}/>)}
              </div>
            </div>
            <div className="elev" style={{ padding: 14, borderRadius: 14, flex: 1 }}>
              <SectionHeader title="Próximo logro"/>
              <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(251,191,36,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(251,191,36,0.4)',
                  color: 'var(--accent-gold)',
                  boxShadow: '0 0 16px -4px var(--accent-gold)',
                }}><Icon.Star size={22}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Maestro del Loop</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Resuelve 10 ejercicios de recursión</div>
                  <div style={{ height: 4, background: 'rgba(148,163,184,0.15)', borderRadius: 2 }}>
                    <div style={{ width: '70%', height: '100%',
                      background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                      borderRadius: 2, boxShadow: '0 0 8px var(--accent-gold)' }}/>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>7 / 10</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}

function SlimStat({ icon, label, value, delta, accent }) {
  return (
    <div className="elev lift" style={{
      padding: '12px 14px', borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 12,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${accent}15`, color: accent, border: `1px solid ${accent}30`,
        boxShadow: `0 0 12px -4px ${accent}`,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
        <div className="stat-num tabular" style={{ fontSize: 20, lineHeight: 1.1, color: 'var(--text-primary)' }}>{value}</div>
      </div>
      <div style={{ fontSize: 11, color: accent, fontWeight: 600 }}>{delta}</div>
    </div>
  );
}

function CompactEjRow({ e }) {
  return (
    <div className="lift" style={{
      padding: '10px 12px', borderRadius: 10,
      background: 'rgba(10,14,26,0.5)',
      border: '1px solid var(--border-card)',
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.titulo}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <DifficultyBadge dif={e.dificultad}/>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {Math.round(e.tiempo/60)} min · {e.modulo}</span>
        </div>
      </div>
      <button style={{
        width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px -4px var(--accent-primary)',
      }}><Icon.Play size={12}/></button>
    </div>
  );
}

function CartaRow({ c }) {
  const R = RARITY[c.rareza];
  return (
    <div className="lift" style={{
      padding: '8px 10px', borderRadius: 10,
      background: 'rgba(10,14,26,0.5)',
      border: `1px solid ${R.glow}`,
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
    }}>
      <div style={{ flex: '0 0 auto' }}>
        <CartaJugador carta={c} size={48} tilt={false} holo={false}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: R.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
          <span>{R.label}</span>
          <span>· <Icon.Sword size={9}/>{c.stats.dano}</span>
          <span><Icon.Heart size={9}/>{c.stats.salud}</span>
          <span><Icon.Mana size={9}/>{c.stats.mana}</span>
        </div>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{c.rareza === 'EPICA' ? 80 : c.rareza === 'RARA' ? 30 : 10}xp</span>
    </div>
  );
}

window.DashboardV1 = DashboardV1;
window.DashboardV2 = DashboardV2;
window.SectionHeader = SectionHeader;
window.RankingRow = RankingRow;
window.ACTIVE_EJERCICIOS = ACTIVE_EJERCICIOS;
window.RECENT_CARDS = RECENT_CARDS;
window.RANKING = RANKING;
