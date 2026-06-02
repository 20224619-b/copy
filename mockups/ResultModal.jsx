// Result Modal — the epic card reveal moment (Pokemon TCG holographic)
// Shows: confetti → "¡CORRECTO!" → recompensas stagger → card flip with tilt

const REWARD_CARDS = {
  COMUN: { nombre: 'Aprendiz de Diccionarios', rareza: 'COMUN', theme: 'dict',
    stats: { dano: 2, salud: 3, mana: 1, danoHabilidad: 3 },
    habilidad: { nombre: 'Lookup' }, descripcion: 'Accede a un valor por su clave.' },
  EPICA: { nombre: 'Hechicero del Loop', rareza: 'EPICA', theme: 'loop',
    stats: { dano: 6, salud: 5, mana: 3, danoHabilidad: 8 },
    habilidad: { nombre: 'Iteración Arcana' }, descripcion: 'Repite un hechizo hasta que su condición se cumpla.' },
  LEGENDARIA: { nombre: 'Avatar del Recursor', rareza: 'LEGENDARIA', theme: 'recur',
    stats: { dano: 9, salud: 8, mana: 6, danoHabilidad: 12 },
    habilidad: { nombre: 'Eco Infinito' }, descripcion: 'Invoca un eco de sí mismo. Hasta que el stack lo permita.' },
};

function ConfettiBurst({ count = 60, color = '#fbbf24' }) {
  const pieces = React.useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 2,
      dur: 3 + Math.random() * 3,
      size: 4 + Math.random() * 6,
      rot: Math.random() * 360,
      color: [color, '#a78bfa', '#22d3ee', '#fff', '#fcd34d'][i % 5],
      shape: i % 3,
    })), [count, color]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
      {pieces.map((p, i) => (
        <span key={i} style={{
          position: 'absolute', top: -20,
          left: `${p.left}%`,
          width: p.size, height: p.shape === 1 ? p.size * 0.4 : p.size,
          background: p.color,
          borderRadius: p.shape === 2 ? '50%' : 2,
          transform: `rotate(${p.rot}deg)`,
          animation: `confettiFall ${p.dur}s linear ${p.delay}s infinite`,
          boxShadow: `0 0 6px ${p.color}80`,
        }}/>
      ))}
    </div>
  );
}

