# Prompts utilizados con IA — Proyecto Cardly

> Documento académico. Describe los 5 prompts principales usados con Claude (Anthropic)
> para implementar funcionalidades del proyecto Cardly, plataforma educativa de programación
> con mecánicas de juego de cartas coleccionables.
>
> Stack: React 19 + TypeScript + Vite + Tailwind (front) · Node.js + Express + Prisma + PostgreSQL (back)

---

## Prompt 1 — Patrón Decorator en el runner de Python

**Contexto entregado al modelo:**

> Tenemos una función `runPython(code, stdin)` en `pythonRunner.ts` que ejecuta código Python
> en el navegador usando Pyodide (WebAssembly). Actualmente es una función plana sin ninguna
> abstracción. Necesitamos aplicar el **patrón Decorator** para poder añadir comportamientos
> extra al runner sin modificar su lógica central.
>
> Los decoradores requeridos son:
> 1. `TimingDecorator` — mide cuántos milisegundos tarda cada ejecución y añade `elapsedMs`
>    al resultado.
> 2. `StdinNormalizerDecorator` — recorta espacios al final de cada línea del stdin y elimina
>    líneas vacías al final, para evitar `EOFError` cuando el alumno copia y pega inputs.
>
> La cadena debe ensamblarse con una función `createDefaultRunner()` que los componentes de
> React llamen en vez de importar `runPython` directamente. Define también la interfaz
> `IPythonRunner` con el método `run(code, stdin): Promise<RunResult>` y una clase
> `BasePythonRunner` que la implemente delegando en `runPython`.
>
> Crea el archivo `src/features/resolver/lib/pythonRunnerDecorators.ts` con todo esto.
> Actualiza `pythonRunner.ts` para exportar `IPythonRunner`, `BasePythonRunner` y añade
> `elapsedMs?: number` a `RunResult`. Muestra cómo quedaría el uso en `ResolverPage.tsx`.

**Lo que generó el modelo:**
- Interfaz `IPythonRunner` y clase `BasePythonRunner` en `pythonRunner.ts`
- Archivo `pythonRunnerDecorators.ts` con `StdinNormalizerDecorator`, `TimingDecorator` y `createDefaultRunner()`
- Cadena: `TimingDecorator → StdinNormalizerDecorator → BasePythonRunner → runPython/Pyodide`
- Actualización de `ResolverPage` y `ConsolaPanel` para usar `createDefaultRunner()`

---

## Prompt 2 — Patrón Builder para la guía visual del ejercicio

**Contexto entregado al modelo:**

> En `ResolverPage.tsx` el panel izquierdo muestra la guía del ejercicio (enunciado, formato
> de entrada, formato de salida, ejemplo). Actualmente esa lógica de presentación está mezclada
> directamente en el JSX del componente, con condicionales para detectar el lenguaje y el
> formato de los casos de prueba.
>
> Queremos aplicar el **patrón Builder** creando `ExerciseGuideBuilder` en
> `src/features/resolver/builders/exerciseGuideBuilder.ts`. El builder debe:
> - Recibir el objeto `EjercicioDetail` del backend en su constructor estático `create(ejercicio)`.
> - Exponer métodos encadenables: `withExample(caso?)`, `withLanguageRules()`,
>   `withSmartInputHint()` y `build()`.
> - `withSmartInputHint()` debe analizar el input del primer caso de prueba:
>   - Si contiene `\n` → decir "Los datos llegan en N líneas. Usa `input()` una vez por valor."
>   - Si contiene espacios en una sola línea → decir "Usa `input().split()`, los valores llegan
>     juntos en una línea."
>   - Si es un valor único → decir "Lee un solo valor con `input()`."
> - El resultado de `build()` es un objeto plano `ExerciseGuideModel` que el componente
>   consume sin lógica adicional.
>
> El `stdinHint` generado debe usarse como placeholder en la consola de input del alumno.

**Lo que generó el modelo:**
- Clase `ExerciseGuideBuilder` con interfaz `ExerciseGuideModel`
- Método `withSmartInputHint()` con detección automática del formato de entrada
- Integración en `ResolverPage` con `useMemo` para no recalcular en cada render
- Componentes `EjercicioGuide` y `EditorHint` que consumen el modelo sin lógica de presentación

---

## Prompt 3 — Terminal interactiva con ejecución paso a paso

**Contexto entregado al modelo:**

> Actualmente la página del resolver tiene un área de "caso propio" donde el alumno
> pre-rellena el stdin completo y luego presiona un botón para ejecutar. Los alumnos esperan
> una experiencia de terminal real: el programa corre, llega a `input()`, para y espera
> que escriban, continúa al siguiente `input()`, y al final muestra el output.
>
> La restricción técnica es que Pyodide corre en el hilo principal sin `SharedArrayBuffer`,
> así que no podemos bloquear la ejecución de forma nativa.
>
> Diseña e implementa una función `runInteractive(code, callbacks)` en `pythonRunner.ts`
> que simule la interactividad usando este truco:
> 1. Inyectar un `input()` de Python que lanza una excepción interna `__NeedInput__` cuando
>    no quedan inputs disponibles, en vez de hacer `EOFError`.
> 2. En JS, atrapar esa excepción y llamar a `callbacks.requestInput(prompt)` que devuelve
>    una `Promise<string>` — el UI resuelve esa promesa cuando el usuario escribe y presiona Enter.
> 3. Re-ejecutar el código desde el principio con todos los inputs acumulados hasta ese momento.
> 4. Mostrar solo el delta de stdout nuevo en cada iteración (no repetir lo ya mostrado).
> 5. Repetir hasta que el código complete sin lanzar `__NeedInput__`.
>
> En `ResolverPage.tsx` crea el componente `TerminalPanel` debajo del editor con:
> - Historial scrollable coloreado (cyan=stdin, verde=stdout, rojo=error, gris=sistema).
> - Barra de input al fondo desactivada mientras ejecuta, que se activa con borde cyan cuando
>   el programa espera, con foco automático.
> - Botón `▶ Ejecutar` en idle y `Enter ↵` cuando el programa está esperando input.
> - Botón `↺ limpiar` que resetea el historial y cancela cualquier ejecución pendiente.

