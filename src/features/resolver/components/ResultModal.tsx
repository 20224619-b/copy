import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { CartaJugador, RARITY } from '@/components/cardly/CartaJugador';
import {
  IconBolt,
  IconCoin,
  IconFlame,
  IconX,
  IconCode,
} from '@/components/cardly/Icon2';
import { IconChevR, IconHeart, IconSword, IconStar } from '@/components/cardly/Icon';
import type {
  CasoPrueba,
  Rareza,
  RecompensaOtorgada,
  SubmitResponse,
} from '@/types/api';
import { formatTime } from './Cronometro';

interface ResultModalProps {
  open: boolean;
  result: SubmitResponse | null;
  casos: CasoPrueba[];
  onClose: () => void;
  onRetry: () => void;
  onNext: () => void;
}

export function ResultModal({ open, result, casos, onClose, onRetry, onNext }: ResultModalProps) {
  // Lock scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !result) return null;

  if (result.correcto) {
    return <CorrectoView result={result} onClose={onClose} onNext={onNext} />;
  }
  return <IncorrectoView result={result} onClose={onClose} onRetry={onRetry} />;
}

// ────────────────────────────────────────────────────────────
// CORRECTO
// ────────────────────────────────────────────────────────────

function CorrectoView({
  result,
  onClose,
  onNext,
}: {
  result: SubmitResponse;
  onClose: () => void;
  onNext: () => void;
}) {
  const cartaRecompensa = result.recompensas.find(
    (r): r is Extract<RecompensaOtorgada, { tipo: 'CARTA' }> => r.tipo === 'CARTA',
  );
  const puntos = result.recompensas
    .filter((r): r is Extract<RecompensaOtorgada, { tipo: 'PUNTOS' }> => r.tipo === 'PUNTOS')
    .reduce((a, r) => a + r.cantidad, 0);
  const monedas = result.recompensas
    .filter((r): r is Extract<RecompensaOtorgada, { tipo: 'MONEDAS' }> => r.tipo === 'MONEDAS')
    .reduce((a, r) => a + r.cantidad, 0);

  const rareza = cartaRecompensa?.carta.rareza ?? 'COMUN';
  const R = RARITY[rareza];

  return (
    <ModalShell onClose={onClose} variant="correct" glow={R.glow}>
      <Confetti color={R.color} />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 sm:px-6 max-w-5xl w-full">
        <div className="text-center">
          <h1
            className="font-display font-extrabold tracking-wide leading-none text-5xl sm:text-6xl"
            style={{
              background: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #fef3c7 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 40px rgba(251,191,36,0.6)',
              filter: 'drop-shadow(0 4px 16px rgba(251,191,36,0.4))',
              animation: 'scaleIn .6s var(--ease-out-expo) both',
            }}
          >
            ¡CORRECTO!
          </h1>
          <div className="mt-3 text-base text-text-secondary">
            Resuelto en{' '}
            <span className="font-mono text-accent-cyan font-bold">
              {formatTime(result.tiempoResolucionSeg)}
            </span>
          </div>
        </div>

        {/* Reward row */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] gap-5 sm:gap-8 lg:gap-10 items-start w-full">
          {/* Left: rewards */}
          <div className="flex flex-col gap-3 lg:items-end order-2 lg:order-1 lg:pt-12">
            {puntos > 0 && (
              <RewardPill icon={<IconBolt size={20} />} value={`+${puntos}`} label="puntos" color="#a78bfa" big />
            )}
            {monedas > 0 && (
              <RewardPill icon={<IconCoin size={20} />} value={`+${monedas}`} label="monedas" color="#fbbf24" />
            )}
            <RewardPill
              icon={<IconFlame size={20} />}
              value={String(result.rachaEjercicios)}
              label="días racha"
              color="#f97316"
              delta="+1"
            />
          </div>

          {/* Center: card */}
          <div className="relative order-1 lg:order-2 self-center">
            <div
              className="absolute -inset-10 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(ellipse, ${R.glow}, transparent 70%)`,
                filter: 'blur(20px)',
                animation: rareza === 'LEGENDARIA' ? 'legendaryPulse 2s ease-in-out infinite' : undefined,
              }}
            />
            <div className="relative" style={{ animation: 'scaleIn .8s var(--ease-out-expo) .3s both' }}>
              {cartaRecompensa ? (
                <CartaJugador
                  carta={{
                    nombre: cartaRecompensa.carta.nombre,
                    rareza,
                    habilidad: { nombre: '✨' },
                  }}
                  size={220}
                />
              ) : (
                <NoCardPlaceholder />
              )}
            </div>
            <RuneRing rareza={rareza} />
          </div>

          {/* Right: card meta */}
          <div className="flex flex-col gap-3 order-3 lg:pt-12 max-w-[240px]">
            {cartaRecompensa ? (
              <>
                <div>
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      background: `${R.glow}22`,
                      borderColor: R.glow,
                      color: R.color,
                      textShadow: `0 0 8px ${R.glow}`,
                    }}
                  >
                    ✦ {R.label}
                  </div>
                  <h2
                    className="font-display text-xl font-bold text-white leading-tight mt-2.5 mb-1"
                  >
                    {cartaRecompensa.carta.nombre}
                  </h2>
                  <div className="text-xs text-text-secondary leading-relaxed">
                    Nueva carta agregada a tu colección
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-text-secondary">
                Sin carta esta vez — pero ganaste puntos y conservaste la racha.
              </div>
            )}

            <div className="text-[11px] text-text-muted">
              {result.puntosActuales.toLocaleString()} pts totales · #
              {/* posición fresca no viene en submit; lo dejamos como hint */}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mt-4 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-5 sm:px-6 py-3 rounded-[10px] border text-text-primary font-semibold text-sm transition-colors hover:bg-white/5"
            style={{ borderColor: 'rgba(139,92,246,0.18)' }}
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onNext}
            className="shimmer inline-flex items-center gap-2 px-6 sm:px-7 py-3 rounded-[10px] text-white font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
              boxShadow:
                '0 4px 24px -8px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            Siguiente ejercicio
            <IconChevR size={14} />
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ────────────────────────────────────────────────────────────
// INCORRECTO
// ────────────────────────────────────────────────────────────

