// Shared Cardly components — used by every screen.
// All components are exported to window so other Babel scripts can use them.

const { useState, useEffect, useRef, useMemo, useLayoutEffect } = React;

/* ============ ICONS (small inline SVGs with optional glow) ============ */
const Icon = {
  Coin: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" {...p}>
      <circle cx="12" cy="12" r="9" fill="url(#g-coin)" stroke="#f59e0b" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="6" fill="none" stroke="#fef3c7" strokeWidth="0.8" opacity="0.7"/>
      <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="800" fill="#78350f" fontFamily="Orbitron">C</text>
      <defs><radialGradient id="g-coin"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#f59e0b"/></radialGradient></defs>
    </svg>
  ),
  Bolt: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" {...p}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="url(#g-bolt)" stroke="#8b5cf6" strokeWidth="1"/>
      <defs><linearGradient id="g-bolt" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c4b5fd"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
    </svg>
  ),
  Flame: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" {...p}>
      <path d="M12 2c0 4-5 6-5 11a5 5 0 0 0 10 0c0-3-2-4-2-7 0 2-3 2-3-4z" fill="url(#g-flame)"/>
      <defs><linearGradient id="g-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fde047"/><stop offset="60%" stopColor="#f97316"/><stop offset="100%" stopColor="#dc2626"/></linearGradient></defs>
    </svg>
  ),
  Card: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" {...p}>
      <rect x="4" y="3" width="13" height="18" rx="2" fill="#1a2238" stroke="#8b5cf6" strokeWidth="1.4"/>
      <rect x="7" y="6" width="7" height="9" rx="1" fill="url(#g-card)" opacity="0.8"/>
      <defs><linearGradient id="g-card" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#22d3ee"/></linearGradient></defs>
    </svg>
  ),
  Heart: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="#ef4444" {...p}>
      <path d="M12 21s-7-4.5-9.5-9.5C1 7 4 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3 0 6 3 4.5 7.5C19 16.5 12 21 12 21z"/>
    </svg>
  ),
  Mana: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" {...p}>
      <path d="M12 3 5 13c0 4 3 7 7 7s7-3 7-7L12 3z" fill="url(#g-mana)" stroke="#22d3ee" strokeWidth="1"/>
      <defs><linearGradient id="g-mana" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#67e8f9"/><stop offset="100%" stopColor="#0891b2"/></linearGradient></defs>
    </svg>
  ),
  Sword: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" {...p}>
      <path d="m14 2 8 8-3 1-1 3-8-8 4-4z" fill="#cbd5e1" stroke="#94a3b8"/>
      <path d="m11 6-7 7 3 3 7-7" stroke="#94a3b8" strokeWidth="1.4"/>
      <rect x="2" y="18" width="6" height="3" fill="#475569" rx="0.5"/>
    </svg>
  ),
  Star: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="currentColor" {...p}>
      <path d="m12 2 2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17l-6.1 3.5 1.5-6.8L2.2 9l6.9-.7z"/>
    </svg>
  ),
  Play: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="currentColor" {...p}>
      <path d="M7 4v16l13-8z"/>
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m4 12 5 5 11-12"/>
    </svg>
  ),
  ChevR: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m9 6 6 6-6 6"/>
    </svg>
  ),
  Term: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <path d="m7 9 3 3-3 3M13 15h4"/>
    </svg>
  ),
  Code: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||16} height={p.size||16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>
    </svg>
  ),
  Python: (p) => (
    <svg viewBox="0 0 24 24" width={p.size||14} height={p.size||14} {...p}>
      <path d="M12 2c-3 0-5 1-5 3v3h5v1H4c-2 0-3 2-3 5s1 5 3 5h2v-2c0-2 1-3 3-3h6c2 0 3-1 3-3V5c0-2-2-3-6-3zM8 4.5a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" fill="#3776ab"/>
      <path d="M12 22c3 0 5-1 5-3v-3h-5v-1h8c2 0 3-2 3-5s-1-5-3-5h-2v2c0 2-1 3-3 3H9c-2 0-3 1-3 3v6c0 2 2 3 6 3zm4-2.5a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z" fill="#ffd43b"/>
    </svg>
  ),
};

