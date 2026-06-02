# Handoff — sesión anterior

> Leer esto antes de tocar cualquier archivo. Resume todo lo que se hizo y qué falta.

---

## Repositorios

| Repo | Ruta local | Rama activa | Remote |
|---|---|---|---|
| Frontend | `C:\Users\Javier\Documents\Front-SW2` | `main` | `salcar420/Front-SW2` |
| Backend  | `C:\Users\Javier\Documents\Back-SW2`  | `alvaro` | `Luis-escobar-4774/Back-SW2` |

> El back usa `alvaro` como rama de trabajo. No pushear a `main` del back sin coordinarlo con el equipo.

---

## Reglas del proyecto

- **No incluir `Co-Authored-By: Claude`** en ningún commit. Es proyecto académico.
- **No commitear ni pushear** hasta que el usuario lo pida explícitamente.
- El proyecto se llama **Cardly** — videojuego educativo de programación con cartas TCG.
- Stack front: React 19 + TypeScript + Vite 8 + Tailwind v4 + SWR + Zustand.
- Stack back: Node.js + Express 5 + Prisma 6 + PostgreSQL (Supabase).

---

## Qué se hizo en esta sesión

### 1. Terminal interactiva real — `ResolverPage.tsx` + `pythonRunner.ts`

Se reemplazó el "caso propio" por una terminal real debajo del editor.

**Cómo funciona (`runInteractive` en `pythonRunner.ts`):**
- El programa corre y cuando llega a `input()` lanza `__NeedInput__` (excepción interna).
- JS la atrapa, muestra el prompt en la terminal y espera a que el usuario escriba.
- Al presionar Enter, re-ejecuta el código con los inputs acumulados hasta ese punto.
- Muestra solo el delta de stdout nuevo en cada iteración.
- Sin SharedArrayBuffer — funciona en cualquier navegador.

**UX de la terminal:**
- Barra de título estilo macOS (dots rojo/amarillo/verde) + botón ↺ limpiar.
- Historial scrollable con colores: cyan para stdin, verde para stdout, rojo para errores, gris para sistema.
- Barra de input al fondo: desactivada mientras ejecuta, se activa con borde cyan cuando el programa pide input, foco automático.
- Botón `▶ Ejecutar` cuando idle, `Enter ↵` cuando esperando input.

### 2. Submit por output, no por código — `ResolverPage.tsx`

`handleSubmit` ya no envía el código sino los **outputs reales de Pyodide**:
- Si ya corrió "Probar contra casos" → usa `runResults` directamente.
- Si no → auto-ejecuta con Pyodide antes de enviar.
- Envía `tipo: 'output'` con array de outputs → cualquier código correcto pasa.
- Fallback a `tipo: 'codigo'` para ejercicios no-Python.

### 3. Fix asignar ejercicio — `ListadoPage.tsx` + `exerciseRepository.js`

**Front:** después de asignar, navega directamente a `/ejercicios/:id`. Actualización optimista del caché + revalidación al volver.

**Back:** `upsertActive` usa `update: { estado: 'PENDIENTE' }`. Antes `update: {}` dejaba ejercicios resueltos sin resetear.

### 4. Bugs del flujo de asignación corregidos — `ListadoPage.tsx`

Se identificaron y corrigieron 5 bugs:

| Bug | Fix |
|---|---|
| `throw err` re-lanzado | Removido — `EjercicioCard` ya resetea estado en `finally` |
| Sin límite de 5 ejercicios en front | Bloquea con toast si `pendientesIds.size >= 5` |
| `fetcher` stale por closure sin `useCallback` | Envuelto en `useCallback` con deps `[moduloFiltro, dificultadFiltro]` |
| `mutate(..., false)` deprecated en SWR v2 | Cambiado a `{ revalidate: false }` |
| Lambdas inline en render del grid | `EjercicioCardMemo` con `memo()` + handlers estables via `useCallback` |

### 5. Fix formato de inputs "Suma de dos números" — `seed.js`

`casosPrueba` cambiaron de `"2 3"` a `"2\n3"`. Ahora `int(input())` dos veces funciona. Se re-ejecutó el seed.

