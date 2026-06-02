// Resolver ejercicio — 2 variations
// V1: classic VS Code split 70/30 (editor / lateral)
// V2: focused — editor protagonista + casos plegables
// + Result modal with epic card reveal

const PY_INITIAL = `def fibonacci(n, memo={}):
    """Calcula F(n) con memoización."""
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
    return memo[n]

# Probar con los casos de prueba
n = int(input())
print(fibonacci(n))`;

const EJ_DETAIL = {
  id: 4, titulo: 'Fibonacci Recursivo', dif: 'MEDIO', lang: 'Python', tiempo: 15, modulo: 'Recursión',
  descripcion: `Implementa la función \`fibonacci(n)\` que devuelve el n-ésimo número de Fibonacci.

**Restricciones:**
- Debe usar **memoización** (no recursión naive)
- F(50) debe resolverse en menos de **1 segundo**
- No uses bibliotecas externas (functools.lru_cache permitido)

La sucesión empieza: 0, 1, 1, 2, 3, 5, 8, 13...`,
  casos: [
    { input: '10', output: '55' },
    { input: '20', output: '6765' },
    { input: '50', output: '12586269025' },
  ],
};

function Cronometro({ seconds, paused }) {
  // Color shifts: 0-3min green, 3-6min yellow, 6+ red
  const color = seconds < 180 ? '#10b981' : seconds < 360 ? '#fbbf24' : '#ef4444';
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', borderRadius: 999,
      background: 'rgba(10,14,26,0.7)',
      border: `1px solid ${color}40`,
      boxShadow: `0 0 12px -4px ${color}`,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: color,
        boxShadow: `0 0 8px ${color}`,
        animation: paused ? 'none' : 'pulseBorder 1.5s ease infinite',
      }}/>
      <span className="mono tabular" style={{
        fontSize: 18, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums',
        letterSpacing: 1,
      }}>{fmtTime(seconds)}</span>
    </div>
  );
}

