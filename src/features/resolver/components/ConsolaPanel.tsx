// Consola interactiva para el Resolver: permite probar el código con stdin
// arbitrario sin tener que enviar al back. Es independiente del "Probar contra
// casos de prueba" — sirve para que el alumno experimente con sus propios
// inputs antes de competir contra los casos oficiales.

import { useState } from 'react';
import { IconPlay } from '@/components/cardly/Icon2';
import { IconSpinner } from '@/components/cardly/Icon';
import { createDefaultRunner } from '../lib/pythonRunnerDecorators';

interface ConsolaPanelProps {
  code: string;
}

type ConsoleState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'done'; stdout: string; stderr: string; error: string | null; elapsedMs?: number };

export function ConsolaPanel({ code }: ConsolaPanelProps) {
  const [open, setOpen] = useState(false);
  const [stdin, setStdin] = useState('');
  const [state, setState] = useState<ConsoleState>({ kind: 'idle' });

  const handleRun = async () => {
    if (state.kind === 'running') return;
    if (code.trim().length === 0) return;
    setState({ kind: 'running' });
    try {
      const runner = createDefaultRunner();
      const res = await runner.run(code, stdin);
      setState({ kind: 'done', stdout: res.stdout, stderr: res.stderr, error: res.error, elapsedMs: res.elapsedMs });
    } catch (err) {
      setState({
        kind: 'done',
        stdout: '',
        stderr: err instanceof Error ? err.message : String(err),
        error: 'Pyodide no pudo cargar',
      });
    }
  };

  return (
    <div
      className="mt-3 rounded-xl border overflow-hidden"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'rgba(148,163,184,0.12)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-sm" style={{ color: 'var(--color-accent-cyan)' }}>
          {open ? '▾' : '▸'}
        </span>
        <span className="text-[11px] uppercase tracking-wider font-bold text-accent-cyan">
          ⌨ Consola: probar con MI propio input
        </span>
        <span className="text-[10px] text-text-muted hidden sm:inline">
          (para experimentar — no afecta los casos oficiales)
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 pt-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* stdin */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
                stdin · una linea por cada input()
              </label>
              <button
                type="button"
                onClick={() => setStdin('')}
                disabled={stdin.length === 0 || state.kind === 'running'}
                className="text-[10px] text-text-muted hover:text-text-primary disabled:opacity-40"
              >
                limpiar
              </button>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder={`Ejemplo:\n4\n5`}
              rows={6}
              className="w-full rounded-md border px-3 py-2 font-mono text-[13px] resize-y outline-none focus:border-accent-cyan transition-colors"
              style={{
                background: '#0a0e1a',
                borderColor: 'rgba(148,163,184,0.18)',
                color: 'var(--color-text-primary)',
              }}
            />
            <button
              type="button"
              onClick={handleRun}
              disabled={state.kind === 'running' || code.trim().length === 0}
              title="Corre tu código una sola vez con la entrada de arriba"
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-colors hover:bg-white/5 disabled:opacity-60"
              style={{
                color: 'var(--color-accent-cyan)',
                borderColor: 'rgba(34,211,238,0.4)',
                background: 'rgba(34,211,238,0.06)',
              }}
            >
              {state.kind === 'running' ? (
                <>
                  <IconSpinner size={11} className="animate-spin" /> Corriendo…
                </>
              ) : (
                <>
                  <IconPlay size={11} /> Ejecutar con mi input
                </>
              )}
            </button>
          </div>

          {/* output */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
                salida del programa
              </div>
              {state.kind === 'done' && state.elapsedMs !== undefined && (
                <span className="text-[10px] font-mono text-text-muted">
                  {state.elapsedMs} ms
                </span>
              )}
            </div>
            <div
              className="rounded-md border px-3 py-2 font-mono text-[13px] min-h-[150px] whitespace-pre-wrap break-words"
              style={{
                background: '#0a0e1a',
                borderColor: 'rgba(148,163,184,0.18)',
                color: 'var(--color-accent-success)',
              }}
            >
              {state.kind === 'idle' && (
                <span className="text-text-muted italic">
                  Click en <strong className="text-text-primary">Ejecutar</strong> para ver la salida.
                </span>
              )}
              {state.kind === 'running' && (
                <span className="text-text-muted italic">ejecutando…</span>
              )}
              {state.kind === 'done' && (
                <>
                  {state.stdout || (
                    <span className="text-text-muted italic">(sin output)</span>
                  )}
                  {state.error && (
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(239,68,68,0.2)', color: '#fb7185' }}>
                      ⚠ {state.error}
                    </div>
                  )}
                  {state.stderr && !state.error && (
                    <div className="mt-2 pt-2 border-t text-text-muted text-[11px]" style={{ borderColor: 'rgba(148,163,184,0.18)' }}>
                      stderr: {state.stderr}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
