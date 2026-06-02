import { useRef, useState, type CSSProperties } from 'react';
import type { Rareza } from '@/types/api';
import { IconHeart, IconStar, IconSword } from './Icon';

type Theme = 'loop' | 'list' | 'cond' | 'func' | 'recur' | 'dict';

export interface CartaData {
  nombre: string;
  rareza: Rareza;
  theme?: Theme;
  stats?: { dano: number; salud: number; mana: number; danoHabilidad: number };
  habilidad?: { nombre: string };
  descripcion?: string;
}

interface RaritySpec {
  label: string;
  color: string;
  glow: string;
  grad: string;
  holo: string;
}

export const RARITY: Record<Rareza, RaritySpec> = {
  COMUN: {
    label: 'Común',
    color: '#94a3b8',
    glow: 'rgba(148,163,184,0.4)',
    grad: 'linear-gradient(135deg, #475569, #1e293b)',
    holo: 'linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
  },
  RARA: {
    label: 'Rara',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.5)',
    grad: 'linear-gradient(135deg, #3b82f6, #1e3a8a)',
    holo: 'linear-gradient(125deg, transparent 20%, rgba(96,165,250,0.5) 45%, rgba(255,255,255,0.3) 55%, transparent 80%)',
  },
  EPICA: {
    label: 'Épica',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.7)',
    grad: 'linear-gradient(135deg, #a855f7, #6b21a8)',
    holo: 'linear-gradient(125deg, transparent 10%, rgba(236,72,153,0.5) 35%, rgba(34,211,238,0.5) 55%, transparent 80%)',
  },
  LEGENDARIA: {
    label: 'Legendaria',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.85)',
    grad: 'linear-gradient(135deg, #fbbf24, #b45309)',
    holo: 'linear-gradient(125deg, transparent 10%, rgba(251,191,36,0.7) 35%, rgba(255,255,255,0.5) 50%, rgba(167,139,250,0.6) 65%, transparent 90%)',
  },
};

function CardArt({ theme = 'loop', tint }: { theme?: Theme; tint: string }) {
  const arts: Record<Theme, React.ReactNode> = {
    loop: (
      <g>
        <circle cx="100" cy="100" r="56" fill="none" stroke={tint} strokeWidth="3" strokeDasharray="6 4" opacity="0.6" />
        <circle cx="100" cy="100" r="38" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <path d="M64 100a36 36 0 1 0 36-36" fill="none" stroke={tint} strokeWidth="5" strokeLinecap="round" />
        <path d="m95 60 5 5 5-5" fill="none" stroke={tint} strokeWidth="3" strokeLinecap="round" />
        <text x="100" y="108" textAnchor="middle" fill="white" fontFamily="JetBrains Mono" fontSize="22" fontWeight="700" opacity="0.85">for</text>
      </g>
    ),
    list: (
      <g>
        {[58, 78, 98, 118].map((y, i) => (
          <rect key={y} x="60" y={y} width="80" height="14" rx="3" fill={tint} opacity={0.4 + i * 0.2} />
        ))}
        {[65, 85, 105, 125].map((cy) => (
          <circle key={cy} cx="70" cy={cy} r="3" fill="white" />
        ))}
      </g>
    ),
    cond: (
      <g>
        <path d="M100 50v30M100 80l-30 30M100 80l30 30M70 110v30M130 110v30" stroke={tint} strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="100" cy="50" r="6" fill="white" />
        <circle cx="100" cy="80" r="8" fill={tint} />
        <text x="100" y="84" textAnchor="middle" fill="white" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">if</text>
        <circle cx="70" cy="140" r="6" fill="white" />
        <circle cx="130" cy="140" r="6" fill="white" />
      </g>
    ),
    func: (
      <g>
        <path d="M70 70c-6 0-10 4-10 10v10c0 6-4 10-10 10 6 0 10 4 10 10v10c0 6 4 10 10 10" stroke={tint} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M130 70c6 0 10 4 10 10v10c0 6 4 10 10 10-6 0-10 4-10 10v10c0 6-4 10-10 10" stroke={tint} strokeWidth="3" fill="none" strokeLinecap="round" />
        <text x="100" y="110" textAnchor="middle" fill="white" fontFamily="JetBrains Mono" fontSize="22" fontWeight="700">def</text>
        <circle cx="100" cy="80" r="3" fill={tint} />
      </g>
    ),
    recur: (
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={50 + i * 8}
            y={50 + i * 8}
            width={100 - i * 16}
            height={100 - i * 16}
            rx="4"
            fill="none"
            stroke={tint}
            strokeWidth={2 - i * 0.2}
            opacity={1 - i * 0.15}
          />
        ))}
        <circle cx="100" cy="100" r="6" fill={tint} />
      </g>
    ),
    dict: (
      <g>
        <rect x="55" y="55" width="90" height="90" rx="8" fill="none" stroke={tint} strokeWidth="2.5" opacity="0.7" />
        <text x="75" y="95" fill="white" fontFamily="JetBrains Mono" fontSize="18" fontWeight="700">{'{'}</text>
        <circle cx="100" cy="92" r="3" fill={tint} />
        <text x="115" y="95" fill="white" fontFamily="JetBrains Mono" fontSize="18" fontWeight="700">{'}'}</text>
        <text x="100" y="125" textAnchor="middle" fill={tint} fontFamily="JetBrains Mono" fontSize="11" opacity="0.7">key:val</text>
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <radialGradient id={`bg-${theme}`} cx="50%" cy="40%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.4" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill={`url(#bg-${theme})`} />
      {arts[theme]}
    </svg>
  );
}