function IncorrectoView({
  result,
  onClose,
  onRetry,
}: {
  result: SubmitResponse;
  onClose: () => void;
  onRetry: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result.solucionEjemplo) return;
    navigator.clipboard.writeText(result.solucionEjemplo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <ModalShell onClose={onClose} variant="incorrect" glow="rgba(239,68,68,0.4)">
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl border mx-4"
        style={{
          background: 'linear-gradient(160deg, #1a0f15, #0a0e1a)',
          borderColor: 'rgba(239,68,68,0.5)',
          boxShadow: '0 20px 60px -10px rgba(239,68,68,0.5)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div className="p-8 sm:p-10 text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl font-bold"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '2px solid rgba(239,68,68,0.5)',
              color: '#fb7185',
              boxShadow: '0 0 32px rgba(239,68,68,0.5)',
            }}
          >
            ✕
          </div>
          <h2
            className="font-display text-4xl font-bold m-0"
            style={{
              background: 'linear-gradient(135deg, #fb7185, #f43f5e)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Casi…
          </h2>
          <p className="mt-3 text-text-secondary text-[15px] leading-snug">
            Tu solución no pasó. Revisa tu lógica y vuelve a enviar.
          </p>

          {result.motivo && (
            <div
              className="mt-4 px-4 py-3 rounded-lg text-sm text-left"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1.5">
                <IconCode size={12} /> Motivo
              </div>
              <div className="font-mono text-[12px] text-text-secondary break-words">{result.motivo}</div>
            </div>
          )}

          <div
            className="mt-4 px-3.5 py-2.5 rounded-lg text-xs text-text-secondary flex items-center justify-center gap-2"
            style={{ background: 'rgba(251,113,133,0.08)' }}
          >
            <IconFlame size={14} />
            Tu racha se reinició:{' '}
            <span className="font-mono text-text-muted">{result.rachaEjercicios}</span>
          </div>

          {result.solucionEjemplo && (
            <button
              type="button"
              onClick={() => setShowAnswer((v) => !v)}
              className="mt-5 w-full py-2.5 rounded-xl border text-sm font-semibold transition-colors"
              style={{
                borderColor: showAnswer ? 'rgba(251,191,36,0.4)' : 'rgba(148,163,184,0.2)',
                color: showAnswer ? '#fbbf24' : 'var(--color-text-secondary)',
                background: showAnswer ? 'rgba(251,191,36,0.06)' : 'transparent',
              }}
            >
              {showAnswer ? '▲ Ocultar respuesta' : '💡 Mostrar respuesta'}
            </button>
          )}
        </div>

        {showAnswer && result.solucionEjemplo && (
          <div
            className="border-t"
            style={{ borderColor: 'rgba(251,191,36,0.2)', background: 'rgba(0,0,0,0.3)' }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#fbbf24' }}>
                Código de solución
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold border transition-colors"
                style={{
                  borderColor: copied ? 'rgba(52,211,153,0.4)' : 'rgba(251,191,36,0.3)',
                  color: copied ? '#34d399' : '#fbbf24',
                  background: copied ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.06)',
                }}
              >
                {copied ? '✓ Copiado' : '⎘ Copiar código'}
              </button>
            </div>
            <pre
              className="font-mono text-[12px] leading-relaxed px-5 pb-5 overflow-x-auto whitespace-pre-wrap break-words"
              style={{ color: '#a5b4fc' }}
            >
              {result.solucionEjemplo}
            </pre>
          </div>
        )}

        <div className="flex flex-wrap gap-3 px-8 pb-8 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-[10px] border text-text-primary font-semibold text-sm transition-colors hover:bg-white/5"
            style={{ borderColor: 'rgba(139,92,246,0.18)' }}
          >
            Salir
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="shimmer inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-white font-semibold text-sm"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
              boxShadow: '0 4px 24px -8px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ────────────────────────────────────────────────────────────
// Shared parts
// ────────────────────────────────────────────────────────────

function ModalShell({
  children,
  onClose,
  variant,
  glow,
}: {
  children: React.ReactNode;
  onClose: () => void;
  variant: 'correct' | 'incorrect';
  glow: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: variant === 'correct' ? 'rgba(0,0,0,0.6)' : 'rgba(127,0,0,0.25)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            variant === 'correct'
              ? `radial-gradient(ellipse 50% 60% at 50% 60%, ${glow}, transparent 70%)`
              : `radial-gradient(ellipse 60% 50% at 50% 50%, ${glow}, transparent 70%)`,
          opacity: variant === 'correct' ? 0.8 : 1,
        }}
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
        aria-label="Cerrar"
      >
        <IconX size={16} />
      </button>

      <div className="relative z-10 w-full flex items-center justify-center px-3">{children}</div>
    </div>
  );
}

function Confetti({ color }: { color: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 2,
        dur: 3 + Math.random() * 3,
        size: 4 + Math.random() * 6,
        rot: Math.random() * 360,
        color: [color, '#a78bfa', '#22d3ee', '#fff', '#fcd34d'][i % 5],
        shape: i % 3,
      })),
    [color],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[5]">
      {pieces.map((p, i) => {
        const style: CSSProperties = {
          position: 'absolute',
          top: -20,
          left: `${p.left}%`,
          width: p.size,
          height: p.shape === 1 ? p.size * 0.4 : p.size,
          background: p.color,
          borderRadius: p.shape === 2 ? '50%' : 2,
          transform: `rotate(${p.rot}deg)`,
          animation: `confettiFall ${p.dur}s linear ${p.delay}s infinite`,
          boxShadow: `0 0 6px ${p.color}80`,
        };
        return <span key={i} style={style} />;
      })}
    </div>
  );
}

