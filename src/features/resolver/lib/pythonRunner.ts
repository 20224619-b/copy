// Pyodide runner — ejecuta Python en el navegador con stdin/stdout capturados.
//
// Diseño:
// - Loader lazy: se carga el script de CDN solo en el primer uso (~6 MB la primera vez)
// - Singleton: una sola instancia de pyodide reutilizada
// - Cada ejecución corre el código del usuario en un namespace aislado (`exec(code, {})`)
//   para no contaminar globals entre tests
// - stdout/stderr se capturan vía StringIO; stdin se inyecta como StringIO con
//   el input del caso
//
// Limitaciones conocidas:
// - Solo Python (3.12 que trae Pyodide v0.26)
// - Sin timeout — un loop infinito cuelga la pestaña (TODO: interruptBuffer con
//   SharedArrayBuffer si configuramos los headers CORS apropiados)
// - input() multi-línea funciona via StringIO; cada `input()` consume una línea

const PYODIDE_VERSION = 'v0.26.4';
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full`;

interface PyodideInstance {
  runPython(code: string): unknown;
  globals: {
    set(name: string, value: unknown): void;
    get(name: string): unknown;
  };
}

interface PyodideLoader {
  (options?: { indexURL?: string }): Promise<PyodideInstance>;
}

declare global {
  interface Window {
    loadPyodide?: PyodideLoader;
  }
}

export interface RunResult {
  stdout: string;
  stderr: string;
  /** Mensaje de la excepción si el código del usuario lanzó una. */
  error: string | null;
  /** Milisegundos de ejecución, añadido por TimingDecorator si está en la cadena. */
  elapsedMs?: number;
}

/** Contrato que deben cumplir el runner base y todos sus decoradores. */
export interface IPythonRunner {
  run(code: string, stdin: string): Promise<RunResult>;
}

/** Implementación concreta que delega en la función runPython. */
export class BasePythonRunner implements IPythonRunner {
  run(code: string, stdin: string): Promise<RunResult> {
    return runPython(code, stdin);
  }
}

let pyodideCache: Promise<PyodideInstance> | null = null;

/**
 * Carga Pyodide on-demand. La primera llamada inyecta el script de CDN y
 * espera la inicialización (~3-5 s). Las siguientes llamadas devuelven la
 * misma instancia inmediatamente.
 */
export function getPyodide(): Promise<PyodideInstance> {
  if (pyodideCache) return pyodideCache;

  pyodideCache = (async () => {
    // 1. Inyectar el <script> del CDN (idempotente)
    if (typeof window.loadPyodide !== 'function') {
      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-pyodide]');
        if (existing) {
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => reject(new Error('Pyodide script load failed')), { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src = `${PYODIDE_CDN}/pyodide.js`;
        script.async = true;
        script.dataset.pyodide = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar Pyodide desde CDN'));
        document.head.appendChild(script);
      });
    }
    if (typeof window.loadPyodide !== 'function') {
      throw new Error('Pyodide script cargó pero loadPyodide no está disponible');
    }
    // 2. Inicializar Pyodide
    return window.loadPyodide({ indexURL: `${PYODIDE_CDN}/` });
  })();

  // Si falla, permitir un reintento futuro
  pyodideCache.catch(() => {
    pyodideCache = null;
  });

  return pyodideCache;
}

/**
 * Ejecuta el código del usuario con un stdin dado y devuelve lo que imprimió
 * por stdout + cualquier error de runtime.
 *
 * El código corre en un namespace nuevo cada vez, así que no hay leak entre
 * casos de prueba consecutivos.
 */
export async function runPython(code: string, stdin: string): Promise<RunResult> {
  const py = await getPyodide();

  py.globals.set('__user_code', code);
  py.globals.set('__user_stdin', stdin);

  py.runPython(`
import sys
import builtins
from io import StringIO

__orig_stdin = sys.stdin
__orig_stdout = sys.stdout
__orig_stderr = sys.stderr
__orig_input = builtins.input

sys.stdin = StringIO(__user_stdin)
sys.stdout = StringIO()
sys.stderr = StringIO()

# Parche: input(prompt) NO escribe el prompt en stdout (a diferencia de CPython).
# Esto evita que ejercicios estilo "Lee N e imprime par/impar" rompan al usar
# input("texto: ") porque el prompt contaminaria el output esperado.
# Lee del stdin inyectado linea por linea. Si no hay mas lineas, EOFError como
# en Python normal.
def __cardly_input(prompt=''):
    line = sys.stdin.readline()
    if line == '':
        raise EOFError('EOF when reading a line')
    # readline conserva el \\n final; lo quitamos como hace input()
    return line.rstrip('\\n').rstrip('\\r')
builtins.input = __cardly_input

__error = None
try:
    __ns = {'__name__': '__main__'}
    exec(__user_code, __ns)
except SystemExit:
    pass