/* The full result modal — accepts a "stage" prop for different reveal states */
function ResultModal({
  variant = 'correct',         // 'correct' | 'incorrect'
  rareza = 'EPICA',            // for the card
  stage = 'revealed',          // 'flipping' | 'revealed' (controls card animation)
  showPoints = true,
}) {
  if (variant === 'incorrect') return <ResultModalIncorrect/>;

  const carta = REWARD_CARDS[rareza];
  const R = RARITY[rareza];

  return (
    <div className="cardly" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Background particles={false}/>
      {/* dim backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1 }}/>

      {/* radial glow behind card */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 50% 60% at 50% 60%, ${R.glow}, transparent 70%)`,
        zIndex: 2, opacity: 0.8,
      }}/>

      <ConfettiBurst color={R.color.startsWith('var') ? '#fbbf24' : R.color}/>

      <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 24, padding: 40, width: '100%', maxWidth: 900,
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div className="display" style={{
            fontSize: 64, fontWeight: 800, letterSpacing: 0.04, lineHeight: 1,
            background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #fef3c7 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            textShadow: '0 0 40px rgba(251,191,36,0.6)',
            filter: 'drop-shadow(0 4px 16px rgba(251,191,36,0.4))',
            animation: 'scaleIn .6s var(--ease-out-expo) both',
          }}>¡CORRECTO!</div>
          <div style={{ marginTop: 10, fontSize: 16, color: 'var(--text-secondary)' }}>
            Resuelto en <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>04:07</span> · primer intento
          </div>
        </div>

        {/* Reward row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40, marginTop: 12 }}>
          {/* Left: points + coins counters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end', paddingTop: 60 }}>
            <RewardPill icon={<Icon.Bolt size={20}/>} value="+80" label="puntos" color="#a78bfa" big/>
            <RewardPill icon={<Icon.Coin size={20}/>} value="+25" label="monedas" color="#fbbf24"/>
            <RewardPill icon={<Icon.Flame size={20}/>} value="13" label="días racha" color="#f97316" delta="+1"/>
          </div>

          {/* Center: the card */}
          <div style={{ position: 'relative' }}>
            {/* halo */}
            <div style={{
              position: 'absolute', inset: -40, borderRadius: '50%',
              background: `radial-gradient(ellipse, ${R.glow}, transparent 70%)`,
              filter: 'blur(20px)',
              animation: rareza === 'LEGENDARIA' ? 'legendaryPulse 2s ease-in-out infinite' : 'none',
            }}/>
            <div style={{ position: 'relative', animation: 'scaleIn .8s var(--ease-out-expo) .3s both' }}>
              {stage === 'flipping' ? (
                <CardFlipping size={260} rareza={rareza}/>
              ) : (
                <CartaJugador carta={carta} size={260}/>
              )}
            </div>
            {/* rune ring */}
            <RuneRing rareza={rareza}/>
          </div>

          {/* Right: card meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 60, maxWidth: 220 }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 999,
                background: `${R.color.startsWith('var') ? R.glow : R.color}22`,
                border: `1px solid ${R.glow}`,
                fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
                color: R.color,
                textShadow: `0 0 8px ${R.glow}`,
              }}>✦ {R.label}</div>
              <h2 className="display" style={{ marginTop: 10, marginBottom: 4, fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.15 }}>{carta.nombre}</h2>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{carta.descripcion}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <StatBar icon={<Icon.Sword size={12}/>} label="Daño" v={carta.stats.dano} max={10} color="#cbd5e1"/>
              <StatBar icon={<Icon.Heart size={12}/>} label="Salud" v={carta.stats.salud} max={10} color="#ef4444"/>
              <StatBar icon={<Icon.Mana size={12}/>} label="Maná" v={carta.stats.mana} max={10} color="#22d3ee"/>
              <StatBar icon={<Icon.Star size={12}/>} label="Habilidad" v={carta.stats.danoHabilidad} max={15} color="#fbbf24"/>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Nueva en tu colección · 35/120
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn btn-ghost" style={{ padding: '12px 22px' }}>Ver inventario</button>
          <button className="btn btn-primary shimmer" style={{ padding: '12px 28px' }}>
            Siguiente ejercicio <Icon.ChevR size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function CardFlipping({ size = 260, rareza = 'EPICA' }) {
  // Mid-flip pose — captured at ~70° rotation
  return (
    <div style={{ perspective: 1400, width: size, height: size * 1.4 }}>
      <div style={{
        width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: 'rotateY(-70deg)',
        position: 'relative',
        filter: 'drop-shadow(0 16px 40px rgba(139,92,246,0.7))',
      }}>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
          <CartaDorso size={size}/>
        </div>
      </div>
      {/* spark trail */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', width: 200, height: 200,
        transform: 'translate(-50%, -50%)',
        background: `radial-gradient(circle, ${RARITY[rareza].glow}, transparent 60%)`,
        animation: 'scaleIn .4s ease-out',
      }}/>
    </div>
  );
}

function RewardPill({ icon, value, label, color, delta, big }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: big ? '14px 20px' : '10px 16px',
      borderRadius: 14,
      background: `linear-gradient(135deg, ${color}25, ${color}05)`,
      border: `1px solid ${color}40`,
      boxShadow: `0 0 24px -8px ${color}, inset 0 1px 0 ${color}30`,
      backdropFilter: 'blur(10px)',
      minWidth: big ? 180 : 160,
      animation: 'scaleIn .5s var(--ease-out-expo) both',
    }}>
      <div style={{
        width: big ? 40 : 32, height: big ? 40 : 32, borderRadius: 10,
        background: `${color}25`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 12px -2px ${color}`,
      }}>{icon}</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
        <div className="stat-num tabular" style={{ fontSize: big ? 28 : 22, color: 'white', lineHeight: 1, textShadow: `0 0 12px ${color}80` }}>{value}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
          {label}
          {delta && <span style={{ color, fontWeight: 700 }}>{delta}</span>}
        </div>
      </div>
    </div>
  );
}

