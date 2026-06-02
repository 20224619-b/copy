import type { CasoPrueba } from '@/types/api';

export type CasoRunStatus = 'pendiente' | 'corriendo' | 'ok' | 'fail' | 'error';

export interface CasoRunResult {
  status: CasoRunStatus;
  got?: string;
  stderr?: string;
  error?: string;
  /** Tiempo de ejecución en ms, proporcionado por TimingDecorator. */
  elapsedMs?: number;
}

interface Props {
  idx: number;
  caso: CasoPrueba;
  result?: CasoRunResult;
}

export function CasoPruebaCard({ idx, caso, result }: Props) {
  const status = result?.status ?? 'pendiente';
  const cfg = STATUS_CFG[status];

  return (
    <div
      className="rounded-xl border p-3"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: cfg.borderColor,
        boxShadow: cfg.glow,
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] font-mono font-bold tracking-wider text-accent-cyan">
          CASO {String(idx + 1).padStart(2, '0')}
          {result?.elapsedMs !== undefined && (
            <span className="ml-1.5 font-normal text-text-muted">
              {result.elapsedMs} ms
            </span>
          )}
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
          style={{
            color: cfg.color,
            borderColor: cfg.borderColor,
            background: cfg.bg,
          }}
        >
          {cfg.label}
        </span>
      </div>

      <div className="text-[10px] font-mono text-text-muted">Input de prueba</div>
      <div
        className="font-mono text-xs text-accent-success rounded px-2 py-1 mt-1 mb-2 whitespace-pre-wrap break-all"
        style={{ background: 'rgba(16,185,129,0.08)' }}
      >
        {caso.input || '(vacío)'}
      </div>

      <div className="text-[10px] font-mono text-text-muted">Output esperado</div>
      <div
        className="font-mono text-xs text-accent-gold rounded px-2 py-1 mt-1 whitespace-pre-wrap break-all"
        style={{ background: 'rgba(251,191,36,0.08)' }}
      >
        {caso.outputEsperado}
      </div>

      {result && (status === 'ok' || status === 'fail' || status === 'error') && (
        <>
          <div className="text-[10px] font-mono text-text-muted mt-2">Tu output</div>
          {status === 'error' ? (
            <div
              className="font-mono text-xs rounded px-2 py-1 mt-1 whitespace-pre-wrap break-words"
              style={{ background: 'rgba(239,68,68,0.10)', color: '#fb7185' }}
            >
              {result.error ?? result.stderr ?? '(sin salida)'}
            </div>
          ) : (
            <div
              className="font-mono text-xs rounded px-2 py-1 mt-1 whitespace-pre-wrap break-all"
              style={{
                background: status === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.10)',
                color: status === 'ok' ? 'var(--color-accent-success)' : '#fb7185',
              }}
            >
              {result.got && result.got.length > 0 ? result.got : '(vacío)'}
            </div>
          )}

          {status === 'fail' && (
            <div
              className="text-[10px] rounded px-2 py-1 mt-1.5 leading-relaxed"
              style={{ background: 'rgba(251,191,36,0.08)', color: 'var(--color-text-muted)' }}
            >
              Revisa que tu salida coincida exactamente con el output esperado. También cuentan mayúsculas, minúsculas y espacios.
            </div>
          )}

          {result.stderr && status !== 'error' && (
            <div
              className="font-mono text-[10px] rounded px-2 py-1 mt-1.5 whitespace-pre-wrap break-words"
              style={{ background: 'rgba(251,113,133,0.08)', color: 'var(--color-text-muted)' }}
            >
              ⚠ {result.stderr.split('\n').slice(0, 2).join(' · ')}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const STATUS_CFG: Record<CasoRunStatus, {
  label: string;
  color: string;
  borderColor: string;
  bg: string;
  glow: string;
}> = {
  pendiente: {
    label: '— sin probar',
    color: 'var(--color-text-muted)',
    borderColor: 'rgba(148,163,184,0.12)',
    bg: 'transparent',
    glow: 'none',
  },
  corriendo: {
    label: '⟳ corriendo',
    color: 'var(--color-accent-cyan)',
    borderColor: 'rgba(34,211,238,0.4)',
    bg: 'rgba(34,211,238,0.08)',
    glow: '0 0 12px -4px var(--color-accent-cyan)',
  },
  ok: {
    label: '✓ correcto',
    color: 'var(--color-accent-success)',
    borderColor: 'rgba(16,185,129,0.4)',
    bg: 'rgba(16,185,129,0.08)',
    glow: '0 0 12px -4px var(--color-accent-success)',
  },
  fail: {
    label: '✕ no coincide',
    color: '#fb7185',
    borderColor: 'rgba(251,113,133,0.4)',
    bg: 'rgba(251,113,133,0.08)',
    glow: '0 0 12px -4px rgba(239,68,68,0.6)',
  },
  error: {
    label: '⚠ runtime error',
    color: '#fb7185',
    borderColor: 'rgba(239,68,68,0.5)',
    bg: 'rgba(239,68,68,0.1)',
    glow: '0 0 12px -4px rgba(239,68,68,0.6)',
  },
};
