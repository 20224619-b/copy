// Playground inline para los pasos del módulo: editor + ▶ Probar.
// Cuando se pasa `expected`, valida output y muestra ✓/✕ (mini-reto).

import { useState } from 'react';
import { CodeEditor } from '@/features/resolver/components/CodeEditor';
import { IconPlay } from '@/components/cardly/Icon2';
import { IconSpinner } from '@/components/cardly/Icon';
import {
  outputsMatch,
  runPython,
} from '@/features/resolver/lib/pythonRunner';

interface Props {
  initialCode: string;
  /** Si se pasa, el output debe coincidir → muestra ✓/✕ (modo reto). */
  expected?: string;
  /** Stdin opcional para input(). */
  stdin?: string;
  /** Altura del editor en px. Default 180. */
  height?: number;
}

type RunState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'running' }
  | {
      kind: 'done';
      stdout: string;
      stderr: string;
      error: string | null;
      passed?: boolean;
    };

export function InteractiveExample({ initialCode, expected, stdin = '', height = 180 }: Props) {
  const [code, setCode] = useState(initialCode);
  const [state, setState] = useState<RunState>({ kind: 'idle' });
  const isChallenge = typeof expected === 'string';

  const handleRun = async () => {
    if (state.kind === 'loading' || state.kind === 'running') return;
    setState({ kind: 'loading' });
    try {
      // Trigger fetch + first run; engine load happens implícitamente
      setState({ kind: 'running' });
      const res = await runPython(code, stdin);
      const passed = isChallenge ? !res.error && outputsMatch(res.stdout, expected!) : undefined;
      setState({ kind: 'done', stdout: res.stdout, stderr: res.stderr, error: res.error, passed });
    } catch (err) {
      setState({
        kind: 'done',
        stdout: '',
        stderr: err instanceof Error ? err.message : String(err),
        error: 'Pyodide no pudo cargar',
      });
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setState({ kind: 'idle' });
  };

  const isRunning = state.kind === 'loading' || state.kind === 'running';

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: isChallenge
          ? state.kind === 'done' && state.passed
            ? 'rgba(16,185,129,0.4)'
            : state.kind === 'done' && state.passed === false
            ? 'rgba(251,113,133,0.4)'
            : 'rgba(168,85,247,0.3)'
          : 'rgba(148,163,184,0.12)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 border-b"
        style={{
          background: 'rgba(17,23,38,0.6)',
          borderBottomColor: 'rgba(148,163,184,0.08)',
        }}
      >
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold flex items-center gap-1.5">
          {isChallenge ? (
            <>
              <span style={{ color: 'var(--color-accent-primary-2)' }}>✦ Reto</span>
              {expected && (
                <span className="text-text-muted normal-case">
                  · esperado: <code className="font-mono">{truncate(expected, 30)}</code>
                </span>
              )}
            </>
          ) : (
            <>python · ejemplo</>
          )}
        </span>

        <div className="flex items-center gap-1.5">
          {state.kind === 'idle' && (
            <button
              type="button"
              onClick={handleRun}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold border transition-colors hover:bg-white/5"
              style={{
                color: 'var(--color-accent-cyan)',
                borderColor: 'rgba(34,211,238,0.4)',
                background: 'rgba(34,211,238,0.06)',
              }}
            >
              <IconPlay size={10} /> Probar
            </button>
          )}
          {isRunning && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold text-text-muted">
              <IconSpinner size={10} className="animate-spin" />
              {state.kind === 'loading' ? 'Cargando…' : 'Corriendo…'}
            </span>
          )}
          {state.kind === 'done' && (
            <>
              <button
                type="button"
                onClick={handleRun}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold border transition-colors hover:bg-white/5"
                style={{
                  color: 'var(--color-accent-cyan)',
                  borderColor: 'rgba(34,211,238,0.4)',
                  background: 'rgba(34,211,238,0.06)',
                }}
              >
                <IconPlay size={10} /> Probar otra vez
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-text-muted hover:text-text-primary px-2 py-1"
                title="Restaurar código original"
              >
                ↺
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor */}
      <div style={{ height }}>
        <CodeEditor value={code} onChange={setCode} language="python" height={height} />
      </div>

      {/* Output panel */}
      {state.kind === 'done' && (
        <div
          className="border-t px-3 py-2.5"
          style={{
            background: 'rgba(10,14,26,0.5)',
            borderTopColor: 'rgba(148,163,184,0.08)',
          }}
        >
          {isChallenge && (
            <ResultBadge passed={!!state.passed} hasError={!!state.error} />
          )}

          {state.error ? (
            <>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-rose-400 mb-1 mt-1">
                Error
              </div>
              <pre
                className="m-0 font-mono text-xs whitespace-pre-wrap break-words"
                style={{ color: '#fb7185' }}
              >
                {state.error}
              </pre>
              {state.stderr && (
                <pre className="m-0 mt-1 font-mono text-[11px] text-text-muted whitespace-pre-wrap break-words">
                  {state.stderr}
                </pre>
              )}
            </>
          ) : (
            <>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1 mt-1">
                Output
              </div>
              <pre
                className="m-0 font-mono text-xs whitespace-pre-wrap break-words"
                style={{ color: 'var(--color-accent-success)' }}
              >
                {state.stdout || <span className="text-text-muted italic">(sin output)</span>}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ResultBadge({ passed, hasError }: { passed: boolean; hasError: boolean }) {
  if (hasError) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border mb-2"
        style={{
          color: '#fb7185',
          borderColor: 'rgba(251,113,133,0.4)',
          background: 'rgba(251,113,133,0.08)',
        }}
      >
        ⚠ Error de ejecución
      </div>
    );
  }
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border mb-2"
      style={
        passed
          ? {
              color: 'var(--color-accent-success)',
              borderColor: 'rgba(16,185,129,0.4)',
              background: 'rgba(16,185,129,0.08)',
            }
          : {
              color: '#fb7185',
              borderColor: 'rgba(251,113,133,0.4)',
              background: 'rgba(251,113,133,0.08)',
            }
      }
    >
      {passed ? '✓ Reto completado' : '✕ Output no coincide'}
    </div>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n) + '…';
}