function RuneRing({ rareza }: { rareza: Rareza }) {
  const R = RARITY[rareza];
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute pointer-events-none opacity-60"
      style={{
        inset: '-70px -70px',
        width: 'calc(100% + 140px)',
        height: 'calc(100% + 140px)',
      }}
    >
      <circle
        cx="200"
        cy="200"
        r="180"
        fill="none"
        stroke={R.color}
        strokeWidth="1"
        strokeDasharray="2 8"
        opacity="0.5"
        style={{ animation: 'spinSlow 30s linear infinite', transformOrigin: 'center' }}
      />
      <circle
        cx="200"
        cy="200"
        r="160"
        fill="none"
        stroke={R.color}
        strokeWidth="0.6"
        strokeDasharray="1 12"
        opacity="0.4"
        style={{ animation: 'spinSlow 18s linear infinite reverse', transformOrigin: 'center' }}
      />
    </svg>
  );
}

function RewardPill({
  icon,
  value,
  label,
  color,
  delta,
  big,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  delta?: string;
  big?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border backdrop-blur-md"
      style={{
        padding: big ? '14px 18px' : '10px 14px',
        background: `linear-gradient(135deg, ${color}25, ${color}05)`,
        borderColor: `${color}40`,
        boxShadow: `0 0 24px -8px ${color}, inset 0 1px 0 ${color}30`,
        minWidth: big ? 180 : 160,
        animation: 'scaleIn .5s var(--ease-out-expo) both',
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg flex-shrink-0"
        style={{
          width: big ? 40 : 32,
          height: big ? 40 : 32,
          background: `${color}25`,
          color,
          boxShadow: `0 0 12px -2px ${color}`,
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col items-end flex-1 min-w-0">
        <div
          className="font-display font-extrabold tabular-nums text-white leading-none"
          style={{
            fontSize: big ? 28 : 22,
            textShadow: `0 0 12px ${color}80`,
          }}
        >
          {value}
        </div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5 flex gap-1.5 items-center">
          {label}
          {delta && <span style={{ color, fontWeight: 700 }}>{delta}</span>}
        </div>
      </div>
    </div>
  );
}

function NoCardPlaceholder() {
  return (
    <div
      className="w-[220px] h-[308px] rounded-2xl border border-dashed flex items-center justify-center text-text-muted text-xs text-center px-6"
      style={{ borderColor: 'rgba(148,163,184,0.18)', background: 'rgba(0,0,0,0.3)' }}
    >
      Sin carta esta vez<br />
      <span className="text-text-secondary">vuelve mañana</span>
    </div>
  );
}

// Re-export used types for convenience
export type { SubmitResponse };
// Imports retained to satisfy linter (StatBar SVG icons may be used in future expansion)
export const _unused = { IconSword, IconHeart, IconStar };
