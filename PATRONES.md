# Patrones de diseño en `features/resolver`

> Documentación técnica de los tres patrones GoF aplicados en el feature Resolver de Cardly.
> Audiencia: desarrolladores del equipo que necesiten extender o mantener este módulo.

---

## Índice

1. [Contexto](#1-contexto)
2. [Factory (Creacional)](#2-factory-creacional--recompensauifactory)
3. [Builder (Creacional)](#3-builder-creacional--exerciseguidebuilder)
4. [Decorator (Estructural)](#4-decorator-estructural--pythonrunnerdecorators)
5. [Cómo interactúan los tres patrones](#5-cómo-interactúan-los-tres-patrones)
6. [Cómo extender cada patrón](#6-cómo-extender-cada-patrón)

---

## 1. Contexto

La pantalla Resolver (`/ejercicios/:id`) es la más densa del proyecto. Combina:

- Carga y caché de datos del ejercicio (SWR).
- Un editor de código con highlight Python.
- Ejecución local del código del alumno con Pyodide (WASM en el navegador).
- Evaluación de casos de prueba y feedback visual por caso.
- Una consola libre para experimentar con inputs propios.
- Envío al back y modal de resultado.

Para mantener la pantalla legible y cada pieza mantenible por separado se aplicaron tres patrones de diseño clásicos del _Gang of Four_.

---

## 2. Factory (Creacional) — `RecompensaUIFactory`

### Archivo

`src/features/resolver/ResolverPage.tsx` — función `RecompensaUIFactory`

### Problema que resuelve

El back puede devolver recompensas de distintos tipos (`PUNTOS`, `MONEDAS`, `CARTA`). Sin el patrón, el componente que lista las recompensas tendría un `if/else` o `switch` mezclado con JSX de renderizado. Agregar un tipo nuevo obligaría a editar el componente de presentación.

### Implementación

```tsx
function RecompensaUIFactory({ recompensa }: { recompensa: RecompensaSpec }) {
  switch (recompensa.tipo) {
    case 'PUNTOS':
      return <Row icon={<IconBolt />} color="#a78bfa" label="Puntos" ... />;
    case 'MONEDAS':
      return <Row icon={<IconFlame />} color="#fbbf24" label="Monedas" ... />;
    case 'CARTA':
      return <Row icon={<IconCard />} color="#c084fc" label="Carta aleatoria" ... />;
    default:
      console.warn(`Tipo no soportado: ${recompensa.tipo}`);
      return null;
  }
}
```

El cliente solo itera y delega:

```tsx
{recompensas.map((rec, i) => (
  <RecompensaUIFactory key={i} recompensa={rec} />
))}
```

### Por qué funciona aquí

- **Abierto/Cerrado:** para añadir el tipo `EXPERIENCIA`, solo se añade un `case` en la fábrica. El bucle del cliente no cambia.
- **Separación de responsabilidades:** la lógica de "¿qué icono/color corresponde a este tipo?" vive en un único lugar.
- El `console.warn` en `default` es un contrato explícito: si el back introduce un tipo nuevo y el front no lo conoce, el error es visible en desarrollo.

---

## 3. Builder (Creacional) — `ExerciseGuideBuilder`

### Archivos

- Builder: `src/features/resolver/builders/exerciseGuideBuilder.ts`
- Uso: `ResolverPage.tsx` — `useMemo` que construye `exerciseGuide`

### Problema que resuelve

El enunciado visible para el alumno (textos de "Entrada", "Salida", "Editor", "Cómo se prueba", ejemplo inline) se deriva de los datos del ejercicio. Sin el patrón, `ResolverPage` mezclaría esa lógica derivada con el renderizado. El resultado sería una pantalla larga con condicionales dispersos.

### Implementación

```typescript
// exerciseGuideBuilder.ts
export class ExerciseGuideBuilder {
  private readonly guide: ExerciseGuideModel;

  private constructor(ejercicio: EjercicioDetail) {
    this.guide = { /* valores por defecto */ };
  }

  static create(ejercicio: EjercicioDetail) {
    return new ExerciseGuideBuilder(ejercicio);
  }

  withExample(caso?: CasoPrueba) {
    // si hay un caso, deriva inputInline / outputInline para los hints
    return this;
  }

  withLanguageRules() {
    // textos específicos según el lenguaje del ejercicio
    return this;
  }

  build(): ExerciseGuideModel {
    return { ...this.guide };
  }
}
```

Uso en `ResolverPage`:

```tsx
const exerciseGuide = useMemo<ExerciseGuideModel | null>(() => {
  if (!ejercicio) return null;
  return ExerciseGuideBuilder
    .create(ejercicio)
    .withExample(casos[0])
    .withLanguageRules()
    .build();
}, [ejercicio, casos]);
```

### Por qué funciona aquí

- **API fluida:** cada `with*` devuelve `this`, permitiendo encadenar pasos sin variables intermedias.
- **Construcción progresiva:** el `exerciseGuide` final solo existe después de `.build()`, que devuelve una copia inmutable.
- **Separación limpia:** los componentes `EjercicioGuide` y `EditorHint` solo leen `ExerciseGuideModel`; no saben de dónde vienen los textos ni cómo se derivan.
- **Extensible:** añadir `withDifficultyHint()` o `withModuleContext()` no requiere cambiar los componentes visuales.

---

## 4. Decorator (Estructural) — `pythonRunnerDecorators.ts`

### Archivos

- Interfaz + clase base: `src/features/resolver/lib/pythonRunner.ts`
- Decoradores: `src/features/resolver/lib/pythonRunnerDecorators.ts`
- Uso: `ResolverPage.tsx` (botón ▶ Probar) y `ConsolaPanel.tsx` (Consola libre)

### Problema que resuelve

El runner base (`runPython`) tiene una responsabilidad única: ejecutar código Python en Pyodide y capturar stdout/stderr. Sin embargo, los distintos puntos de uso necesitan comportamientos adicionales:

- **Normalizar el stdin** antes de pasarlo a Pyodide (evita EOFError por espacios invisibles que el alumno copió-pegó en la Consola).
- **Medir el tiempo de ejecución** para mostrarlo al alumno (`142 ms` por caso en `CasoPruebaCard`, `38 ms` en el panel de la Consola).

Añadir estos comportamientos directamente a `runPython` mezclaría responsabilidades. Usar herencia crearía una jerarquía frágil. El Decorator los añade de forma componible sin tocar el código base.

### Interfaz y clase base

```typescript
// pythonRunner.ts

export interface RunResult {
  stdout: string;
  stderr: string;
  error: string | null;
  elapsedMs?: number;     // añadido transparentemente por TimingDecorator
}

export interface IPythonRunner {
  run(code: string, stdin: string): Promise<RunResult>;
}

export class BasePythonRunner implements IPythonRunner {
  run(code: string, stdin: string): Promise<RunResult> {
    return runPython(code, stdin);   // delega en la función existente
  }
}
```

### Clase abstracta base de decorador

```typescript
// pythonRunnerDecorators.ts

export abstract class PythonRunnerDecorator implements IPythonRunner {
  constructor(protected readonly wrapped: IPythonRunner) {}
  abstract run(code: string, stdin: string): Promise<RunResult>;
}
```

Cualquier decorador que extienda esta clase:
1. Recibe el `wrapped` (el siguiente eslabón de la cadena) en el constructor.
2. En su `run()` puede transformar los argumentos antes de llamar a `this.wrapped.run()`, o transformar el resultado después.

### Decorador 1 — `StdinNormalizerDecorator`

```typescript
export class StdinNormalizerDecorator extends PythonRunnerDecorator {
  async run(code: string, stdin: string): Promise<RunResult> {
    const normalized = stdin
      .split('\n')
      .map((l) => l.trimEnd())   // elimina espacios finales por línea
      .join('\n')
      .replace(/\n+$/, '');      // elimina líneas vacías al final
    return this.wrapped.run(code, normalized);
  }
}
```

**Cuándo actúa:** transforma el **input** antes de pasarlo al siguiente eslabón. El runner base nunca sabe si el stdin fue normalizado o no.

### Decorador 2 — `TimingDecorator`

```typescript
export class TimingDecorator extends PythonRunnerDecorator {
  async run(code: string, stdin: string): Promise<RunResult> {
    const t0 = performance.now();
    const result = await this.wrapped.run(code, stdin);
    return { ...result, elapsedMs: Math.round(performance.now() - t0) };
  }
}
```

**Cuándo actúa:** envuelve la llamada hacia el siguiente eslabón y transforma el **resultado** añadiendo `elapsedMs`. El runner base no sabe que está siendo cronometrado.

### Composición — `createDefaultRunner`

```typescript
export function createDefaultRunner(): IPythonRunner {
  return new TimingDecorator(
    new StdinNormalizerDecorator(
      new BasePythonRunner()
    )
  );
}
```

La cadena de ejecución para cada llamada a `runner.run(code, stdin)`:

```
TimingDecorator.run()
  → inicia t0
  → StdinNormalizerDecorator.run()
      → normaliza stdin
      → BasePythonRunner.run()
          → runPython() → Pyodide → resultado
      ← RunResult base
  ← RunResult base (con stdin limpio)
  → añade elapsedMs
← RunResult final  { stdout, stderr, error, elapsedMs }
```

### Uso en los componentes

```tsx
// ResolverPage.tsx — botón ▶ Probar
const runner = createDefaultRunner();
const res = await runner.run(code, caso.input);
// res.elapsedMs está disponible → se propaga a CasoPruebaCard

// ConsolaPanel.tsx — botón Ejecutar
const runner = createDefaultRunner();
const res = await runner.run(code, stdin);
// res.elapsedMs se muestra como "38 ms" en la cabecera del panel
```

### Por qué funciona aquí

- **Responsabilidad única:** `runPython` solo ejecuta Python. Los decoradores se ocupan de normalización y timing.
- **Abierto/Cerrado:** añadir un decorador `EofGuardDecorator` (que cuente líneas de input vs llamadas a `input()` esperadas) no requiere modificar ni el runner base ni los decoradores existentes.
- **Componible:** el orden de la cadena importa. `StdinNormalizerDecorator` debe ir antes de `BasePythonRunner` para que el stdin llegue limpio a Pyodide. `TimingDecorator` va al exterior para medir el tiempo total incluyendo la normalización.
- **Transparente para el llamador:** `ResolverPage` y `ConsolaPanel` solo conocen `IPythonRunner`. Podrían recibir un runner con más o menos decoradores sin cambiar su código.

---

## 5. Cómo interactúan los tres patrones

```
ResolverPage
│
├── useMemo → ExerciseGuideBuilder          (Builder: construye ExerciseGuideModel)
│               .create(ejercicio)
│               .withExample(casos[0])
│               .withLanguageRules()
│               .build()
│
├── render → <RecompensaHint recompensas={...}>
│               └── recompensas.map(r => <RecompensaUIFactory recompensa={r} />)
│                                          (Factory: crea el Row correcto por tipo)
│
└── handleRun → createDefaultRunner()       (Decorator: ensambla la cadena)
                  .run(code, caso.input)
                  → elapsedMs → CasoPruebaCard
```

Los tres patrones son **independientes entre sí**: el Builder no sabe de la Factory, la Factory no sabe del Decorator. Cada uno resuelve un problema distinto en el mismo feature.

---

## 6. Cómo extender cada patrón

### Añadir un tipo de recompensa nuevo

Editar solo `RecompensaUIFactory` en `ResolverPage.tsx`:

```tsx
case 'EXPERIENCIA':
  return <Row icon={<IconStar />} color="#34d399" label="Experiencia" ... />;
```

### Añadir un paso nuevo al guide del ejercicio

Añadir un método `with*` en `ExerciseGuideBuilder` y llamarlo en la cadena del `useMemo` de `ResolverPage`:

```typescript
// exerciseGuideBuilder.ts
withDifficultyHint() {
  if (this.guide.dificultad === 'DIFICIL') {
    this.guide.editorTexto += ' Considera casos extremos y entradas vacías.';
  }
  return this;
}
```

```tsx
// ResolverPage.tsx
ExerciseGuideBuilder
  .create(ejercicio)
  .withExample(casos[0])
  .withLanguageRules()
  .withDifficultyHint()   // ← nuevo paso
  .build();
```

### Añadir un decorador al runner

Crear la clase en `pythonRunnerDecorators.ts` y añadirla a `createDefaultRunner`:

```typescript
// Ejemplo: decorador que rechaza código con bucles infinitos obvios
export class InfiniteLoopGuardDecorator extends PythonRunnerDecorator {
  async run(code: string, stdin: string): Promise<RunResult> {
    if (/while\s+True\s*:/i.test(code)) {
      return { stdout: '', stderr: '', error: 'Precaución: bucle `while True` detectado. Asegúrate de tener un break.' };
    }
    return this.wrapped.run(code, stdin);
  }
}

export function createDefaultRunner(): IPythonRunner {
  return new TimingDecorator(
    new StdinNormalizerDecorator(
      new InfiniteLoopGuardDecorator(   // ← insertar en la cadena
        new BasePythonRunner()
      )
    )
  );
}
```

Los componentes que usan `createDefaultRunner()` reciben el nuevo comportamiento automáticamente.