function StatPill({ icon, v, c, w }: { icon: React.ReactNode; v: number; c: string; w: number }) {
  return (
    <div
      className="flex items-center justify-center gap-1 rounded-md py-1.5 font-display font-bold border border-white/10"
      style={{ background: 'rgba(0,0,0,0.45)', fontSize: w * 0.055, color: c }}
    >
      {icon}
      {v}
    </div>
  );
}

interface CartaJugadorProps {
  carta: CartaData;
  size?: number;
  holo?: boolean;
  tilt?: boolean;
}

export function CartaJugador({ carta, size = 280, holo = true, tilt = true }: CartaJugadorProps) {
  const R = RARITY[carta.rareza] ?? RARITY.COMUN;
  const ratio = 1.4;
  const w = size;
  const h = size * ratio;
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  const themeTint: Record<Rareza, string> = {
    COMUN: '#94a3b8',
    RARA: '#60a5fa',
    EPICA: '#c084fc',
    LEGENDARIA: '#fbbf24',
  };

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setT({ rx: (0.5 - y) * 14, ry: (x - 0.5) * 14, mx: x * 100, my: y * 100 });
  };
  const handleLeave = () => setT({ rx: 0, ry: 0, mx: 50, my: 50 });

  const containerStyle: CSSProperties = {
    width: w,
    height: h,
    perspective: 1200,
    cursor: tilt ? 'pointer' : 'default',
  };

  const tiltStyle: CSSProperties = {
    transformStyle: 'preserve-3d',
    transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
    transition: 'transform .25s var(--ease-out-expo)',
    boxShadow: `0 18px 50px -10px ${R.glow}, 0 0 0 1px ${R.glow}`,
  };

  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className="relative" style={containerStyle}>
      <div className="h-full w-full rounded-2xl relative" style={tiltStyle}>
        <div className="absolute inset-0 rounded-2xl p-[3px]" style={{ background: R.grad }}>
          <div
            className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl"
            style={{ background: 'linear-gradient(160deg, #1a2238 0%, #0a0e1a 100%)' }}
          >
            <div
              className="flex items-center justify-between px-3.5 py-2.5"
              style={{
                borderBottom: `1px solid ${R.glow}`,
                background: `linear-gradient(180deg, ${R.glow}, transparent)`,
              }}
            >
              <div
                className="font-display font-bold uppercase"
                style={{
                  fontSize: w * 0.04,
                  color: R.color,
                  letterSpacing: 0.06,
                  textShadow: `0 0 8px ${R.glow}`,
                }}
              >
                {R.label}
              </div>
              <div
                className="flex items-center justify-center rounded-full font-display font-extrabold text-white border-2 border-white/30"
                style={{
                  width: w * 0.13,
                  height: w * 0.13,
                  background: 'radial-gradient(circle at 30% 30%, #67e8f9, #0891b2)',
                  fontSize: w * 0.07,
                  boxShadow: '0 0 12px rgba(34,211,238,0.6), inset 0 -2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {carta.stats?.mana ?? 0}
              </div>
            </div>

            <div
              className="relative mx-3.5 mt-3 mb-1.5 flex-1 overflow-hidden rounded-[10px]"
              style={{
                border: `1px solid ${R.glow}`,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
              }}
            >
              <CardArt theme={carta.theme ?? 'loop'} tint={themeTint[carta.rareza]} />
              {holo && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: R.holo,
                    mixBlendMode: 'overlay',
                    opacity: 0.7,
                    transform: `translateX(${(t.mx - 50) * 0.4}%)`,
                    transition: 'transform .15s linear',
                  }}
                />
              )}
              {tilt && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at ${t.mx}% ${t.my}%, rgba(255,255,255,0.25), transparent 40%)`,
                    mixBlendMode: 'soft-light',
                  }}
                />
              )}
            </div>

            <div
              className="px-3.5 pt-1 pb-0 text-center font-display font-bold text-white"
              style={{ fontSize: w * 0.065, letterSpacing: 0.02, textShadow: `0 0 12px ${R.glow}` }}
            >
              {carta.nombre}
            </div>

            {carta.habilidad && (
              <div
                className="mx-3.5 my-2 rounded-lg px-2.5 py-2 text-center italic text-text-secondary"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  border: `1px solid ${R.glow}`,
                  fontSize: w * 0.04,
                }}
              >
                <span style={{ color: R.color, fontStyle: 'normal', fontWeight: 600 }}>
                  ✦ {carta.habilidad.nombre}
                </span>
                {carta.descripcion && (
                  <div className="mt-1 leading-snug" style={{ fontSize: w * 0.035 }}>
                    {carta.descripcion}
                  </div>
                )}
              </div>
            )}

            {carta.stats && (
              <div
                className="grid grid-cols-3 gap-1.5 px-3.5 py-2.5"
                style={{
                  borderTop: `1px solid ${R.glow}`,
                  background: `linear-gradient(0deg, ${R.glow}, transparent)`,
                }}
              >
                <StatPill icon={<IconSword size={w * 0.05} />} v={carta.stats.dano} c="#cbd5e1" w={w} />
                <StatPill icon={<IconHeart size={w * 0.05} />} v={carta.stats.salud} c="#ef4444" w={w} />
                <StatPill icon={<IconStar size={w * 0.05} />} v={carta.stats.danoHabilidad} c="#fbbf24" w={w} />
              </div>
            )}

            {carta.rareza === 'LEGENDARIA' && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)',
                  animation: 'var(--animate-legendary-sweep)',
                  mixBlendMode: 'screen',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