/* ============ FX ============ */
function Particles({ count = 24, color }) {
  const seeds = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: Math.random() * 100,
      delay: -Math.random() * 12,
      dur: 8 + Math.random() * 10,
      size: 1 + Math.random() * 2.5,
      drift: (Math.random() - 0.5) * 60,
    })), [count]);
  return (
    <div className="cardly-particles" aria-hidden>
      {seeds.map((s, i) => (
        <span key={i} style={{
          left: `${s.left}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.dur}s`,
          background: color || undefined,
          boxShadow: color ? `0 0 10px ${color}` : undefined,
        }} />
      ))}
    </div>
  );
}

function Background({ particles = true, particleColor }) {
  return (
    <>
      <div className="cardly-bg" />
      {particles && <Particles color={particleColor} />}
    </>
  );
}

/* ============ APP SHELL (Sidebar + Topbar) ============ */
function AppShell({ active = 'home', user, children, hideSidebar }) {
  return (
    <div className="cardly" style={{ display: 'flex' }}>
      <Background />
      {!hideSidebar && <Sidebar active={active} />}
      <div style={{ flex: 1, position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar user={user} />
        <div style={{ flex: 1, overflow: 'hidden', padding: '20px 28px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ active }) {
  const items = [
    { id: 'home', label: 'Dashboard', icon: '⌂' },
    { id: 'ejercicios', label: 'Ejercicios', icon: '⚔' },
    { id: 'modulos', label: 'Módulos', icon: '◇' },
    { id: 'inventario', label: 'Inventario', icon: '✦' },
    { id: 'ranking', label: 'Ranking', icon: '♛' },
  ];
  return (
    <aside style={{
      width: 220, padding: '24px 16px',
      background: 'linear-gradient(180deg, rgba(17,23,38,0.95), rgba(10,14,26,0.95))',
      borderRight: '1px solid var(--border-soft)',
      position: 'relative', zIndex: 3,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <Logo />
      <div style={{ height: 24 }} />
      {items.map(it => (
        <div key={it.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 14px', borderRadius: 10,
          background: active === it.id
            ? 'linear-gradient(90deg, rgba(139,92,246,0.18), rgba(34,211,238,0.06))'
            : 'transparent',
          border: active === it.id ? '1px solid rgba(139,92,246,0.35)' : '1px solid transparent',
          color: active === it.id ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
          position: 'relative',
        }}>
          <span style={{
            display: 'inline-block', width: 22, textAlign: 'center',
            fontSize: 16, color: active === it.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
          }}>{it.icon}</span>
          {it.label}
          {active === it.id && (
            <span style={{
              position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
              background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-cyan))',
              borderRadius: 2, boxShadow: '0 0 12px var(--accent-primary)',
            }}/>
          )}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div className="elev" style={{ padding: '12px 14px', borderRadius: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>Próxima recompensa</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>3 ejercicios para sobre épico</div>
        <div style={{ height: 6, background: 'rgba(148,163,184,0.15)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            width: '60%', height: '100%',
            background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-cyan))',
            boxShadow: '0 0 12px var(--accent-primary)',
          }}/>
        </div>
      </div>
    </aside>
  );
}

function Logo({ size = 28 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
      <div style={{
        width: size, height: size, borderRadius: 8,
        background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 20px -4px var(--accent-primary)',
        position: 'relative',
      }}>
        <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="white">
          <rect x="5" y="3" width="10" height="16" rx="2" transform="rotate(-12 10 11)" opacity="0.7"/>
          <rect x="9" y="5" width="10" height="16" rx="2" transform="rotate(8 14 13)" fill="white"/>
        </svg>
      </div>
      <div className="display" style={{ fontSize: 18, fontWeight: 800, letterSpacing: 0.04 }}>CARDLY</div>
    </div>
  );
}

function Topbar({ user = { username: 'aria_dev', puntos: 2840, monedas: 175, racha: 12 } }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 28px',
      borderBottom: '1px solid var(--border-card)',
      position: 'relative', zIndex: 2,
      background: 'rgba(10,14,26,0.6)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(26,34,56,0.7)',
        borderRadius: 10, padding: '7px 14px',
        border: '1px solid var(--border-card)',
        minWidth: 320, color: 'var(--text-muted)', fontSize: 13,
      }}>
        <span style={{ opacity: 0.6 }}>⌕</span>
        <span>Buscar ejercicios, cartas, módulos…</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.5 }} className="mono">⌘K</span>
      </div>
      <div style={{ flex: 1 }} />
      <ResourcePill icon={<Icon.Bolt size={14}/>} value={user.puntos} label="PTS" color="#a78bfa" />
      <ResourcePill icon={<Icon.Coin size={14}/>} value={user.monedas} label="MON" color="#fbbf24" />
      <ResourcePill icon={<Icon.Flame size={14}/>} value={user.racha} label="DÍAS" color="#f97316" />
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: 14,
        border: '2px solid rgba(139,92,246,0.5)',
        boxShadow: '0 0 16px -4px var(--accent-primary)',
      }}>{user.username.slice(0,2).toUpperCase()}</div>
    </header>
  );
}