except BaseException as __e:
    __error = type(__e).__name__ + ': ' + str(__e)

__stdout_result = sys.stdout.getvalue()
__stderr_result = sys.stderr.getvalue()

sys.stdin = __orig_stdin
sys.stdout = __orig_stdout
sys.stderr = __orig_stderr
builtins.input = __orig_input
`);

  const stdout = String(py.globals.get('__stdout_result') ?? '');
  const stderr = String(py.globals.get('__stderr_result') ?? '');
  const errorRaw = py.globals.get('__error');
  let error = typeof errorRaw === 'string' ? errorRaw : null;

  // Reescribir EOFError con un mensaje amigable: pasa cuando el codigo del
  // alumno llama a input() mas veces que las lineas que tiene el stdin.
  if (error && error.startsWith('EOFError')) {
    const lineCount = stdin === '' ? 0 : stdin.split('\n').filter((l, i, arr) => i < arr.length - 1 || l !== '').length;
    error = [
      'EOFError: tu codigo intento leer otra linea de input() pero la entrada ya se acabo.',
      `(la entrada tenia ${lineCount} linea${lineCount === 1 ? '' : 's'})`,
      '',
      'Causas comunes:',
      '- Llamas a input() mas veces de las que hay lineas en la entrada.',
      '- Los datos vienen en una sola linea separados por espacios y necesitas un solo input() + .split().',
    ].join('\n');
  }

  // Limpieza de globals para no acumular basura entre runs
  py.runPython(
    'for __k in ("__user_code","__user_stdin","__stdout_result","__stderr_result","__error","__ns","__orig_stdin","__orig_stdout","__orig_stderr","__orig_input","__cardly_input"):\n    globals().pop(__k, None)\ndel __k',
  );

  return { stdout, stderr, error };
}

const INTERACTIVE_SETUP = `
import sys, builtins
from io import StringIO

class __NeedInput__(Exception):
    pass

_inputs = list(__user_inputs)
_input_idx = 0
_stdout = StringIO()
_stderr = StringIO()
__orig_out = sys.stdout
__orig_err = sys.stderr
sys.stdout = _stdout
sys.stderr = _stderr

def __cardly_input(prompt=''):
    global _input_idx
    if _input_idx >= len(_inputs):
        raise __NeedInput__(str(prompt))
    val = _inputs[_input_idx]
    _input_idx += 1
    return val

builtins.input = __cardly_input
__error = None
__need_prompt = None

try:
    __ns = {'__name__': '__main__'}
    exec(__user_code, __ns)
except __NeedInput__ as __e:
    __need_prompt = __e.args[0] if __e.args else ''
except SystemExit:
    pass
except BaseException as __e:
    __error = type(__e).__name__ + ': ' + str(__e)

__stdout_val = _stdout.getvalue()
__stderr_val = _stderr.getvalue()
sys.stdout = __orig_out
sys.stderr = __orig_err
`;

const INTERACTIVE_CLEANUP =
  'for __k in ["__user_inputs","__user_code","__stdout_val","__stderr_val","__error","__need_prompt","__ns","_inputs","_input_idx","_stdout","_stderr","__orig_out","__orig_err","__cardly_input","__NeedInput__"]:\n    globals().pop(__k,None)\ndel __k';

/**
 * Ejecuta código de forma interactiva: cada vez que Python llama a input(),
 * se llama a `callbacks.requestInput` y se pausa hasta que el usuario escribe.
 * El output nuevo (delta desde la iteración anterior) se entrega vía `callbacks.onOutput`.
 */
export async function runInteractive(
  code: string,
  callbacks: {
    onOutput: (text: string) => void;
    requestInput: (prompt: string) => Promise<string>;
  },
): Promise<{ error: string | null }> {
  const py = await getPyodide();
  const inputs: string[] = [];
  let shownUpTo = 0;

  while (true) {
    py.globals.set('__user_inputs', inputs);
    py.globals.set('__user_code', code);
    py.runPython(INTERACTIVE_SETUP);

    const needPrompt  = py.globals.get('__need_prompt');
    const stdoutFull  = String(py.globals.get('__stdout_val') ?? '');
    const errorRaw    = py.globals.get('__error');
    const error       = typeof errorRaw === 'string' ? errorRaw : null;

    py.runPython(INTERACTIVE_CLEANUP);

    // Emitir solo la parte nueva del stdout
    const newOut = stdoutFull.slice(shownUpTo);
    if (newOut) callbacks.onOutput(newOut);

    if (typeof needPrompt === 'string') {
      shownUpTo = stdoutFull.length;
      const value = await callbacks.requestInput(needPrompt);
      inputs.push(value);
      continue;
    }

    return { error };
  }
}

/** Normaliza output para comparación: trim final + colapsa whitespace por linea. */
export function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}

export function outputsMatch(a: string, b: string): boolean {
  return normalizeOutput(a) === normalizeOutput(b);
}
