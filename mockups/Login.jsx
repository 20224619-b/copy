// Login screen — split with floating cards parallax.

const { useState: _u1, useEffect: _u2, useRef: _u3 } = React;

function LoginScreen() {
  const heroRef = React.useRef(null);
  const [mouse, setMouse] = React.useState({ x: 0.5, y: 0.5 });
  const onMove = (e) => {
    const r = heroRef.current.getBoundingClientRect();
    setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  };

  const cards = [
    { rareza: 'LEGENDARIA', theme: 'recur', nombre: 'Avatar del Recursor',
      stats: { dano: 9, salud: 8, mana: 6, danoHabilidad: 12 },
      habilidad: { nombre: 'Eco Infinito' }, descripcion: 'Invoca un eco que se invoca a sí mismo.',
      pos: { left: '12%', top: '14%', rot: -10, size: 200, depth: 1.0, delay: 0 } },
    { rareza: 'EPICA', theme: 'loop', nombre: 'Hechicero del Loop',
      stats: { dano: 6, salud: 5, mana: 3, danoHabilidad: 8 },
      habilidad: { nombre: 'Iteración Arcana' },
      pos: { left: '45%', top: '32%', rot: 6, size: 260, depth: 1.5, delay: 0.5 } },
    { rareza: 'RARA', theme: 'cond', nombre: 'Vidente del If',
      stats: { dano: 4, salud: 6, mana: 2, danoHabilidad: 5 },
      habilidad: { nombre: 'Ramificación' },
      pos: { left: '8%', top: '58%', rot: 8, size: 180, depth: 0.7, delay: 1.0 } },
    { rareza: 'COMUN', theme: 'list', nombre: 'Aprendiz de Listas',
      stats: { dano: 2, salud: 3, mana: 1, danoHabilidad: 3 },
      habilidad: { nombre: 'Indexar' },
      pos: { left: '54%', top: '64%', rot: -8, size: 175, depth: 0.5, delay: 1.5 } },
  ];

  return (
    <div className="cardly" style={{ display: 'flex' }}>
      <Background />

      {/* LEFT: form */}
      <div style={{
        flex: '0 0 46%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px 64px',
        position: 'relative', zIndex: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Logo size={36}/>
        </div>
        <div style={{ marginTop: 28, marginBottom: 36 }}>
          <h1 className="display" style={{
            fontSize: 44, lineHeight: 1.05, margin: 0, fontWeight: 800,
            background: 'linear-gradient(135deg, #fff 0%, #c4b5fd 60%, #67e8f9 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            letterSpacing: '0.01em',
          }}>Aprende programando.<br/>Gana cartas.<br/>Domina el código.</h1>
          <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.5, maxWidth: 420 }}>
            La arena épica donde tu siguiente <span style={{ color: 'var(--accent-cyan)' }}>for-loop</span> resuelto te entrega una carta legendaria.
          </p>
        </div>

        <div className="glass" style={{ padding: '28px 28px 26px', maxWidth: 440 }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: 'rgba(10,14,26,0.5)', borderRadius: 10, marginBottom: 22 }}>
            <button style={{
              flex: 1, padding: '8px 0', borderRadius: 7, border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
              color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              boxShadow: '0 4px 12px -4px var(--accent-primary)',
            }}>Iniciar sesión</button>
            <button style={{
              flex: 1, padding: '8px 0', borderRadius: 7, border: 'none',
              background: 'transparent', color: 'var(--text-secondary)', fontWeight: 500, fontSize: 13, cursor: 'pointer',
            }}>Crear cuenta</button>
          </div>

          <Field label="Email" value="aria.dev@cardly.io" type="email"/>
          <Field label="Contraseña" value="••••••••••••" type="password" trailing="◉"/>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 22, fontSize: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <span style={{
                width: 16, height: 16, borderRadius: 4, border: '1.5px solid var(--accent-primary)',
                background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}><Icon.Check size={10}/></span>
              Mantener sesión
            </label>
            <a style={{ color: 'var(--accent-cyan)', textDecoration: 'none', cursor: 'pointer' }}>¿Olvidaste tu hechizo?</a>
          </div>

          <button className="btn btn-primary shimmer" style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 15 }}>
            Entrar a la arena <Icon.ChevR size={14}/>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px', color: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-card)' }}/>
            O CONTINÚA CON
            <div style={{ flex: 1, height: 1, background: 'var(--border-card)' }}/>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {['GitHub', 'Google', 'Discord'].map(p => (
              <button key={p} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '10px 0', fontSize: 12 }}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 18 }}>
          <span>v2.4 · Arena cerrada beta</span>
          <span>•</span>
          <span>2,481 magos online</span>
        </div>
      </div>

      {/* RIGHT: hero arena with floating cards */}
      <div ref={heroRef} onMouseMove={onMove} style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: `
          radial-gradient(ellipse 60% 40% at 50% 20%, rgba(139,92,246,0.4), transparent 60%),
          radial-gradient(ellipse 50% 60% at 80% 80%, rgba(34,211,238,0.25), transparent 60%),
          linear-gradient(160deg, #1a1340 0%, #0a0e1a 60%)
        `,
        zIndex: 2,
      }}>
        {/* Glow grid */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.25,
        }}>
          {Array.from({length: 12}).map((_,i) => (
            <line key={'h'+i} x1="0" x2="100" y1={i * 8} y2={i * 8} stroke="#22d3ee" strokeWidth="0.05"/>
          ))}
          {Array.from({length: 12}).map((_,i) => (
            <line key={'v'+i} y1="0" y2="100" x1={i * 8} x2={i * 8} stroke="#22d3ee" strokeWidth="0.05"/>
          ))}
        </svg>

        <Particles count={40} />

        {/* Floating cards with parallax */}
        {cards.map((c, i) => {
          const dx = (mouse.x - 0.5) * 28 * c.pos.depth;
          const dy = (mouse.y - 0.5) * 22 * c.pos.depth;
          return (
            <div key={i} style={{
              position: 'absolute', left: c.pos.left, top: c.pos.top,
              transform: `translate(${dx}px, ${dy}px) rotate(${c.pos.rot}deg)`,
              transition: 'transform 0.4s var(--ease-out-expo)',
              animation: `float ${6 + i}s ease-in-out ${c.pos.delay}s infinite`,
              zIndex: Math.round(c.pos.depth * 10),
            }}>
              <CartaJugador carta={c} size={c.pos.size} tilt={false}/>
            </div>
          );
        })}

        {/* Floor glow */}
        <div style={{
          position: 'absolute', bottom: -200, left: '20%', right: '20%', height: 300,
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.7), transparent 70%)',
          filter: 'blur(40px)',
        }}/>

        {/* Tagline overlay */}
        <div style={{
          position: 'absolute', left: 40, bottom: 32,
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 11, letterSpacing: 0.3, color: 'rgba(196,181,253,0.5)',
          textTransform: 'uppercase',
        }}>
          ARENA · TEMPORADA 03 · "EL CÓDIGO ARCANO"
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, type = 'text', trailing }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 14px',
        background: 'rgba(10,14,26,0.6)',
        border: '1px solid var(--border-soft)',
        borderRadius: 9,
        boxShadow: 'inset 0 0 0 1px rgba(139,92,246,0.05), 0 0 0 3px transparent',
        transition: 'all .18s',
      }}>
        <input type={type} defaultValue={value} style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
        }}/>
        {trailing && <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>{trailing}</span>}
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