function ResourcePill({ icon, value, label, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 12px', borderRadius: 999,
      background: 'rgba(26,34,56,0.6)',
      border: '1px solid var(--border-card)',
      boxShadow: `inset 0 0 0 1px ${color}10`,
    }}>
      {icon}
      <span className="stat-num tabular" style={{ fontSize: 14, color: 'var(--text-primary)' }}>
        {value.toLocaleString()}
      </span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

/* ============ STAT CARD ============ */
function StatCard({ icon, label, value, accent, sparkline, sub }) {
  return (
    <div className="elev lift" style={{
      padding: '18px 20px', borderRadius: 16,
      position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg, ${accent}10, transparent 60%), var(--bg-elevated)`,
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: `radial-gradient(circle, ${accent}22, transparent 70%)`,
        filter: 'blur(8px)',
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${accent}15`,
          border: `1px solid ${accent}30`,
          color: accent,
          boxShadow: `0 0 16px -6px ${accent}`,
        }}>{icon}</div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-muted)' }}>{label}</div>
      </div>
      <div className="stat-num tabular" style={{ fontSize: 36, lineHeight: 1, color: 'var(--text-primary)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {sub && <div style={{ fontSize: 12, color: accent, marginTop: 6, fontWeight: 500 }}>{sub}</div>}
      {sparkline && <Sparkline data={sparkline} color={accent} />}
    </div>
  );
}

function Sparkline({ data, color, h = 28 }) {
  const w = 100;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4) - 2}`).join(' ');
  const area = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: h, marginTop: 10, opacity: 0.9 }}>
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${color})`}/>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ============ CARTAS ============ */
const RARITY = {
  COMUN: {
    label: 'Común', color: 'var(--rar-comun)', glow: 'rgba(148,163,184,0.4)',
    grad: 'linear-gradient(135deg, #475569, #1e293b)',
    holo: 'linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
  },
  RARA: {
    label: 'Rara', color: 'var(--rar-rara)', glow: 'rgba(59,130,246,0.5)',
    grad: 'linear-gradient(135deg, #3b82f6, #1e3a8a)',
    holo: 'linear-gradient(125deg, transparent 20%, rgba(96,165,250,0.5) 45%, rgba(255,255,255,0.3) 55%, transparent 80%)',
  },
  EPICA: {
    label: 'Épica', color: 'var(--rar-epica)', glow: 'rgba(168,85,247,0.7)',
    grad: 'linear-gradient(135deg, #a855f7, #6b21a8)',
    holo: 'linear-gradient(125deg, transparent 10%, rgba(236,72,153,0.5) 35%, rgba(34,211,238,0.5) 55%, transparent 80%)',
  },
  LEGENDARIA: {
    label: 'Legendaria', color: 'var(--rar-legendaria)', glow: 'rgba(245,158,11,0.85)',
    grad: 'linear-gradient(135deg, #fbbf24, #b45309)',
    holo: 'linear-gradient(125deg, transparent 10%, rgba(251,191,36,0.7) 35%, rgba(255,255,255,0.5) 50%, rgba(167,139,250,0.6) 65%, transparent 90%)',
  },
};

