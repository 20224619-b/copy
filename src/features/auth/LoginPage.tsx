import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Background } from '@/components/cardly/Background';
import { Logo } from '@/components/cardly/Logo';
import { CartaJugador, type CartaData } from '@/components/cardly/CartaJugador';
import { IconChevR, IconCheck, IconEye, IconEyeOff, IconSpinner } from '@/components/cardly/Icon';
import { useAuthStore } from '@/stores/auth';
import { login, register } from './api';
import { extractApiError } from '@/lib/api';

type Mode = 'login' | 'register';

interface FloatingCard {
  carta: CartaData;
  left: string;
  top: string;
  rot: number;
  size: number;
  depth: number;
  delay: number;
}

const FLOATING_CARDS: FloatingCard[] = [
  {
    carta: {
      rareza: 'LEGENDARIA',
      theme: 'recur',
      nombre: 'Avatar del Recursor',
      stats: { dano: 9, salud: 8, mana: 6, danoHabilidad: 12 },
      habilidad: { nombre: 'Eco Infinito' },
      descripcion: 'Invoca un eco que se invoca a sí mismo.',
    },
    left: '12%',
    top: '14%',
    rot: -10,
    size: 200,
    depth: 1.0,
    delay: 0,
  },
  {
    carta: {
      rareza: 'EPICA',
      theme: 'loop',
      nombre: 'Hechicero del Loop',
      stats: { dano: 6, salud: 5, mana: 3, danoHabilidad: 8 },
      habilidad: { nombre: 'Iteración Arcana' },
    },
    left: '45%',
    top: '32%',
    rot: 6,
    size: 240,
    depth: 1.5,
    delay: 0.5,
  },
  {
    carta: {
      rareza: 'RARA',
      theme: 'cond',
      nombre: 'Vidente del If',
      stats: { dano: 4, salud: 6, mana: 2, danoHabilidad: 5 },
      habilidad: { nombre: 'Ramificación' },
    },
    left: '8%',
    top: '58%',
    rot: 8,
    size: 170,
    depth: 0.7,
    delay: 1.0,
  },
  {
    carta: {
      rareza: 'COMUN',
      theme: 'list',
      nombre: 'Aprendiz de Listas',
      stats: { dano: 2, salud: 3, mana: 1, danoHabilidad: 3 },
      habilidad: { nombre: 'Indexar' },
    },
    left: '54%',
    top: '64%',
    rot: -8,
    size: 165,
    depth: 0.5,
    delay: 1.5,
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const token = useAuthStore((s) => s.token);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.trim() || !password) {
      toast.error('Completa email y contraseña');
      return;
    }
    if (mode === 'register' && username.trim().length < 3) {
      toast.error('El username debe tener al menos 3 caracteres');
      return;
    }
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      const result =
        mode === 'login'
          ? await login({ email: email.trim(), password })
          : await register({ email: email.trim(), username: username.trim(), password });

      setSession(result.token, result.user);
      toast.success(`Bienvenido, ${result.user.username}`);

      const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">
      <Background />

      {/* LEFT — Form panel */}
      <div className="relative z-10 flex flex-1 lg:flex-[0_0_46%] flex-col justify-center px-6 sm:px-10 lg:px-16 py-10 lg:py-12">
        <Logo size={36} />

        <div className="mt-7 mb-9">
          <h1
            className="font-display font-extrabold leading-[1.05] text-3xl sm:text-4xl lg:text-[2.75rem] m-0 bg-clip-text text-transparent"
            style={{
              background:
                'linear-gradient(135deg, #fff 0%, #c4b5fd 60%, #67e8f9 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '0.01em',
            }}
          >
            Aprende programando.
            <br />
            Gana cartas.
            <br />
            Domina el código.
          </h1>
          <p className="mt-4 text-text-secondary max-w-md text-sm sm:text-base leading-relaxed">
            La arena épica donde tu siguiente{' '}
            <span className="text-accent-cyan">for-loop</span> resuelto te entrega
            una carta legendaria.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass w-full max-w-md px-6 sm:px-7 py-6 sm:py-7"
        >
          {/* Mode toggle */}
          <div
            className="flex gap-1 p-1 rounded-[10px] mb-5"
            style={{ background: 'rgba(10,14,26,0.5)' }}
          >
            <ModeTab active={mode === 'login'} onClick={() => setMode('login')}>
              Iniciar sesión
            </ModeTab>
            <ModeTab active={mode === 'register'} onClick={() => setMode('register')}>
              Crear cuenta
            </ModeTab>
          </div>

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="aria.dev@cardly.io"
            autoComplete="email"
            disabled={submitting}
          />

          {mode === 'register' && (
            <Field
              label="Username"
              type="text"
              value={username}
              onChange={setUsername}
              placeholder="aria_dev"
              autoComplete="username"
              disabled={submitting}
            />
          )}

          <Field
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            placeholder="••••••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            disabled={submitting}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-text-muted hover:text-text-primary transition-colors p-1"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            }
          />

          {mode === 'login' && (
            <div className="flex justify-between items-center mt-1.5 mb-5 text-xs">
              <label className="flex items-center gap-2 text-text-secondary cursor-pointer select-none">
                <span
                  className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center text-accent-cyan"
                  style={{
                    borderColor: 'var(--color-accent-primary)',
                    background: 'rgba(139,92,246,0.15)',
                  }}
                >
                  <IconCheck size={10} />
                </span>
                Mantener sesión
              </label>
              <a className="text-accent-cyan cursor-pointer hover:underline">
                ¿Olvidaste tu hechizo?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="shimmer relative w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-[10px] text-white font-semibold text-[15px] mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
              boxShadow:
                '0 4px 24px -8px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
            }}
          >
            {submitting ? (
              <>
                <IconSpinner size={16} className="animate-spin" />
                {mode === 'login' ? 'Entrando…' : 'Creando cuenta…'}
              </>
            ) : (
              <>
                {mode === 'login' ? 'Entrar a la arena' : 'Crear cuenta'}
                <IconChevR size={14} />
              </>
            )}
          </button>

          <p className="text-xs text-text-muted text-center mt-5">
            {mode === 'login' ? '¿Aún no juegas?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-accent-cyan hover:underline font-medium"
            >
              {mode === 'login' ? 'Crea tu cuenta' : 'Inicia sesión'}
            </button>
          </p>
        </form>

        <div className="mt-6 text-xs text-text-muted flex gap-4 flex-wrap">
          <span>v0.1 · Arena cerrada beta</span>
          <span>•</span>
          <span>Sprint 1 · Cardly</span>
        </div>
      </div>

      {/* RIGHT — Hero arena (desktop only) */}
      <div
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="hidden lg:block relative flex-1 overflow-hidden z-[2]"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 20%, rgba(139,92,246,0.4), transparent 60%),
            radial-gradient(ellipse 50% 60% at 80% 80%, rgba(34,211,238,0.25), transparent 60%),
            linear-gradient(160deg, #1a1340 0%, #0a0e1a 60%)
          `,
        }}
      >
        {/* Glow grid */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-25"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`h${i}`} x1="0" x2="100" y1={i * 8} y2={i * 8} stroke="#22d3ee" strokeWidth="0.05" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`v${i}`} y1="0" y2="100" x1={i * 8} x2={i * 8} stroke="#22d3ee" strokeWidth="0.05" />
          ))}
        </svg>

        {/* Floating cards with mouse parallax + float animation */}
        {FLOATING_CARDS.map((c, i) => {
          const dx = (mouse.x - 0.5) * 28 * c.depth;
          const dy = (mouse.y - 0.5) * 22 * c.depth;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: c.left,
                top: c.top,
                transform: `translate(${dx}px, ${dy}px) rotate(${c.rot}deg)`,
                transition: 'transform 0.4s var(--ease-out-expo)',
                animation: `floatCard ${6 + i}s ease-in-out ${c.delay}s infinite`,
                zIndex: Math.round(c.depth * 10),
              }}
            >
              <CartaJugador carta={c.carta} size={c.size} tilt={false} />
            </div>
          );
        })}

        {/* Floor glow */}
        <div
          className="absolute -bottom-52 left-[20%] right-[20%] h-[300px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.7), transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Tagline overlay */}
        <div
          className="absolute left-10 bottom-8 font-display font-bold uppercase tracking-[0.3px]"
          style={{ fontSize: 11, color: 'rgba(196,181,253,0.5)' }}
        >
          ARENA · TEMPORADA 03 · "EL CÓDIGO ARCANO"
        </div>
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-2 rounded-[7px] font-semibold text-[13px] transition-all"
      style={{
        background: active ? 'linear-gradient(135deg, #8b5cf6, #22d3ee)' : 'transparent',
        color: active ? 'white' : 'var(--color-text-secondary)',
        boxShadow: active ? '0 4px 12px -4px var(--color-accent-primary)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  trailing?: React.ReactNode;
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  trailing,
}: FieldProps) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1.5" style={{ letterSpacing: 0.5 }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-[9px] border transition-all focus-within:border-accent-primary focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
        style={{
          background: 'rgba(10,14,26,0.6)',
          borderColor: 'rgba(139,92,246,0.18)',
        }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-text-primary text-sm placeholder:text-text-muted/60 disabled:opacity-60"
        />
        {trailing}
      </div>
    </div>
  );
}