function StatBar({ icon, label, v, max, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ color, width: 16, display: 'flex' }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', minWidth: 60 }}>{label}</div>
      <div style={{ flex: 1, height: 6, background: 'rgba(148,163,184,0.12)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${(v / max) * 100}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 8px ${color}80`,
        }}/>
      </div>
      <div className="mono tabular" style={{ fontSize: 11, color, fontWeight: 700, minWidth: 24, textAlign: 'right' }}>{v}</div>
    </div>
  );
}

function RuneRing({ rareza }) {
  const R = RARITY[rareza];
  return (
    <svg viewBox="0 0 400 400" style={{
      position: 'absolute', inset: '-70px -70px',
      width: 'calc(100% + 140px)', height: 'calc(100% + 140px)',
      pointerEvents: 'none', opacity: 0.6,
    }}>
      <defs>
        <radialGradient id={`ring-${rareza}`}>
          <stop offset="60%" stopColor="transparent"/>
          <stop offset="100%" stopColor={R.color.startsWith('var') ? '#fbbf24' : R.color} stopOpacity="0.4"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="180" fill="none" stroke={R.color.startsWith('var') ? '#fbbf24' : R.color}
        strokeWidth="1" strokeDasharray="2 8" opacity="0.5"
        style={{ animation: 'spinSlow 30s linear infinite', transformOrigin: 'center' }}/>
      <circle cx="200" cy="200" r="160" fill="none" stroke={R.color.startsWith('var') ? '#fbbf24' : R.color}
        strokeWidth="0.6" strokeDasharray="1 12" opacity="0.4"
        style={{ animation: 'spinSlow 18s linear infinite reverse', transformOrigin: 'center' }}/>
    </svg>
  );
}

/* Incorrect variant */
function ResultModalIncorrect() {
  return (
    <div className="cardly" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Background particles={false}/>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(127, 0, 0, 0.25)', backdropFilter: 'blur(8px)' }}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(239,68,68,0.3), transparent 70%)',
      }}/>
      <div className="elev" style={{
        position: 'relative', zIndex: 3,
        padding: '40px 48px', borderRadius: 20,
        background: 'linear-gradient(160deg, #1a0f15, #0a0e1a)',
        border: '1px solid rgba(239,68,68,0.5)',
        boxShadow: '0 20px 60px -10px rgba(239,68,68,0.5)',
        textAlign: 'center', maxWidth: 480,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', boxShadow: '0 0 32px rgba(239,68,68,0.5)',
          color: '#fb7185', fontSize: 36, fontWeight: 700,
        }}>✕</div>
        <h2 className="display" style={{
          fontSize: 36, fontWeight: 700, margin: 0,
          background: 'linear-gradient(135deg, #fb7185, #f43f5e)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>Casi…</h2>
        <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.5 }}>
          Inténtalo de nuevo. Tu código pasó <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>2 de 3 casos</span>.
        </p>
        <div style={{
          marginTop: 18, padding: '14px 18px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 10, fontSize: 13, textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fb7185', fontWeight: 600, marginBottom: 6 }}>
            <Icon.Term size={12}/> Caso #3 falló
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
            Esperaba <span style={{ color: 'var(--accent-gold)' }}>12586269025</span>, recibí <span style={{ color: '#fb7185' }}>RecursionError</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
            💡 Hint: aumenta el límite de recursión o pásate a iteración con memoización.
          </div>
        </div>
        <div style={{
          marginTop: 16, padding: '10px 14px', borderRadius: 8,
          background: 'rgba(251,113,133,0.08)', fontSize: 12, color: 'var(--text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon.Flame size={14}/> Tu racha se reinició: <span className="mono" style={{ color: '#fb7185', textDecoration: 'line-through' }}>12 días</span> → <span className="mono" style={{ color: 'var(--text-muted)' }}>0</span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
          <button className="btn btn-ghost" style={{ padding: '11px 22px' }}>Salir</button>
          <button className="btn btn-primary shimmer" style={{ padding: '11px 28px' }}>Reintentar</button>
        </div>
      </div>
    </div>
  );
}

window.ResultModal = ResultModal;
window.REWARD_CARDS = REWARD_CARDS;