// Card art: stylized SVG illustration based on the card's theme.
function CardArt({ theme = 'loop', tint = '#a855f7' }) {
  // Each "theme" is a tiny iconographic illustration — magical-tech vibes.
  const arts = {
    loop: ( // Ouroboros of code — recursion
      <g>
        <circle cx="100" cy="100" r="56" fill="none" stroke={tint} strokeWidth="3" strokeDasharray="6 4" opacity="0.6"/>
        <circle cx="100" cy="100" r="38" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5"/>
        <path d="M64 100a36 36 0 1 0 36-36" fill="none" stroke={tint} strokeWidth="5" strokeLinecap="round"/>
        <path d="m95 60 5 5 5-5" fill="none" stroke={tint} strokeWidth="3" strokeLinecap="round"/>
        <text x="100" y="108" textAnchor="middle" fill="white" fontFamily="JetBrains Mono" fontSize="22" fontWeight="700" opacity="0.85">for</text>
      </g>
    ),
    list: ( // Stacked sigils
      <g>
        <rect x="60" y="58" width="80" height="14" rx="3" fill={tint} opacity="0.4"/>
        <rect x="60" y="78" width="80" height="14" rx="3" fill={tint} opacity="0.6"/>
        <rect x="60" y="98" width="80" height="14" rx="3" fill={tint} opacity="0.85"/>
        <rect x="60" y="118" width="80" height="14" rx="3" fill={tint}/>
        <circle cx="70" cy="65" r="3" fill="white"/>
        <circle cx="70" cy="85" r="3" fill="white"/>
        <circle cx="70" cy="105" r="3" fill="white"/>
        <circle cx="70" cy="125" r="3" fill="white"/>
      </g>
    ),
    cond: ( // Branching path
      <g>
        <path d="M100 50v30M100 80l-30 30M100 80l30 30M70 110v30M130 110v30" stroke={tint} strokeWidth="3" strokeLinecap="round" fill="none"/>
        <circle cx="100" cy="50" r="6" fill="white"/>
        <circle cx="100" cy="80" r="8" fill={tint}/>
        <text x="100" y="84" textAnchor="middle" fill="white" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">if</text>
        <circle cx="70" cy="140" r="6" fill="white"/>
        <circle cx="130" cy="140" r="6" fill="white"/>
      </g>
    ),
    func: ( // Function with brace flourish
      <g>
        <path d="M70 70c-6 0-10 4-10 10v10c0 6-4 10-10 10 6 0 10 4 10 10v10c0 6 4 10 10 10" stroke={tint} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M130 70c6 0 10 4 10 10v10c0 6 4 10 10 10-6 0-10 4-10 10v10c0 6-4 10-10 10" stroke={tint} strokeWidth="3" fill="none" strokeLinecap="round"/>
        <text x="100" y="110" textAnchor="middle" fill="white" fontFamily="JetBrains Mono" fontSize="22" fontWeight="700">def</text>
        <circle cx="100" cy="80" r="3" fill={tint}/>
      </g>
    ),
    recur: ( // Nested squares — recursion
      <g>
        {[0,1,2,3,4].map(i => (
          <rect key={i} x={50 + i*8} y={50 + i*8} width={100 - i*16} height={100 - i*16} rx="4"
            fill="none" stroke={tint} strokeWidth={2 - i*0.2} opacity={1 - i*0.15}/>
        ))}
        <circle cx="100" cy="100" r="6" fill={tint}/>
      </g>
    ),
    dict: ( // Key-value sigil
      <g>
        <rect x="55" y="55" width="90" height="90" rx="8" fill="none" stroke={tint} strokeWidth="2.5" opacity="0.7"/>
        <text x="75" y="95" fill="white" fontFamily="JetBrains Mono" fontSize="18" fontWeight="700">{'{'}</text>
        <circle cx="100" cy="92" r="3" fill={tint}/>
        <text x="115" y="95" fill="white" fontFamily="JetBrains Mono" fontSize="18" fontWeight="700">{'}'}</text>
        <text x="100" y="125" textAnchor="middle" fill={tint} fontFamily="JetBrains Mono" fontSize="11" opacity="0.7">key:val</text>
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <radialGradient id={`bg-${theme}`} cx="50%" cy="40%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={tint} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#bg-${theme})`}/>
      {arts[theme] || arts.loop}
    </svg>
  );
}

/* ============ CARTA JUGADOR (Pokemon TCG holographic) ============ */
function CartaJugador({
  carta = { nombre: 'Hechicero del Loop', rareza: 'EPICA', theme: 'loop',
            stats: { dano: 6, salud: 5, mana: 3, danoHabilidad: 8 },
            habilidad: { nombre: 'Iteración Arcana' },
            descripcion: 'Repite un hechizo hasta que su condición se cumpla.' },
  size = 280, // base width in px
  holo = true, // holographic shimmer
  tilt = true, // 3D tilt on hover
  static_, // disables transitions (for screenshot)
}) {
  const R = RARITY[carta.rareza] || RARITY.COMUN;
  const ratio = 1.4;
  const w = size, h = size * ratio;
  const ref = useRef(null);
  const [t, setT] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  const onMove = (e) => {
    if (!tilt || static_) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setT({
      rx: (0.5 - y) * 14,
      ry: (x - 0.5) * 14,
      mx: x * 100,
      my: y * 100,
    });
  };
  const onLeave = () => setT({ rx: 0, ry: 0, mx: 50, my: 50 });

  const tint = R.color.startsWith('var') ? undefined : R.color;
  const themeTint = {
    COMUN: '#94a3b8', RARA: '#60a5fa', EPICA: '#c084fc', LEGENDARIA: '#fbbf24',
  }[carta.rareza] || '#a855f7';

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{
        width: w, height: h, position: 'relative',
        perspective: 1200,
        cursor: tilt ? 'pointer' : 'default',
      }}>
      <div style={{
        width: '100%', height: '100%',
        borderRadius: 18,
        transformStyle: 'preserve-3d',
        transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
        transition: static_ ? 'none' : 'transform .25s var(--ease-out-expo)',
        position: 'relative',
        boxShadow: `0 18px 50px -10px ${R.glow}, 0 0 0 1px ${R.glow}`,
      }}>
        {/* Outer frame */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: R.grad,
          padding: 3,
        }}>
          {/* Inner panel */}
          <div style={{
            width: '100%', height: '100%',
            borderRadius: 16,
            background: 'linear-gradient(160deg, #1a2238 0%, #0a0e1a 100%)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Top bar: rarity + mana */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px',
              borderBottom: `1px solid ${R.glow}`,
              background: `linear-gradient(180deg, ${R.glow}, transparent)`,
            }}>
              <div style={{
                fontSize: w * 0.04, fontFamily: 'var(--font-display)', fontWeight: 700,
                color: R.color, letterSpacing: 0.06, textTransform: 'uppercase',
                textShadow: `0 0 8px ${R.glow}`,
              }}>{R.label}</div>
              <div style={{
                width: w * 0.13, height: w * 0.13, borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #67e8f9, #0891b2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: w * 0.07,
                boxShadow: '0 0 12px rgba(34,211,238,0.6), inset 0 -2px 4px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.3)',
              }}>{carta.stats?.mana ?? 0}</div>
            </div>

            {/* Art area */}
            <div style={{
              margin: '12px 14px 6px',
              flex: 1, position: 'relative',
              borderRadius: 10, overflow: 'hidden',
              border: `1px solid ${R.glow}`,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
            }}>
              <CardArt theme={carta.theme || 'loop'} tint={themeTint} />
              {/* Holographic foil overlay */}
              {holo && (
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: R.holo,
                  mixBlendMode: 'overlay',
                  opacity: 0.7,
                  transform: `translateX(${(t.mx - 50) * 0.4}%)`,
                  transition: static_ ? 'none' : 'transform .15s linear',
                }}/>
              )}
              {/* Highlight reflection following cursor */}
              {tilt && (
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: `radial-gradient(circle at ${t.mx}% ${t.my}%, rgba(255,255,255,0.25), transparent 40%)`,
                  mixBlendMode: 'soft-light',
                }}/>
              )}
            </div>

            {/* Name */}
            <div style={{
              padding: '4px 14px',
              fontFamily: 'var(--font-display)',
              fontSize: w * 0.065,
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              letterSpacing: 0.02,
              textShadow: `0 0 12px ${R.glow}`,
            }}>{carta.nombre}</div>

            {/* Ability */}
            {carta.habilidad && (
              <div style={{
                margin: '4px 14px 8px',
                padding: '8px 10px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.35)',
                border: `1px solid ${R.glow}`,
                fontSize: w * 0.04,
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                textAlign: 'center',
              }}>
                <span style={{ color: R.color, fontStyle: 'normal', fontWeight: 600 }}>✦ {carta.habilidad.nombre}</span>
                {carta.descripcion && <div style={{ marginTop: 4, fontSize: w * 0.035, lineHeight: 1.35 }}>{carta.descripcion}</div>}
              </div>
            )}

            {/* Stats footer */}
            {carta.stats && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '10px 14px',
                borderTop: `1px solid ${R.glow}`,
                background: `linear-gradient(0deg, ${R.glow}, transparent)`,
                gap: 6,
              }}>
                <StatPill icon={<Icon.Sword size={w*0.05}/>} v={carta.stats.dano} c="#cbd5e1" w={w}/>
                <StatPill icon={<Icon.Heart size={w*0.05}/>} v={carta.stats.salud} c="#ef4444" w={w}/>
                <StatPill icon={<Icon.Star size={w*0.05}/>} v={carta.stats.danoHabilidad} c="#fbbf24" w={w}/>
              </div>
            )}

            {/* Legendary shimmer overlay */}
            {carta.rareza === 'LEGENDARIA' && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)',
                animation: 'legendarySweep 3.5s linear infinite',
                mixBlendMode: 'screen',
              }}/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function StatPill({ icon, v, c, w }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
      padding: '6px 0', borderRadius: 6,
      background: 'rgba(0,0,0,0.45)',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: w * 0.055,
      color: c,
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      {icon}{v}
    </div>
  );
}

