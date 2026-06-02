import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { Background } from '@/components/cardly/Background';
import { Logo } from '@/components/cardly/Logo';
import {
  IconBolt,
  IconCard,
  IconFlame,
  IconPlay,
} from '@/components/cardly/Icon2';
import { IconChevR, IconSpinner } from '@/components/cardly/Icon';
import { useAuthStore } from '@/stores/auth';
import { extractApiError } from '@/lib/api';
import type {
  CasoPrueba,
  EjercicioDetail,
  RecompensaSpec,
  SubmitResponse,
} from '@/types/api';
import {
  getEjercicioDetail,
  submitEjercicio,
} from '@/features/ejercicios/api';

import { CodeEditor } from './components/CodeEditor';
import { CasoPruebaCard, type CasoRunResult } from './components/CasoPruebaCard';
import { Cronometro, useElapsedSeconds } from './components/Cronometro';
import { ResultModal } from './components/ResultModal';
import { DifficultyBadge, LangBadge } from '@/features/dashboard/components/Badges';
import { outputsMatch, runInteractive } from './lib/pythonRunner';
import { createDefaultRunner } from './lib/pythonRunnerDecorators';
import { ExerciseGuideBuilder, type ExerciseGuideModel } from './builders/exerciseGuideBuilder';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';

type TerminalLine = { kind: 'system' | 'stdin' | 'stdout' | 'error'; text: string };
const TERMINAL_INIT: TerminalLine[] = [{ kind: 'system', text: '$ python solution.py' }];

const PY_INITIAL = `# Escribe tu solución aquí

`;