**Lo que generó el modelo:**
- Función `runInteractive` con constantes `INTERACTIVE_SETUP` y `INTERACTIVE_CLEANUP` en Python
- Manejo de la clase `__NeedInput__` y limpieza de globals de Pyodide entre iteraciones
- Estado `terminalWaiting` + `inputResolverRef` para coordinar UI ↔ Pyodide
- Componente `TerminalPanel` con historial, auto-scroll, colores y transición visual al esperar
- `handleTerminalSubmit` y `handleResetTerminal` con cancelación de Promise pendiente

---

## Prompt 4 — Validación por output y fix del flujo de asignación

**Contexto entregado al modelo:**

> Hay dos bugs relacionados con el flujo de ejercicios:
>
> **Bug 1 — Submit valida solo código literal:**
> El backend (`validador.js`) compara el código enviado por el alumno contra una lista de
> `solucionesCodigo` almacenada en la base de datos (comparación de texto normalizado).
> Cualquier solución correcta pero escrita diferente a las almacenadas falla el submit,
> aunque Pyodide la ejecute correctamente. El validador ya soporta `tipo: 'output'` que
> compara outputs en vez de código — usar eso.
>
> Cambia `handleSubmit` en `ResolverPage.tsx` para que, en ejercicios Python:
> - Si ya corrió "Probar contra casos", recoja los outputs de `runResults` y los envíe
>   como `{ tipo: 'output', respuesta: string[] }`.
> - Si no corrió, ejecute Pyodide automáticamente con los casos oficiales y luego envíe.
>
> **Bug 2 — Asignar ejercicio no navega y puede quedar en estado RESUELTO:**
> En `ListadoPage.tsx`, `handleAsignar` muestra un toast de éxito pero el alumno tiene
> que hacer clic en "Resolver" por separado. Además, en `exerciseRepository.js`, el
> `upsertActive` tiene `update: {}` — si el ejercicio ya estaba como RESUELTO, queda
> en ese estado y no aparece en la lista de activos.
>
> Fixes: (1) después de asignar, navegar directamente a `/ejercicios/:id`; (2) cambiar
> `update: {}` por `update: { estado: 'PENDIENTE' }` en el repositorio.

**Lo que generó el modelo:**
- `handleSubmit` refactorizado con lógica de recolección de outputs o auto-ejecución
- `upsertActive` corregido en `exerciseRepository.js`
- `handleAsignar` en `ListadoPage.tsx` simplificado con `navigate(\`/ejercicios/${ejercicioId}\`)`
- Actualización de `SubmitRequest` type para `respuesta: string | string[]`

---

## Prompt 5 — Modal de resultado incorrecto con código de solución

**Contexto entregado al modelo:**

> Cuando el alumno envía una solución incorrecta, el modal `IncorrectoView` en
> `ResultModal.tsx` muestra solo un mensaje genérico y el motivo del error. El profesor
> quiere que haya una opción para mostrar el código de solución correcto, que el alumno
> pueda estudiar y copiar.
>
> Implementa los siguientes cambios:
>
> **Backend (`exerciseService.js`):**
> Cuando `submitAttempt` devuelve `correcto: false`, incluir en la respuesta el campo
> `solucionEjemplo` con el primer elemento del array `solucionesCodigo` del ejercicio.
> (Actualmente `publicExercise` elimina `solucionesCodigo` de todas las respuestas para
> no exponerlo al alumno antes de intentarlo — solo enviarlo en el submit si falló.)
>
> **Frontend (`types/api.ts`):**
> Agregar `solucionEjemplo?: string` a la interfaz `SubmitResponse`.
>
> **Frontend (`ResultModal.tsx`):**
> En `IncorrectoView`, agregar:
> - Botón `💡 Mostrar respuesta` con toggle (solo visible si `result.solucionEjemplo` existe).
> - Al expandir, mostrar el código en un `<pre>` con fuente monoespaciada y color lila.
> - Botón `⎘ Copiar código` que usa `navigator.clipboard.writeText` y cambia a
>   `✓ Copiado` durante 1.5 segundos.
> - El modal debe hacer scroll si el código es largo.

**Lo que generó el modelo:**
- `submitAttempt` en `exerciseService.js` con lógica condicional para `solucionEjemplo`
- Interfaz `SubmitResponse` actualizada en `types/api.ts`
- `IncorrectoView` con estado `showAnswer` y `copied`, panel expandible con `<pre>`
- Estilos coherentes con el design system de Cardly (fondos rgba, bordes semitransparentes)

---

*Proyecto académico SW2 — Cardly. Todos los prompts fueron ejecutados con Claude Sonnet (Anthropic) como asistente de programación.*
