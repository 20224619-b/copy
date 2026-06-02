// Patrón Decorator (Estructural) sobre IPythonRunner.
//
// Cadena predeterminada:
//   TimingDecorator
//     → StdinNormalizerDecorator
//       → BasePythonRunner (llama a runPython/Pyodide)
//
// Para añadir un nuevo comportamiento: crear una clase que extienda
// PythonRunnerDecorator, envolver el runner en createDefaultRunner y listo.
// El código que llama a runner.run() no necesita cambiar.

import type { IPythonRunner, RunResult } from './pythonRunner';
import { BasePythonRunner } from './pythonRunner';

// ── Clase base abstracta ──────────────────────────────────────────────────────

export abstract class PythonRunnerDecorator implements IPythonRunner {
  constructor(protected readonly wrapped: IPythonRunner) {}
  abstract run(code: string, stdin: string): Promise<RunResult>;
}

// ── Decorador 1: normalización de stdin ───────────────────────────────────────
//
// Recorta espacios al final de cada línea y las líneas vacías finales.
// Evita EOFError inesperado cuando el alumno copia-pega en la Consola
// y la entrada queda con espacios invisibles o saltos de línea extra.

export class StdinNormalizerDecorator extends PythonRunnerDecorator {
  async run(code: string, stdin: string): Promise<RunResult> {
    const normalized = stdin
      .split('\n')
      .map((l) => l.trimEnd())
      .join('\n')
      .replace(/\n+$/, '');
    return this.wrapped.run(code, normalized);
  }
}

// ── Decorador 2: medición de tiempo de ejecución ─────────────────────────────
//
// Mide cuántos milisegundos tarda la ejecución completa del código del alumno
// y añade el campo `elapsedMs` al resultado. El runner base no sabe de timing;
// el decorador lo agrega de forma transparente sin modificar RunResult base.

export class TimingDecorator extends PythonRunnerDecorator {
  async run(code: string, stdin: string): Promise<RunResult> {
    const t0 = performance.now();
    const result = await this.wrapped.run(code, stdin);
    return { ...result, elapsedMs: Math.round(performance.now() - t0) };
  }
}

// ── Composición predeterminada ────────────────────────────────────────────────
//
// Ensambla la cadena completa. Llamar esta función una vez por evento "Probar"
// o "Ejecutar" es suficiente — Pyodide en sí es un singleton (ver pythonRunner.ts).

export function createDefaultRunner(): IPythonRunner {
  return new TimingDecorator(
    new StdinNormalizerDecorator(
      new BasePythonRunner()
    )
  );
}