export function ResolverPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const ejId = Number(params.id);

  
  const [code, setCode] = useState(PY_INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  // ▶ Probar — ejecución local con Pyodide
  const [runResults, setRunResults] = useState<Record<number, CasoRunResult>>({});
  const [runState, setRunState] = useState<'idle' | 'loading-engine' | 'running'>('idle');
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>(TERMINAL_INIT);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalRunning, setTerminalRunning] = useState(false);
  const [terminalWaiting, setTerminalWaiting] = useState(false);
  const inputResolverRef = useRef<((v: string) => void) | null>(null);

  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const startedAtRef = useRef<number>(Date.now());

  // NUEVO: Implementación de Caché Inteligente (Green Computing)
  // SWR revisa si "ejercicio-{ejId}" ya está en la memoria RAM antes de usar internet
  const { 
    data: ejercicio, 
    isLoading: loading, 
    error 
  } = useSWR(
    ejId > 0 ? `ejercicio-detalle-${ejId}` : null, 
    () => getEjercicioDetail(ejId),
    {
      revalidateOnFocus: false, // Ahorra batería: no recarga si el usuario cambia de pestaña
      dedupingInterval: 600000, // Ahorra internet: usa el caché por 10 minutos (600,000 ms)
    }
  );

  // Manejador de errores o IDs inválidos
  useEffect(() => {
    if (error || (!loading && !ejercicio)) {
      toast.error(error ? extractApiError(error) : 'Ejercicio inválido');
      navigate('/ejercicios');
    }
  }, [error, loading, ejercicio, navigate]);

  // Actualiza el cronómetro cuando el caché nos entrega el ejercicio
  useEffect(() => {
    if (ejercicio) {
      startedAtRef.current = Date.now();
    }
  }, [ejercicio]);

  const casos = useMemo<CasoPrueba[]>(() => {
    return Array.isArray(ejercicio?.casosPrueba) ? ejercicio!.casosPrueba : [];
  }, [ejercicio]);

  const isPython = (ejercicio?.lenguaje ?? '').toLowerCase().startsWith('py');

  const exerciseGuide = useMemo<ExerciseGuideModel | null>(() => {
    if (!ejercicio) return null;
    return ExerciseGuideBuilder
      .create(ejercicio)
      .withExample(casos[0])
      .withLanguageRules()
      .withSmartInputHint()
      .build();
  }, [ejercicio, casos]);

  // Si el código cambia, invalida los resultados previos (están stale).
  const handleCodeChange = (v: string) => {
    setCode(v);
    if (Object.keys(runResults).length > 0) setRunResults({});
    setTerminalHistory(TERMINAL_INIT);
  };

  const handleRun = async () => {
    if (!ejercicio || casos.length === 0 || runState !== 'idle') return;
    if (!isPython) {
      toast.error(`"Probar" solo está disponible para Python (este ejercicio es ${ejercicio.lenguaje}).`);
      return;
    }

    // Marca todos los casos como "corriendo" para feedback inmediato.
    const corriendo: Record<number, CasoRunResult> = {};
    casos.forEach((_, i) => { corriendo[i] = { status: 'corriendo' }; });
    setRunResults(corriendo);

    setRunState('loading-engine');
    let firstRun = true;
    const loadingToastId = toast.loading('Cargando entorno Python…', { duration: Infinity });
    const runner = createDefaultRunner();

    try {
      const acumulados: Record<number, CasoRunResult> = { ...corriendo };

      for (let i = 0; i < casos.length; i++) {
        const caso = casos[i];
        const res = await runner.run(code, caso.input);
        if (firstRun) {
          toast.dismiss(loadingToastId);
          firstRun = false;
          setRunState('running');
        }
        let next: CasoRunResult;
        if (res.error) {
          next = { status: 'error', error: res.error, stderr: res.stderr, got: res.stdout, elapsedMs: res.elapsedMs };
        } else if (outputsMatch(res.stdout, caso.outputEsperado)) {
          next = { status: 'ok', got: res.stdout, stderr: res.stderr, elapsedMs: res.elapsedMs };
        } else {
          next = { status: 'fail', got: res.stdout, stderr: res.stderr, elapsedMs: res.elapsedMs };
        }
        acumulados[i] = next;
        setRunResults({ ...acumulados });
      }

      const pasaron = Object.values(acumulados).filter((r) => r.status === 'ok').length;
      if (pasaron === casos.length) {
        toast.success(`${pasaron}/${casos.length} casos correctos`);
      } else {
        toast(`${pasaron}/${casos.length} casos pasaron`, { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error(extractApiError(err));
      setRunResults({});
    } finally {
      setRunState('idle');
    }
  };

  const handleTerminalSubmit = () => {
    if (!inputResolverRef.current) return;
    const resolve = inputResolverRef.current;
    inputResolverRef.current = null;
    setTerminalHistory((prev) => [...prev, { kind: 'stdin', text: terminalInput }]);
    const value = terminalInput;
    setTerminalInput('');
    setTerminalWaiting(false);
    resolve(value);
  };

  const handleResetTerminal = () => {
    if (inputResolverRef.current) {
      inputResolverRef.current('\x00'); // desbloquea el await y termina el loop
      inputResolverRef.current = null;
    }
    setTerminalHistory(TERMINAL_INIT);
    setTerminalInput('');
    setTerminalWaiting(false);
    setTerminalRunning(false);
  };

  const handleRunTerminal = async () => {
    if (terminalRunning || runState !== 'idle') return;
    if (!isPython) return;

    setTerminalRunning(true);
    setTerminalHistory((prev) => [...prev, { kind: 'system', text: '──────────────────' }]);
    const loadingToastId = toast.loading('Cargando Python…', { duration: Infinity });
    let firstEvent = true;

    try {
      const { error } = await runInteractive(code, {
        onOutput: (text) => {
          if (firstEvent) { toast.dismiss(loadingToastId); firstEvent = false; }
          const lines = text.trimEnd().split('\n').map((t): TerminalLine => ({ kind: 'stdout', text: t }));
          setTerminalHistory((prev) => [...prev, ...lines]);
        },
        requestInput: (prompt) => {
          if (firstEvent) { toast.dismiss(loadingToastId); firstEvent = false; }
          if (prompt) setTerminalHistory((prev) => [...prev, { kind: 'system', text: prompt }]);
          setTerminalWaiting(true);
          return new Promise<string>((resolve) => {
            inputResolverRef.current = resolve;
          });
        },
      });

      if (firstEvent) toast.dismiss(loadingToastId);
      if (error) {
        setTerminalHistory((prev) => [...prev, { kind: 'error', text: error }]);
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      setTerminalHistory((prev) => [...prev, { kind: 'error', text: extractApiError(err) }]);
    } finally {
      setTerminalRunning(false);
      setTerminalWaiting(false);
      inputResolverRef.current = null;
    }
  };

  // Resumen visible
  const firstRunError = useMemo(
    () => Object.values(runResults).find((r) => r.status === 'error') ?? null,
    [runResults]
  );

  const runSummary = useMemo(() => {
    const total = casos.length;
    if (total === 0) return null;
    const arr = Array.from({ length: total }, (_, i) => runResults[i]);
    const visible = arr.filter(Boolean);
    if (visible.length === 0) return null;
    const ok = visible.filter((r) => r?.status === 'ok').length;
    const fail = visible.filter((r) => r?.status === 'fail').length;
    const errs = visible.filter((r) => r?.status === 'error').length;
    const corriendo = visible.filter((r) => r?.status === 'corriendo').length;
    return { ok, fail, errs, corriendo, total };
  }, [runResults, casos.length]);

  const handleSubmit = async () => {
    if (!ejercicio || submitting || runState !== 'idle') return;
    const tiempoResolucionSeg = Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000));
    setSubmitting(true);
    try {
      // Para Python: enviamos los outputs reales de Pyodide en vez del código.
      // Así cualquier solución correcta pasa, sin importar cómo esté escrita.
      let payload: { tipo: 'output'; respuesta: string[] } | { tipo: 'codigo'; respuesta: string };

      if (isPython && casos.length > 0) {
        const allDone = casos.every((_, i) => {
          const r = runResults[i];
          return r && r.status !== 'corriendo';
        });

        let outputs: string[];
        if (allDone) {
          outputs = casos.map((_, i) => runResults[i]?.got ?? '');
        } else {
          // El alumno no corrió Probar aún — ejecutamos automáticamente
          const runner = createDefaultRunner();
          const loadingToastId = toast.loading('Ejecutando tu código…', { duration: Infinity });
          outputs = [];
          for (const caso of casos) {
            const res = await runner.run(code, caso.input);
            outputs.push(res.error ? '' : (res.stdout ?? ''));
          }
          toast.dismiss(loadingToastId);
        }
        payload = { tipo: 'output', respuesta: outputs };
      } else {
        payload = { tipo: 'codigo', respuesta: code };
      }

      const res = await submitEjercicio(ejercicio.id, { ...payload, tiempoResolucionSeg });
      setResult(res);
      setModalOpen(true);
      if (user) {
        setUser({
          ...user,
          puntos: res.puntosActuales,
          monedas: res.monedasActuales,
          rachaEjercicios: res.rachaEjercicios,
        });
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setModalOpen(false);
    setResult(null);
    setRunResults({});
    setTerminalHistory(TERMINAL_INIT);
    setTerminalInput('');
    const now = Date.now();
    startedAtRef.current = now;
    setStartedAt(now);
  };

  const handleNext = () => {
    setModalOpen(false);
    setResult(null);
    navigate('/ejercicios');
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <Background particles={false} />

      <TopBar
        ejercicio={ejercicio ?? null} 
        startedAt={startedAt}
        loading={loading}
        onBack={() => navigate('/ejercicios')}
      />

      {loading ? (
        <LoadingState />
      ) : !ejercicio ? null : (
        <main className="relative z-10 flex-1 grid grid-cols-1 xl:grid-cols-[280px_1fr_320px] min-h-0">
          {/* LEFT — enunciado */}
          <aside
            className="px-4 sm:px-5 py-5 border-b xl:border-b-0 xl:border-r overflow-y-auto no-scrollbar"
            style={{
              borderColor: 'rgba(148,163,184,0.12)',
              background: 'rgba(17,23,38,0.5)',
              maxHeight: 'calc(100vh - 64px)',
            }}
          >
            {exerciseGuide && <EjercicioGuide guide={exerciseGuide} />}
            <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-2 mt-4">
              Enunciado Original
            </div>
            <MarkdownRenderer source={ejercicio.descripcion} />

            <RecompensaHint recompensas={ejercicio.recompensas ?? []} />
          </aside>

          {/* CENTER — editor */}
          <section className="flex flex-col min-h-0 px-4 sm:px-5 py-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="font-mono text-xs text-text-muted">
                <span className="text-accent-cyan">~/cardly/</span>
                {sanitizeFilename(ejercicio.titulo)}.{ext(ejercicio.lenguaje)}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-accent-success" style={{ boxShadow: '0 0 6px var(--color-accent-success)' }} />
              <span className="text-[11px] text-text-muted">listo</span>
            </div>

            {exerciseGuide && <EditorHint guide={exerciseGuide} />}

            <div className="flex-1 min-h-[200px] xl:min-h-0">
              <CodeEditor value={code} onChange={handleCodeChange} language={ejercicio.lenguaje} />
            </div>

            <TerminalPanel
              history={terminalHistory}
              currentInput={terminalInput}
              onInputChange={setTerminalInput}
              onSubmitInput={handleTerminalSubmit}
              onRun={handleRunTerminal}
              onReset={handleResetTerminal}
              running={terminalRunning}
              waiting={terminalWaiting}
              isPython={isPython}
            />

            {firstRunError && (
              <div
                className="mt-3 rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed"
                style={{ borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.07)' }}
              >
                <span className="font-semibold" style={{ color: '#fb7185' }}>⚠ Error de ejecución: </span>
                <span className="font-mono text-text-secondary">
                  {firstRunError.error?.split('\n')[0] ?? 'Error desconocido'}
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-4 items-center">
              <div className="text-xs text-text-muted font-mono">
                {code.split('\n').length} líneas · autosave local
              </div>

              {runSummary && (
                <RunSummaryPill summary={runSummary} engineState={runState} />
              )}

              <div className="flex-1" />

              <button
                type="button"
                aria-label="Limpiar código del editor"
                onClick={() => setConfirmClearOpen(true)} // <-- AHORA SOLO ABRE EL MODAL
                disabled={submitting || runState !== 'idle'}
                className="px-4 py-2.5 rounded-[10px] border text-text-secondary text-sm font-medium transition-colors hover:bg-white/5 disabled:opacity-60"
                style={{ borderColor: 'rgba(139,92,246,0.18)' }}
              >
                Limpiar
              </button>

              <button
                type="button"
                onClick={handleRun}
                disabled={
                  submitting ||
                  runState !== 'idle' ||
                  code.trim().length === 0 ||
                  casos.length === 0 ||
                  !isPython
                }
                title={
                  !isPython
                    ? 'Probar solo está disponible para Python por ahora'
                    : `Corre tu código contra los ${casos.length} casos de prueba oficiales y muestra ✓/✕`
                }
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] text-sm font-semibold border transition-colors hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'rgba(34,211,238,0.4)',
                  color: 'var(--color-accent-cyan)',
                  background: 'rgba(34,211,238,0.06)',
                }}
              >
                {runState === 'loading-engine' ? (
                  <>
                    <IconSpinner size={14} className="animate-spin" />
                    Cargando Python…
                  </>
                ) : runState === 'running' ? (
                  <>
                    <IconSpinner size={14} className="animate-spin" />
                    Probando casos…
                  </>
                ) : (
                  <>
                    <IconPlay size={12} />
                    Probar contra casos
                    <span className="text-text-muted font-normal">
                      ({casos.length})
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || runState !== 'idle' || code.trim().length === 0}
                className="shimmer inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
                  boxShadow:
                    '0 4px 24px -8px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                }}
              >
                {submitting ? (
                  <>
                    <IconSpinner size={14} className="animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <>
                    Enviar solución
                    <IconChevR size={12} />
                  </>
                )}
              </button>
            </div>
          </section>

          {/* RIGHT — casos de prueba */}
          <aside
            className="px-4 sm:px-5 py-5 border-t xl:border-t-0 xl:border-l overflow-y-auto no-scrollbar"
            style={{
              borderColor: 'rgba(148,163,184,0.12)',
              background: 'rgba(17,23,38,0.5)',
              maxHeight: 'calc(100vh - 64px)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">
                Casos de prueba
              </div>
              <div className="text-[11px] text-text-muted">{casos.length} caso{casos.length === 1 ? '' : 's'}</div>
            </div>
            <div
              className="mb-3 rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed text-text-secondary"
              style={{
                borderColor: 'rgba(34,211,238,0.18)',
                background: 'rgba(34,211,238,0.06)',
              }}
            >
              <span className="font-semibold text-accent-cyan">Cómo se prueba:</span>{' '}
              {exerciseGuide?.pruebaTexto ?? 'Cada input de prueba se envía automáticamente a tu programa cuando presionas Probar.'}
            </div>
            <div className="flex flex-col gap-2.5">
              {casos.map((c, i) => (
                <CasoPruebaCard key={i} idx={i} caso={c} result={runResults[i]} />
              ))}
            </div>

            {!isPython && (
              <div className="mt-3 text-[11px] text-text-muted px-2 py-2 rounded-md border border-dashed"
                   style={{ borderColor: 'rgba(148,163,184,0.18)' }}>
                💡 <strong>Probar</strong> solo está disponible para ejercicios de Python por ahora.
              </div>
            )}
  {/* NUEVO: Modal de Confirmación de Limpieza (Fail-Safe) */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
            style={{
              background: 'rgba(17,23,38,0.95)', // Fondo oscuro propio de Cardly
              borderColor: 'rgba(244,63,94,0.3)', // Borde ligeramente rojo (alerta)
            }}
          >
            <h3 className="text-lg font-bold text-white mb-2">¿Borrar todo el código?</h3>
            <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">
              Esta acción eliminará todo tu progreso actual en el editor. No podrás deshacerlo. ¿Estás seguro?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 rounded-[10px] text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 transition-colors border border-transparent"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setCode(PY_INITIAL);
                  setConfirmClearOpen(false);
                }}
                className="px-4 py-2 rounded-[10px] text-sm font-semibold text-white transition-colors"
                style={{ background: '#e11d48' }} // Color rojo (rose-600) para acciones destructivas
              >
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}

          </aside>
        </main>
      )}
      
      <ResultModal
        open={modalOpen}
        result={result}
        casos={casos}
        onClose={() => setModalOpen(false)}
        onRetry={handleRetry}
        onNext={handleNext}
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TopBar
// ────────────────────────────────────────────────────────────

function TopBar({
  ejercicio,
  startedAt,
  loading,
  onBack,
}: {
  ejercicio: EjercicioDetail | null;
  startedAt: number;
  loading: boolean;
  onBack: () => void;
}) {
  // Mantiene viva la cuenta — sin desconectar de Cronometro porque ése
  // re-renderiza su propio segundo. Aquí solo lo usamos para keepalive ligero.
  useElapsedSeconds(startedAt);

  return (
    <header
      className="relative z-20 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 border-b backdrop-blur-md"
      style={{
        borderBottomColor: 'rgba(148,163,184,0.12)',
        background: 'rgba(10,14,26,0.85)',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
        style={{ borderColor: 'rgba(139,92,246,0.18)' }}
      >
        ← <span className="hidden sm:inline">Volver</span>
      </button>

      <div className="hidden sm:block w-px h-5" style={{ background: 'rgba(148,163,184,0.12)' }} />
      <div className="hidden sm:block">
        <Logo size={24} showText={false} />
      </div>
      <div className="hidden sm:block w-px h-5" style={{ background: 'rgba(148,163,184,0.12)' }} />

      <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 flex-wrap">
        {loading ? (
          <div className="text-sm text-text-muted">Cargando ejercicio…</div>
        ) : ejercicio ? (
          <>
            <h1 className="text-base sm:text-[17px] font-bold m-0 truncate">{ejercicio.titulo}</h1>
            <DifficultyBadge dif={ejercicio.dificultad} />
            <LangBadge lang={ejercicio.lenguaje} />
            {ejercicio.modulo && (
              <span className="text-xs text-text-muted hidden md:inline">· {ejercicio.modulo.titulo}</span>
            )}
          </>
        ) : null}
      </div>

      <Cronometro startedAt={startedAt} />
    </header>
  );
}


// ────────────────────────────────────────────────────────────
// EjercicioGuide — guía clara de input/output para el estudiante
// ────────────────────────────────────────────────────────────

function EjercicioGuide({ guide }: { guide: ExerciseGuideModel }) {
  return (
    <div className="flex flex-col gap-4">
      <InfoBlock title="Enunciado">
        <p className="text-[13px] text-text-secondary leading-relaxed m-0 whitespace-pre-line">
          {guide.descripcion}
        </p>
      </InfoBlock>

      <InfoBlock title="Entrada">
        <p className="text-[12px] text-text-secondary leading-relaxed m-0">
          {guide.entradaTexto}
        </p>
        {guide.ejemplo && (
          <MiniCode label="Ejemplo de input" tone="input" value={guide.ejemplo.input} />
        )}
      </InfoBlock>

      <InfoBlock title="Salida esperada">
        <p className="text-[12px] text-text-secondary leading-relaxed m-0">
          {guide.salidaTexto}
        </p>
        {guide.ejemplo && (
          <MiniCode label="Ejemplo de output" tone="output" value={guide.ejemplo.outputEsperado} />
        )}
      </InfoBlock>
    </div>
  );
}

function EditorHint({ guide }: { guide: ExerciseGuideModel }) {
  return (
    <div
      className="mb-3 rounded-xl border px-3 py-2.5 text-[12px] leading-relaxed"
      style={{
        borderColor: 'rgba(139,92,246,0.2)',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.10), rgba(34,211,238,0.05))',
      }}
    >
      <div className="font-semibold text-text-primary mb-1">Escribe aquí tu solución</div>
      <div className="text-text-secondary">
        {guide.editorTexto}
        {guide.ejemplo && (
          <span>
            {' '}Por ejemplo, si el input es <code className="font-mono text-accent-success">{guide.ejemplo.inputInline}</code>,
            el output esperado es <code className="font-mono text-accent-gold">{guide.ejemplo.outputInline}</code>.
          </span>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-2">
        {title}
      </div>
      {children}
    </section>
  );
}

function MiniCode({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'input' | 'output';
}) {
  const color = tone === 'input' ? 'var(--color-accent-success)' : 'var(--color-accent-gold)';
  const bg = tone === 'input' ? 'rgba(16,185,129,0.08)' : 'rgba(251,191,36,0.08)';
  return (
    <div className="mt-2">
      <div className="text-[10px] font-mono text-text-muted mb-1">{label}</div>
      <div
        className="font-mono text-xs rounded px-2 py-1.5 whitespace-pre-wrap break-words"
        style={{ background: bg, color }}
      >
        {value}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// RecompensaHint
// ────────────────────────────────────────────────────────────

//  Patrón Factory 
function RecompensaUIFactory({ recompensa }: { recompensa: RecompensaSpec }) {
  switch (recompensa.tipo) {
    case 'PUNTOS':
      return <Row icon={<IconBolt size={14} />} color="#a78bfa" label="Puntos" value={`+${recompensa.cantidad}`} prob={recompensa.probabilidad} />;
    case 'MONEDAS':
      return <Row icon={<IconFlame size={14} />} color="#fbbf24" label="Monedas" value={`+${recompensa.cantidad}`} prob={recompensa.probabilidad} />;
    case 'CARTA':
      return <Row icon={<IconCard size={14} />} color="#c084fc" label="Carta aleatoria" value={`x${recompensa.cantidad}`} prob={recompensa.probabilidad} />;
    default:
      console.warn(`Tipo de recompensa no soportado por la fábrica: ${recompensa.tipo}`);
      return null;
  }
}



function RecompensaHint({ recompensas }: { recompensas: RecompensaSpec[] }) {
  if (recompensas.length === 0) return null;

  return (
    <div className="mt-5">
      <div className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-2">
        Recompensa posible
      </div>
      <div
        className="rounded-xl p-3 border"
        style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(245,158,11,0.05))',
          borderColor: 'rgba(168,85,247,0.35)',
        }}
      >
        <div className="flex flex-col gap-1.5 text-xs">
          {/* El cliente solo itera y delega la creación a la Fábrica */}
          {recompensas.map((rec, index) => (
            <RecompensaUIFactory key={index} recompensa={rec} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  color,
  label,
  value,
  prob,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  prob: string;
}) {
  const pct = Math.round(Number(prob) * 100);
  return (
    <div className="flex items-center gap-2">
      <span style={{ color }}>{icon}</span>
      <span className="text-text-secondary flex-1">{label}</span>
      <span className="font-mono font-semibold" style={{ color }}>{value}</span>
      <span className="text-text-muted text-[10px]">{pct}%</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// RunSummaryPill — chip con conteo "N/M ✓" del run local
// ────────────────────────────────────────────────────────────

function RunSummaryPill({
  summary,
  engineState,
}: {
  summary: { ok: number; fail: number; errs: number; corriendo: number; total: number };
  engineState: 'idle' | 'loading-engine' | 'running';
}) {
  const allOk = summary.ok === summary.total && summary.fail === 0 && summary.errs === 0;
  const color = allOk
    ? 'var(--color-accent-success)'
    : summary.errs > 0
    ? '#fb7185'
    : summary.fail > 0
    ? '#fbbf24'
    : 'var(--color-accent-cyan)';

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold"
      style={{
        background: `${color}15`,
        borderColor: `${color}40`,
        color,
      }}
    >
      {engineState !== 'idle' ? '⟳ ' : allOk ? '✓ ' : '· '}
      <span className="font-mono tabular-nums">
        {summary.ok}/{summary.total}
      </span>
      <span className="text-text-muted font-normal">
        {summary.errs > 0 ? `· ${summary.errs} error${summary.errs === 1 ? '' : 'es'}` : ''}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TerminalPanel — terminal interactiva con historial
// ────────────────────────────────────────────────────────────

const LINE_COLOR: Record<TerminalLine['kind'], string> = {
  system: 'rgba(148,163,184,0.45)',
  stdin:  '#22d3ee',
  stdout: '#34d399',
  error:  '#fb7185',
};

function TerminalPanel({
  history,
  currentInput,
  onInputChange,
  onSubmitInput,
  onRun,
  onReset,
  running,
  waiting,
  isPython,
}: {
  history: TerminalLine[];
  currentInput: string;
  onInputChange: (v: string) => void;
  onSubmitInput: () => void;
  onRun: () => void;
  onReset: () => void;
  running: boolean;
  waiting: boolean;
  isPython: boolean;
}) {
  const [open, setOpen] = React.useState(true);
  const historyRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // Foco automático cuando el programa pide input
  React.useEffect(() => {
    if (waiting) inputRef.current?.focus();
  }, [waiting]);

  return (
    <div
      className="mt-3 rounded-xl border overflow-hidden"
      style={{ borderColor: 'rgba(148,163,184,0.12)', background: '#060b17' }}
    >
      {/* Barra de título */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b select-none"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(239,68,68,0.55)' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(251,191,36,0.55)' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(52,211,153,0.55)' }} />
        </div>
        <span className="flex-1 text-center text-[11px] font-mono text-text-muted -ml-12">Terminal</span>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onReset} className="text-[11px] text-text-muted hover:text-text-primary transition-colors">
            ↺ limpiar
          </button>
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-[11px] text-text-muted hover:text-text-primary transition-colors">
            {open ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {open && (
        <>
          {/* Historial */}
          <div
            ref={historyRef}
            className="px-3 py-2.5 font-mono text-[12px] leading-5 overflow-y-auto"
            style={{ minHeight: 80, maxHeight: 220 }}
          >
            {history.map((line, i) => (
              <div key={i}>
                {line.kind === 'stdin' && <span style={{ color: 'rgba(148,163,184,0.3)' }}>{'> '}</span>}
                <span style={{ color: LINE_COLOR[line.kind] }}>{line.text}</span>
              </div>
            ))}
            {/* Cursor parpadeante mientras ejecuta (no esperando) */}
            {running && !waiting && (
              <span className="animate-pulse" style={{ color: '#34d399' }}>█</span>
            )}
          </div>

          {/* Barra de input — solo activa cuando el programa espera */}
          <div
            className="flex items-center border-t"
            style={{
              borderColor: waiting ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.06)',
              background: waiting ? 'rgba(34,211,238,0.03)' : 'transparent',
              transition: 'all 0.15s',
            }}
          >
            <span
              className="px-3 font-mono text-[13px] font-bold"
              style={{ color: waiting ? '#22d3ee' : 'rgba(148,163,184,0.25)' }}
            >
              {'>'}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmitInput(); } }}
              disabled={!waiting}
              placeholder={
                !isPython         ? 'Solo disponible para Python' :
                running && !waiting ? 'Ejecutando…' :
                waiting            ? 'Escribe y presiona Enter…' :
                                     'Presiona ▶ Ejecutar para comenzar'
              }
              className="flex-1 bg-transparent font-mono text-[12px] outline-none py-2.5 text-text-primary disabled:opacity-30"
              style={{ caretColor: '#22d3ee' }}
            />
            {waiting ? (
              <button
                type="button"
                onClick={onSubmitInput}
                disabled={!currentInput.trim()}
                className="px-4 py-2.5 font-mono text-[11px] font-semibold border-l transition-colors disabled:opacity-30"
                style={{ borderColor: 'rgba(34,211,238,0.3)', color: '#22d3ee', background: 'rgba(34,211,238,0.06)' }}
              >
                Enter ↵
              </button>
            ) : (
              <button
                type="button"
                onClick={onRun}
                disabled={running || !isPython}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-l transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  color: 'var(--color-accent-cyan)',
                  background: 'rgba(34,211,238,0.05)',
                }}
              >
                {running
                  ? <><IconSpinner size={10} className="animate-spin" />Ejecutando…</>
                  : <><IconPlay size={10} />Ejecutar</>}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="relative z-10 flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <IconSpinner size={28} className="animate-spin text-accent-cyan" />
        <div className="text-sm text-text-secondary">Preparando arena…</div>
      </div>
    </div>
  );
}

function sanitizeFilename(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'ejercicio';
}

function ext(lang: string): string {
  const l = lang.toLowerCase();
  if (l.startsWith('py')) return 'py';
  if (l === 'javascript' || l === 'js') return 'js';
  if (l === 'typescript' || l === 'ts') return 'ts';
  if (l === 'java') return 'java';
  if (l === 'cpp' || l === 'c++') return 'cpp';
  if (l === 'c') return 'c';
  return 'txt';
}