/* ============ RESOLVER V1 — VS Code split ============ */
function ResolverV1({ showResult }) {
  const [tab, setTab] = React.useState('code');
  return (
    <div className="cardly" style={{ display: 'flex', flexDirection: 'column' }}>
      <Background particles={false}/>
      {/* topbar */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 24px', borderBottom: '1px solid var(--border-card)',
        background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(8px)',
        position: 'relative', zIndex: 3,
      }}>
        <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>← Salir</button>
        <div style={{ width: 1, height: 22, background: 'var(--border-card)' }}/>
        <Logo size={24}/>
        <div style={{ width: 1, height: 22, background: 'var(--border-card)' }}/>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Recursión</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <DifficultyBadge dif={EJ_DETAIL.dif}/>
          </div>
          <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{EJ_DETAIL.titulo}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Cronometro seconds={134}/>
          <button className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }}>⏸ Pausar</button>
        </div>
        <div style={{ width: 1, height: 22, background: 'var(--border-card)' }}/>
        <ResourcePill icon={<Icon.Bolt size={13}/>} value={2840} label="PTS" color="#a78bfa"/>
        <ResourcePill icon={<Icon.Flame size={13}/>} value={12} label="DÍAS" color="#f97316"/>
      </header>

      {/* main */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', flex: 1, minHeight: 0, position: 'relative', zIndex: 2 }}>
        {/* center: tabs + editor */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, padding: '14px 0 0 18px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12 }}>
            <Tab active={tab === 'code'} onClick={() => setTab('code')} icon={<Icon.Code size={14}/>}>Código</Tab>
            <Tab active={tab === 'out'} onClick={() => setTab('out')} icon={<Icon.Term size={14}/>}>Outputs</Tab>
            <div style={{ flex: 1, height: 1, background: 'var(--border-card)', alignSelf: 'flex-end', marginBottom: 0 }}/>
            <div style={{ padding: '0 10px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              UTF-8 · LF · Python 3.11
            </div>
          </div>

          {/* Editor area */}
          <div style={{ flex: 1, minHeight: 0, paddingRight: 18, paddingBottom: 16 }}>
            {tab === 'code' ? (
              <CodeEditor initial={PY_INITIAL} height="100%" language="python"/>
            ) : (
              <OutputsTab/>
            )}
          </div>
        </div>

        {/* right: panel */}
        <aside style={{
          padding: 16, display: 'flex', flexDirection: 'column', gap: 14,
          borderLeft: '1px solid var(--border-card)',
          background: 'rgba(17,23,38,0.7)', minHeight: 0,
          overflow: 'hidden',
        }}>
          <div className="elev" style={{ padding: 14, borderRadius: 12 }}>
            <SectionHeader title="Enunciado"/>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: 10, marginBottom: 0 }}>
              Implementa <span className="mono" style={{ color: 'var(--accent-cyan)' }}>fibonacci(n)</span> con memoización.
              F(50) debe resolverse en <strong style={{ color: 'var(--accent-gold)' }}>{'<'} 1 segundo</strong>.
            </p>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <DifficultyBadge dif={EJ_DETAIL.dif}/>
              <LangBadge/>
              <span className="chip" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-card)' }}>15 min</span>
            </div>
          </div>

          <div className="elev" style={{ padding: 14, borderRadius: 12, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader title="Casos de prueba" right={<span style={{ fontSize: 11, color: 'var(--text-muted)' }}>3 casos</span>}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, overflow: 'hidden' }}>
              {EJ_DETAIL.casos.map((c, i) => <CasoMini key={i} idx={i} c={c}/>)}
            </div>
          </div>

          <div className="elev" style={{
            padding: 14, borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(245,158,11,0.05))',
            border: '1px solid rgba(168,85,247,0.35)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon.Card size={18}/>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Recompensa posible</div>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
              <CartaJugador carta={{ ...RECENT_CARDS[0], rareza: 'EPICA' }} size={64} tilt={false} holo={false}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--rar-epica)', fontWeight: 600 }}>Carta Épica · 80% chance</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>+80 pts · +25 monedas</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* footer */}
      <footer style={{
        padding: '12px 24px', borderTop: '1px solid var(--border-card)',
        background: 'rgba(10,14,26,0.85)',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', zIndex: 3,
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          12 líneas · cursor 9:23 · autosave ●
        </div>
        <div style={{ flex: 1 }}/>
        <button className="btn btn-ghost" style={{ padding: '10px 18px' }}>▷ Ejecutar local</button>
        <button onClick={showResult} className="btn btn-primary shimmer" style={{ padding: '11px 28px', fontSize: 14 }}>
          🚀 ENVIAR
        </button>
      </footer>
    </div>
  );
}

function Tab({ active, onClick, icon, children }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 18px', border: 'none', background: 'transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      fontSize: 13, fontWeight: 600, cursor: 'pointer', position: 'relative',
      fontFamily: 'inherit',
    }}>
      {icon}{children}
      {active && <div style={{
        position: 'absolute', bottom: -1, left: 12, right: 12, height: 2,
        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-cyan))',
        borderRadius: 2, boxShadow: '0 0 8px var(--accent-primary)',
      }}/>}
    </button>
  );
}

function OutputsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'hidden' }}>
      {EJ_DETAIL.casos.map((c, i) => (
        <div key={i} className="elev" style={{ padding: 14, borderRadius: 10, borderLeft: '2px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700, padding: '2px 8px', background: 'rgba(34,211,238,0.1)', borderRadius: 4 }}>CASO #{i+1}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>input:</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--accent-success)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 4 }}>{c.input}</span>
          </div>
          <div style={{
            padding: '10px 14px', background: '#0a0e1a',
            border: '1px solid var(--border-card)', borderRadius: 8,
            fontFamily: 'var(--font-mono)', fontSize: 13,
          }}>
            <input defaultValue={i === 2 ? '' : c.output} placeholder={`Output esperado: ${c.output}`} style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--accent-gold)', width: '100%', fontFamily: 'inherit', fontSize: 'inherit',
            }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function CasoMini({ idx, c }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 8,
      background: 'rgba(10,14,26,0.5)', border: '1px solid var(--border-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700, padding: '2px 6px', background: 'rgba(34,211,238,0.1)', borderRadius: 4 }}>#{idx+1}</span>
        <Icon.ChevR size={10} style={{ color: 'var(--text-muted)' }}/>
      </div>
      <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>input</div>
          <div style={{ color: 'var(--accent-success)', padding: '4px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: 4 }}>{c.input}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>output</div>
          <div style={{ color: 'var(--accent-gold)', padding: '4px 8px', background: 'rgba(251,191,36,0.1)', borderRadius: 4 }}>{c.output}</div>
        </div>
      </div>
    </div>
  );
}

/* ============ RESOLVER V2 — Focused mode ============ */
function ResolverV2({ showResult }) {
  return (
    <div className="cardly" style={{ display: 'flex', flexDirection: 'column' }}>
      <Background particles={false}/>

      {/* Minimal top */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 32px', position: 'relative', zIndex: 3,
        background: 'rgba(10,14,26,0.5)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-card)',
      }}>
        <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>← Volver</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{EJ_DETAIL.titulo}</h1>
          <DifficultyBadge dif={EJ_DETAIL.dif}/>
          <LangBadge/>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {EJ_DETAIL.modulo}</span>
        </div>
        <Cronometro seconds={247}/>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-card)',
            background: 'rgba(26,34,56,0.6)', color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>↺</button>
          <button style={{
            width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-card)',
            background: 'rgba(26,34,56,0.6)', color: 'var(--text-secondary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>⛶</button>
        </div>
      </header>

      {/* Main: 3-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 320px', flex: 1, minHeight: 0, position: 'relative', zIndex: 2, gap: 0 }}>

        {/* Left: enunciado */}
        <aside style={{ padding: '20px 18px', overflow: 'hidden', borderRight: '1px solid var(--border-card)', background: 'rgba(17,23,38,0.5)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Enunciado</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Implementa la función <span className="mono" style={{ color: 'var(--accent-cyan)' }}>fibonacci(n)</span> que devuelve el n-ésimo número de Fibonacci.
          </p>
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>⚡ Restricciones</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <li>Memoización obligatoria</li>
              <li>F(50) en menos de 1 segundo</li>
              <li>Sin bibliotecas externas</li>
            </ul>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Recompensa</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <CartaJugador carta={{ ...RECENT_CARDS[0], rareza: 'EPICA' }} size={72} tilt={false} holo={false}/>
              <div>
                <div style={{ fontSize: 12, color: 'var(--rar-epica)', fontWeight: 600 }}>Carta épica</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>+ 80 pts</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>+ 25 monedas</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: editor */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>~/cardly/</span>fibonacci.py
            </div>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-success)', boxShadow: '0 0 6px var(--accent-success)' }}/>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>guardado</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <CodeEditor initial={PY_INITIAL} height="100%"/>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
            <button className="btn btn-ghost" style={{ padding: '9px 14px', fontSize: 12 }}>▷ Probar</button>
            <button className="btn btn-ghost" style={{ padding: '9px 14px', fontSize: 12 }}>⌥ Hint</button>
            <div style={{ flex: 1 }}/>
            <button onClick={showResult} className="btn btn-primary shimmer" style={{ padding: '12px 32px', fontSize: 14 }}>
              🚀 ENVIAR SOLUCIÓN
            </button>
          </div>
        </div>

        {/* Right: outputs */}
        <aside style={{ padding: '20px 18px', overflow: 'hidden', borderLeft: '1px solid var(--border-card)', background: 'rgba(17,23,38,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>Casos de prueba</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: 4,
                  background: 'rgba(34,211,238,0.1)',
                  border: '1px solid rgba(34,211,238,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: 'var(--accent-cyan)', fontWeight: 700,
                }}>{i+1}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EJ_DETAIL.casos.map((c, i) => (
              <div key={i} className="elev" style={{
                padding: 12, borderRadius: 10,
              }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: 0.6, marginBottom: 6 }}>
                  CASO {String(i+1).padStart(2,'0')}
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>input</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--accent-success)', padding: '4px 8px', background: 'rgba(16,185,129,0.08)', borderRadius: 4, marginTop: 3, marginBottom: 8 }}>{c.input}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>esperado</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--accent-gold)', padding: '4px 8px', background: 'rgba(251,191,36,0.08)', borderRadius: 4, marginTop: 3 }}>{c.output}</div>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}

window.ResolverV1 = ResolverV1;
window.ResolverV2 = ResolverV2;
window.Cronometro = Cronometro;
window.EJ_DETAIL = EJ_DETAIL;
window.PY_INITIAL = PY_INITIAL;