/* Card back — for the flip reveal */
function CartaDorso({ size = 280 }) {
  const w = size, h = size * 1.4;
  return (
    <div style={{
      width: w, height: h, borderRadius: 18,
      background: 'linear-gradient(135deg, #1e1b4b, #0c0a1f)',
      border: '3px solid',
      borderImage: 'linear-gradient(135deg, #8b5cf6, #22d3ee) 1',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 18px 50px -10px rgba(139,92,246,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Concentric runes */}
      <svg viewBox="0 0 200 280" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="dorso-g" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
        </defs>
        <rect width="200" height="280" fill="url(#dorso-g)"/>
        {[60, 80, 100, 120].map((r, i) => (
          <circle key={r} cx="100" cy="140" r={r} fill="none"
            stroke={i % 2 ? '#22d3ee' : '#8b5cf6'} strokeWidth="1" opacity="0.4"
            strokeDasharray={i === 1 ? '4 6' : i === 3 ? '2 4' : 'none'}/>
        ))}
        <g opacity="0.85">
          <rect x="80" y="115" width="20" height="50" rx="2" fill="none" stroke="#a78bfa" strokeWidth="2" transform="rotate(-10 90 140)"/>
          <rect x="100" y="115" width="20" height="50" rx="2" fill="none" stroke="#22d3ee" strokeWidth="2" transform="rotate(10 110 140)"/>
        </g>
      </svg>
      <div className="display" style={{
        fontSize: w * 0.13, fontWeight: 800, letterSpacing: 0.08,
        color: 'transparent',
        background: 'linear-gradient(135deg, #c4b5fd, #67e8f9)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        textShadow: '0 0 20px rgba(139,92,246,0.5)',
        position: 'relative', zIndex: 2,
      }}>CARDLY</div>
    </div>
  );
}

/* ============ DIFFICULTY/LANG BADGES ============ */
function DifficultyBadge({ dif }) {
  const map = { FACIL: 'chip-facil', MEDIO: 'chip-medio', DIFICIL: 'chip-dificil' };
  const label = { FACIL: 'Fácil', MEDIO: 'Medio', DIFICIL: 'Difícil' };
  return <span className={`chip ${map[dif]}`}>● {label[dif]}</span>;
}
function LangBadge({ lang = 'Python' }) {
  return <span className="chip chip-py"><Icon.Python /> {lang}</span>;
}

/* ============ Helpers ============ */
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
}

/* ============ Animations keyframes (injected once) ============ */
if (!document.getElementById('cardly-anims')) {
  const s = document.createElement('style');
  s.id = 'cardly-anims';
  s.textContent = `
    @keyframes legendarySweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @keyframes legendaryPulse { 0%,100% { filter: brightness(1) drop-shadow(0 0 12px rgba(245,158,11,0.5)); } 50% { filter: brightness(1.15) drop-shadow(0 0 24px rgba(245,158,11,0.85)); } }
    @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
    @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes typingBlink { 0%, 50% { opacity: 1 } 50.1%, 100% { opacity: 0 } }
    @keyframes confettiFall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }
    @keyframes scaleIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes pulseBorder { 0%,100% { box-shadow: 0 0 0 0 currentColor; } 50% { box-shadow: 0 0 24px 4px currentColor; } }
  `;
  document.head.appendChild(s);
}

/* ============ EXPORT ============ */
Object.assign(window, {
  Icon, Background, Particles, AppShell, Sidebar, Topbar, Logo, ResourcePill,
  StatCard, Sparkline, CartaJugador, CartaDorso, RARITY, CardArt,
  DifficultyBadge, LangBadge, fmtTime,
});