### 6. "Mostrar respuesta" en modal de incorrecto — `ResultModal.tsx` + `exerciseService.js`

Backend incluye `solucionEjemplo` en el submit response cuando `correcto: false`. El modal muestra el código con botón **⎘ Copiar código**.

### 7. Diagramas PlantUML — `Pregunta 5.4/`

7 diagramas de patrones de diseño en fondo blanco, exportados a PNG listos para Word:
- Decorator, Builder, Factory (frontend)
- Singleton, Observer, Facade, Repository (backend)

### 8. Documentación académica — `codigo.md`

5 prompts extensos usados con IA durante el proyecto (para entregar al profesor).

### 9. Fixes menores anteriores

- Fix cursor desalineado en `CodeEditor.tsx` (`w-10` → `w-[54px]`)
- `withSmartInputHint()` en `ExerciseGuideBuilder`
- `PY_INITIAL` simplificado

---

## Estado git al final de la sesión

### Front (`main`) — todo commiteado y pusheado ✅

Commits de esta sesión:
```
3f5f979  fix flujo asignacion: limite 5, no rethrow, fetcher estable, mutate v2, memo cards
df6a5a0  fix asignacion: actualiza cache local y revalida lista al volver
01867df  actualiza diagramas a fondo blanco y regenera PNGs
0164b94  agrega PNGs exportados de los diagramas PlantUML
d0a4534  agrega Pregunta 5.4 con diagramas PlantUML de los 7 patrones de diseno
b03f3ac  agrega codigo.md con los 5 prompts de IA usados en el proyecto
df1fb39  terminal interactiva, submit por output y fixes de UX
```

### Back (`alvaro`) — todo commiteado y pusheado ✅

```
3e21fd5  fix inputs ejercicios, asignar y solucion en submit incorrecto
```

---

## Problemas pendientes para próxima sesión

1. **Timeout de Pyodide** — un bucle infinito cuelga la pestaña. Requiere `SharedArrayBuffer` + headers `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp` en Vite y el servidor. Documentado en `DOCS.md §14`.

2. **Strategy pattern en `validador.js` del back** — `if (tipo === 'codigo')` / `if (tipo === 'output')` mezclados. Extraer a `ValidadorCodigo` y `ValidadorOutput`. Documentado en `PATRONES.md §8`.

3. **`main` del back desincronizado de `alvaro`** — varios commits de retraso. Si el equipo necesita sincronizar: merge `alvaro → main`.

---

## Archivos clave

```
Front-SW2/
├── HANDOFF.md                            Este archivo
├── codigo.md                             Prompts de IA usados (entrega académica)
├── Pregunta 5.4/
│   ├── *.puml                            Diagramas PlantUML (fondo blanco)
│   ├── png/                              PNGs exportados listos para Word
│   └── descripcion.md                    Texto de cada patrón para el informe
├── src/features/resolver/
│   ├── ResolverPage.tsx                  Pantalla principal (editor + terminal + casos + submit)
│   ├── builders/exerciseGuideBuilder.ts  Patrón Builder
│   ├── components/
│   │   ├── CodeEditor.tsx                Editor Python con números de línea
│   │   ├── CasoPruebaCard.tsx            Card de caso oficial con resultado
│   │   └── ResultModal.tsx               Modal correcto/incorrecto + "Mostrar respuesta"
│   └── lib/
│       ├── pythonRunner.ts               runPython + runInteractive (Pyodide)
│       └── pythonRunnerDecorators.ts     Decorator chain + createDefaultRunner()
├── src/features/ejercicios/
│   └── ListadoPage.tsx                   Lista + asignar (memo, useCallback, límite 5)
└── src/types/api.ts                      SubmitResponse.solucionEjemplo

Back-SW2/
├── prisma/seed.js                        Ejercicios con inputs correctos (\n separados)
├── src/repositories/exerciseRepository.js  upsertActive → estado PENDIENTE
└── src/services/exerciseService.js         submitAttempt devuelve solucionEjemplo
```
