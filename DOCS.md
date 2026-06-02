# Cardly · Frontend — Documentación para developers

> Guía de arquitectura, convenciones y trabajo pendiente. Si vas a tocar el código, **lee esto antes**.

Última actualización: Sprint 1 cerrado · 8 pantallas conectadas al back.

---

## Índice

1. [Resumen del proyecto](#1-resumen-del-proyecto)
2. [Stack y decisiones técnicas](#2-stack-y-decisiones-técnicas)
3. [Setup local](#3-setup-local)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Flujo de autenticación](#5-flujo-de-autenticación)
6. [Cliente HTTP](#6-cliente-http)
7. [Sistema de diseño](#7-sistema-de-diseño)
8. [AppShell y navegación](#8-appshell-y-navegación)
9. [Pantallas implementadas](#9-pantallas-implementadas)
10. [Convenciones](#10-convenciones)
11. [Cómo agregar una nueva pantalla](#11-cómo-agregar-una-nueva-pantalla)
12. [Cómo agregar un endpoint](#12-cómo-agregar-un-endpoint)
13. [Cheatsheet de endpoints consumidos](#13-cheatsheet-de-endpoints-consumidos)
14. [Qué falta (roadmap)](#14-qué-falta-roadmap)
15. [Deuda técnica y decisiones a revisar](#15-deuda-técnica-y-decisiones-a-revisar)

---

## 1. Resumen del proyecto

**Cardly** es un videojuego web educativo para aprender programación. El alumno resuelve ejercicios y gana cartas coleccionables tipo TCG (común → rara → épica → legendaria). El frontend consume un backend Express + Prisma + Postgres (`Back-SW2`).

**Sprint 1 — alcance entregado:**

| Pantalla | Ruta | Función |
|---|---|---|
| Login / Registro | `/login` | Auth con JWT |
| Dashboard | `/dashboard` | Resumen del jugador (puntos, racha, top, misiones) |
| Arena | `/ejercicios` | Listado filtrable de ejercicios |
| Resolver | `/ejercicios/:id` | Editor de código + cronómetro + envío |
| Módulos | `/modulos` | Lista de módulos educativos con progreso |
| Detalle de módulo | `/modulos/:id` | Pasos completables + ejercicios del módulo |
| Inventario | `/inventario` | Tus cartas con tilt holográfico |
| Ranking | `/ranking` | Podio top 3 + tabla |

Todas las pantallas conectadas al back real. Sin mocks. Loading + empty + error states en cada una. Responsive desktop / tablet / móvil.

---

## 2. Stack y decisiones técnicas

| Capa | Tecnología | Por qué |
|---|---|---|
| Runtime | Node.js v24 | Última LTS al cierre del sprint |
| Bundler | Vite 8 | HMR instantáneo, build muy rápido (~1 s) |
| UI | React 19 + TypeScript estricto | Tipos del back se traducen 1:1 a frontend |
| Estilos | Tailwind v4 (con `@theme` en CSS) | Sin `tailwind.config.js`, todo en `src/index.css` |
| Routing | React Router v7 | `createBrowserRouter` + rutas protegidas |
| HTTP | Axios | Interceptor JWT global + 401 auto-logout |
| Estado global | Zustand + `persist` | Solo para auth (token + user) |
| Code runner (cliente) | Pyodide (CDN, lazy) | "▶ Probar" en Resolver + playgrounds en lecciones |
| Markdown | Parser custom (sin deps) | Renderiza `contenidoTextual` de pasos con code blocks runnables |
| Notificaciones | `react-hot-toast` | Toasts con estilo del tema |
| Fuentes | Orbitron / Inter / JetBrains Mono | display / UI / código |

**Decisiones clave:**

- **No TanStack Query / SWR.** Cada pantalla maneja su `useEffect` + estado local. Funciona, pero ver §15 sobre deuda técnica si crece.
- **No componentes de librería tipo shadcn / Radix.** Todo custom para mantener el look gamificado. Pago: más código a mantener, ganancia: control total del diseño.
- **Path alias `@/` → `src/`** configurado en `vite.config.ts` y `tsconfig.app.json`. Úsenlo en imports nuevos.
- **Token en `localStorage`** vía Zustand persist. Aceptable para Sprint 1; revisar para producción (§15).
- **`pages/` no existe — usamos `features/`.** Cada feature agrupa su `*Page.tsx`, `api.ts` y `components/`. Mejor cohesión que separar por tipo de archivo.

---

## 3. Setup local

### Pre-requisitos
- Node.js v24+
- npm 11+
- Backend `Back-SW2` corriendo en `http://localhost:3000` (o lo que apuntes con `VITE_API_URL`)

### Pasos

```powershell
# 1. Clonar el repo y entrar
cd C:\Users\Javier\Documents\Front-SW2

# 2. Instalar dependencias
npm install

# 3. Crear .env (copiar .env.example y ajustar si hace falta)
#    VITE_API_URL=http://localhost:3000

# 4. Arrancar el dev server
npm run dev
# → http://localhost:5173
```

### Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Vite dev server con HMR |
| `npm run build` | TypeScript check + bundle de producción a `/dist` |
| `npm run preview` | Sirve el bundle de `/dist` localmente |
| `npm run lint` | ESLint |

**Tip:** si modificas `tsconfig.app.json` o `vite.config.ts`, reinicia el dev server.

---

## 4. Estructura del proyecto

```
Front-SW2/
├── mockups/                       Prototipo HTML+JSX original (referencia visual, no se ejecuta)
├── public/
├── src/
│   ├── main.tsx                   Bootstrap React (RouterProvider + Toaster global)
│   ├── router.tsx                 Definición de rutas
│   ├── index.css                  Tailwind v4 + design tokens en @theme + animaciones globales
│   │
│   ├── lib/
│   │   └── api.ts                 Axios instance + interceptor JWT + extractApiError
│   │
│   ├── stores/
│   │   └── auth.ts                Zustand store (token + user, persistido en localStorage)
│   │
│   ├── types/
│   │   └── api.ts                 ÚNICA fuente de tipos del back (no duplicar en otros lados)
│   │
│   ├── components/
│   │   ├── ProtectedRoute.tsx     HOC que redirige a /login si no hay token
│   │   ├── cardly/                Componentes de marca reutilizables
│   │   │   ├── AppShell.tsx       Sidebar + Topbar + drawer móvil + logout
│   │   │   ├── Background.tsx     Fondo atmosférico + partículas
│   │   │   ├── Particles.tsx
│   │   │   ├── Logo.tsx
│   │   │   ├── CartaJugador.tsx   Carta TCG con tilt + holo (la pieza visual estrella)
│   │   │   ├── Icon.tsx           SVG inline: Check, ChevR, Sword, Heart, Star, Eye/EyeOff, Spinner
│   │   │   └── Icon2.tsx          SVG inline: Bolt, Coin, Flame, Card, Play, Home, Swords, etc.
│   │   └── markdown/
│   │       └── MarkdownRenderer.tsx  Parser markdown + render TSX (sin deps)
│   │
│   └── features/                  Carpetas por feature, cada una autocontenida
│       ├── auth/
│       │   ├── api.ts             login, register, me
│       │   └── LoginPage.tsx      Split-screen con hero parallax (desktop) → stack (móvil)
│       ├── dashboard/
│       │   ├── api.ts             getDashboardSummary, getRanking, getMisCartas, getEjerciciosActivos
│       │   ├── DashboardPage.tsx
│       │   └── components/        Badges, CartaRow, MisionRow, RankingRow, SectionHeader, Skeleton, SlimStat
│       ├── ejercicios/
│       │   ├── api.ts             getEjercicios, getEjerciciosActivos, asignarEjercicio, getEjercicioDetail, submitEjercicio
│       │   ├── ListadoPage.tsx    Arena con filtros + grid
│       │   └── components/        EjercicioCard, FilterGroup, ModuloSelect, SegChip
│       ├── modulos/
│       │   ├── api.ts             getModulos, getModuloDetail, getModuloEjercicios, completarPaso, descompletarPaso
│       │   ├── ModulosListPage.tsx
│       │   ├── ModuloDetailPage.tsx
│       │   └── components/        InteractiveExample (playground inline), CodeBlockStatic
│       ├── resolver/
│       │   ├── ResolverPage.tsx   Layout 3-col → stacked en móvil
│       │   ├── builders/
│       │   │   └── exerciseGuideBuilder.ts   Patrón Builder: construye ExerciseGuideModel
│       │   ├── lib/
│       │   │   ├── pythonRunner.ts            Pyodide singleton + IPythonRunner + BasePythonRunner
│       │   │   └── pythonRunnerDecorators.ts  Patrón Decorator: StdinNormalizer, Timing, createDefaultRunner
│       │   └── components/        CodeEditor, Cronometro, CasoPruebaCard, ResultModal, ConsolaPanel
│       ├── inventario/
│       │   └── InventarioPage.tsx
│       └── ranking/
│           └── RankingPage.tsx
│
├── .env                           VITE_API_URL=http://localhost:3000  (no se commitea)
├── .env.example
├── index.html                     Carga fuentes de Google + #root
├── tailwind.config.* (NO EXISTE)  Tailwind v4 vive en src/index.css
├── tsconfig.app.json              Alias @/* → ./src/*
├── vite.config.ts                 Plugins: @vitejs/plugin-react, @tailwindcss/vite
├── package.json
├── README.md                      Setup rápido para nuevos devs
└── DOCS.md                        Este archivo
```

---

## 5. Flujo de autenticación

### Cómo funciona

1. **Login / Register** (`/login`) → `POST /auth/login` o `POST /auth/register`
2. Back devuelve `{ user, token }` (JWT).
3. `LoginPage` llama a `useAuthStore.setSession(token, user)` → Zustand persiste en `localStorage` key `cardly-auth`.
4. Navega a `/dashboard`.
5. **Cada request siguiente** lleva `Authorization: Bearer <token>` automáticamente (interceptor de axios).
6. Si en cualquier momento el back responde **401**, el interceptor llama a `useAuthStore.logout()` (limpia token + user). `ProtectedRoute` detecta `token === null` y redirige a `/login`.

### Dónde vive cada pieza

- Store: `src/stores/auth.ts`
- Cliente: `src/lib/api.ts` (interceptor)
- Form: `src/features/auth/LoginPage.tsx`
- Endpoints: `src/features/auth/api.ts`
- Guard: `src/components/ProtectedRoute.tsx`

### Refresco del user

Algunas pantallas refrescan el `user` en el store con datos al día:
- `DashboardPage` al montar, después del `getDashboardSummary`.
- `ResolverPage` después del submit, con `puntosActuales`, `monedasActuales`, `rachaEjercicios` del response.

> ⚠️ Hoy **no** hay refresco automático de `/auth/me` en cada navegación. Si el back cambia stats fuera del flujo del front, el Topbar puede quedar desincronizado hasta que se vuelva al Dashboard. Ver §15.

---

## 6. Cliente HTTP

`src/lib/api.ts` exporta:

### `api`: axios instance
- baseURL: `import.meta.env.VITE_API_URL ?? 'http://localhost:3000'`
- Interceptor de request: adjunta `Authorization: Bearer <token>` si hay token en el store.
- Interceptor de response: en 401, dispara `useAuthStore.getState().logout()`.

### `extractApiError(err)`: helper
Convierte cualquier error en un string mostrable al usuario. Lee `err.response.data.error` si es un AxiosError; cae a `err.message` o "Error desconocido".

**Patrón en pantallas:**

```ts
try {
  const data = await getDashboardSummary();
  setData(data);
} catch (err) {
  toast.error(extractApiError(err));
}
```

---

## 7. Sistema de diseño

### Tailwind v4

**No hay `tailwind.config.js`.** Todo se configura en `src/index.css` dentro del bloque `@theme`.

### Design tokens disponibles

| Categoría | Variables → clases Tailwind |
|---|---|
| Backgrounds | `--color-bg-base` → `bg-bg-base`, también `bg-elevated`, `bg-card`, `bg-card-2` |
| Acentos | `--color-accent-primary` (violeta) → `text-accent-primary`, `bg-accent-primary`, `border-accent-primary`. También `accent-primary-2`, `accent-cyan`, `accent-gold`, `accent-success`, `accent-danger` |
| Textos | `text-text-primary`, `text-text-secondary`, `text-text-muted` |
| Rarezas | `text-rar-comun`, `text-rar-rara`, `text-rar-epica`, `text-rar-legendaria` |
| Fuentes | `font-display` (Orbitron), `font-body` (Inter, default), `font-mono` (JetBrains Mono) |
| Animaciones | `animate-shimmer-slide`, `animate-float-card`, `animate-float-up`, `animate-legendary-sweep` |

### Clases utilitarias custom (en `src/index.css`)

| Clase | Qué hace |
|---|---|
| `.cardly-bg` | Fondo atmosférico (gradientes + grid sutil). Posicionar como `absolute inset-0`. |
| `.cardly-particles` + `<span>`s | Partículas flotantes |
| `.glass` | Glassmorphism (backdrop-blur + borde violeta sutil) |
| `.shimmer` | Overlay de brillo deslizante (úsalo en botones primarios) |
| `.no-scrollbar` | Oculta scrollbar pero permite scroll |

### Highlight de Python (CodeEditor)

`.tok-kw`, `.tok-def`, `.tok-builtin`, `.tok-str`, `.tok-num`, `.tok-com`, `.tok-op`, `.tok-fn`, `.tok-id` definidos en `src/index.css`.

### Animaciones globales (keyframes)

Definidas en `src/index.css`: `scaleIn`, `confettiFall`, `legendaryPulse`, `spinSlow`, `pulseDot`, `shimmerSlide`, `floatCard`, `floatUp`, `legendarySweep`.

---

## 8. AppShell y navegación

`src/components/cardly/AppShell.tsx` es el wrapper de toda pantalla autenticada. Incluye:

- **Sidebar fijo** en desktop (≥ lg) con los 5 items principales del NAV.
- **Drawer** en móvil/tablet con botón hamburguesa en el Topbar.
- **Topbar** con resource pills (puntos/monedas/racha leídos del store) + avatar.
- **Botón logout** abajo en el sidebar.
- **Active state** automático con `<NavLink>` de react-router.

**Uso:**

```tsx
import { AppShell } from '@/components/cardly/AppShell';

export function MyNewPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {/* tu contenido */}
      </div>
    </AppShell>
  );
}
```

> **Excepciones:** `LoginPage` y `ResolverPage` NO usan AppShell — tienen su propio chrome (la primera porque es pre-auth, el segundo porque es modo focus full-screen con cronómetro propio).

---

## 9. Pantallas implementadas

### 9.1 Login (`/login`)

**Archivo:** `src/features/auth/LoginPage.tsx`

- Split-screen 46/54: form a la izquierda, hero arena a la derecha con 4 cartas flotantes con parallax al mouse.
- En `<lg` colapsa a una columna, oculta el hero.
- Toggle Login ↔ Registro sin cambiar de ruta. En registro aparece campo `username`.
- Toggle visibilidad de contraseña.
- Validación cliente (email/password vacíos, ≥8 caracteres, username ≥3).
- Envía a `POST /auth/login` o `/auth/register` según modo.
- Si éxito: guarda sesión, toast bienvenida, navega a `state.from ?? '/dashboard'`.
- Si error: toast con `error` del back.

### 9.2 Dashboard (`/dashboard`)

**Archivo:** `src/features/dashboard/DashboardPage.tsx`

Layout variante B ("hero arena"):

- **Hero card** con badge de racha activa, saludo personalizado, subtítulo dinámico ("Tienes N pendientes" o "Asígnate tu primer ejercicio"), CTAs **Continuar misión** / **Explorar arena**, y stack de 3 cartas flotantes (top 3 de `/dashboard/mis-cartas`).
- **4 SlimStats:** puntos · monedas · racha · cartas (totales).
- **3 columnas** (xl → 2 cols md → 1 col mobile):
  - **Misiones activas** (`/ejercicios/activos`, top 4)
  - **Cartas recientes** (`/dashboard/mis-cartas`, top 3)
  - **Top 5 + Mi resumen** (posición, ejercicios resueltos, tiempo jugado, distancia al top)

Endpoints consumidos: `/dashboard`, `/dashboard/ranking?limit=5`, `/dashboard/mis-cartas`, `/ejercicios/activos` (paralelo con `Promise.all`).

### 9.3 Arena / Listado (`/ejercicios`)

**Archivo:** `src/features/ejercicios/ListadoPage.tsx`

- Header con contador dinámico.
- **Barra de filtros:**
  - Módulo (`<select>` poblado de `GET /modulos`) → manda `?moduloId=` al back.
  - Dificultad (chips Todas/Fácil/Medio/Difícil) → manda `?dificultad=`.
  - Lenguaje (chips, aparece si hay >1 lenguaje detectado en los resultados).
  - Estado (chips Todos/Pendientes/Sin asignar) → filtrado client-side, no hay endpoint que cruce.
- **Grid responsive** 1 → 2 → 3 → 4 columnas.
- **EjercicioCard** con stripe de dificultad, badges, descripción line-clamp, footer con módulo + tiempo + CTA dinámico:
  - **PENDIENTE** → botón "Resolver" → navega a `/ejercicios/:id`
  - **SIN_ASIGNAR** → botón "Asignar" → `POST /ejercicios/activos`, optimistic update del set local + toast.

> ⚠️ **No mostramos estado RESUELTO.** El back solo expone `/ejercicios/activos` filtrado a `estado: 'PENDIENTE'`. Para distinguir resueltos necesita cambio en el back (ver §14).

### 9.4 Resolver (`/ejercicios/:id`)

**Archivo:** `src/features/resolver/ResolverPage.tsx`

La pantalla más densa. Layout V2 "focused":

- **Topbar minimal:** botón volver, logo, título + dificultad + lang + módulo, cronómetro con color por umbrales (verde < 3 min → ámbar < 6 min → rojo).
- **3 columnas (xl) → stacked (<xl):**
  - **Enunciado** (izq): descripción + recompensas posibles con probabilidad.
  - **Editor** (centro): path simulado, CodeEditor con highlight Python + line numbers + Tab → 4 espacios. Botones **Limpiar / ▶ Probar / Enviar**.
  - **Casos de prueba** (der): cards con input + esperado **+ tu output después de Probar**.

#### Patrones de diseño aplicados en el Resolver

El feature Resolver usa tres patrones GoF. Ver `PATRONES.md` para la documentación completa con diagramas de flujo y guías de extensión.

| Patrón | Archivo | Qué resuelve |
|---|---|---|
| **Factory** | `ResolverPage.tsx` → `RecompensaUIFactory` | Crea el componente visual correcto por tipo de recompensa (`PUNTOS`/`MONEDAS`/`CARTA`) sin condicionales en el bucle cliente. |
| **Builder** | `builders/exerciseGuideBuilder.ts` | Construye paso a paso el `ExerciseGuideModel` (textos de entrada/salida/editor/ejemplo) desde los datos del back, separando la lógica derivada del renderizado. |
| **Decorator** | `lib/pythonRunnerDecorators.ts` | Añade normalización de stdin y medición de tiempo al runner Pyodide sin modificar `runPython`. La cadena es `TimingDecorator → StdinNormalizerDecorator → BasePythonRunner`. |

#### Botón ▶ Probar — ejecución local con Pyodide

Permite al alumno **correr su código** sin enviar al back, viendo qué imprime para cada caso:

- **Click "Probar"** → carga Pyodide (~6 MB, lazy, ~3-5 s la primera vez) → ejecuta el código una vez por cada caso de prueba.
- El **input de cada caso** se inyecta como `stdin` (cada `input()` consume una línea).
- Captura **stdout / stderr / errores de runtime**.
- Cada `CasoPruebaCard` cambia su badge según el resultado:
  - **`— sin probar`** (gris, default)
  - **`⟳ corriendo`** (cyan, mientras se ejecuta)
  - **`✓ correcto`** (verde, si el stdout coincide con `outputEsperado`)
  - **`✕ no coincide`** (rosa, muestra "tu output" en rojo)
  - **`⚠ runtime error`** (rosa, muestra la excepción: `TypeError: ...`)
- Cuando termina, un toast indica `N/M casos pasaron`.
- **Editar el código limpia los resultados** del run anterior (estaban stale).
- **Una pill** en el footer del editor muestra el resumen `N/M` con color según outcome.

**Comparación de outputs:** se normaliza antes de comparar — trim de trailing whitespace por línea y de líneas vacías al final (`outputsMatch` en `pythonRunner.ts`). Así `"5\n"` y `"5"` se consideran iguales.

**Limitaciones actuales del runner:**
- **Solo Python.** Si el ejercicio es otro lenguaje, el botón está deshabilitado con tooltip explicativo + hint debajo de los casos.
- **Sin timeout.** Un loop infinito cuelga la pestaña. Para producción ver `pythonRunner.ts` (TODO: `interruptBuffer` con SharedArrayBuffer + headers CORS).
- **Sin acceso a librerías externas instalables** (no `micropip` por ahora). El stdlib de Python 3.12 sí está completo.

#### Submit

- Calcula `tiempoResolucionSeg = Math.max(1, floor((now - startedAt) / 1000))`, envía `{ tipo: 'codigo', respuesta: code, tiempoResolucionSeg }` a `POST /ejercicios/:id/submit`.
- Actualiza el store con puntos/monedas/racha actualizados (`res.puntosActuales`, `res.monedasActuales`, `res.rachaEjercicios`).
- Abre **ResultModal**:
  - **CORRECTO:** confeti, "¡CORRECTO!" en gradient dorado, 3 columnas (recompensas | carta otorgada | meta de la carta), CTAs **Cerrar** / **Siguiente ejercicio**.
  - **INCORRECTO:** background rojo, ✕ icon, "Casi…", muestra `result.motivo` del back, aviso de racha rota, CTAs **Salir** / **Reintentar** (reinicia cronómetro **y resultados del run**).
- Modal cierra con backdrop click o `Esc`. Bloquea scroll del body mientras está abierto.

> **Probar ≠ Enviar.** El runner local valida que el output coincide con `outputEsperado`. El back valida el **código fuente** contra `solucionesCodigo` normalizando whitespace y comentarios — son criterios distintos. Un código puede pasar "Probar" (output correcto) pero no pasar "Enviar" (no coincide con ninguna solución aceptada del seed). Esto es esperado mientras el back valide por código y no por output; ver §14.

> Hoy solo soporta `tipo: 'codigo'` en el submit. El back también acepta `tipo: 'output'` pero no implementamos toggle. Ver §14.

#### Consola interactiva (panel inline debajo del editor)

Además del botón **▶ Probar** que corre contra los casos de prueba del back, hay un panel **⌨ Consola interactiva** colapsable debajo del editor:

- **Textarea de stdin** — el alumno escribe lo que quiera (una línea por cada `input()` que tenga su código).
- **Botón Ejecutar** — corre el código con ese stdin y muestra el stdout.
- **Sirve para experimentar** con valores fuera de los casos oficiales, depurar y entender qué hace su código.
- Reutiliza el mismo `runPython` que el resto (mismo Pyodide cargado en memoria).

#### Descripción del ejercicio renderizada como markdown

A diferencia de versiones anteriores que mostraban `whitespace-pre-line`, ahora el campo `descripcion` del ejercicio se renderiza vía `MarkdownRenderer`. Esto permite que el back guarde:

- Headings, listas, bold/italic, links.
- Bloques de código con highlight (ojo: en la descripción los marcamos como `{runnable=false}` para que solo se vean los snippets sin botón Probar — el alumno no debería ejecutarlos ahí; los ejemplos runnables son para los pasos de Módulos).
- Cajas `> [!tip]`, `> [!warning]`, `> [!info]` para pistas en contexto.
- **Bloques spoiler `::: spoiler "Título"`** para pistas más fuertes y la solución completa, oculta hasta que el alumno la pide.

#### Patch de `input()` en el runner

El runner de Pyodide reemplaza `builtins.input` por una versión que **ignora el prompt**. Esto significa que código como:

```python
n = int(input("Ingresa un numero: "))
print(n * 2)
```

…ejecuta exactamente igual que `n = int(input())` — el `"Ingresa un numero: "` NO va a stdout. Sin este parche, ese código falla porque el output esperado es `"8"` pero stdout sería `"Ingresa un numero: 8"`.

Para el alumno esto es invisible y natural. Para el autor del ejercicio: los `casosPrueba.outputEsperado` solo necesitan contener el resultado real, no el prompt.

> Limitación: si por alguna razón el ejercicio necesita que el prompt aparezca en stdout, el patch lo bloquea. Hoy no hay manera de desactivarlo por ejercicio — si surge el caso, sumar un flag al ejercicio (`flags: { keepInputPrompts: true }`).

### 9.5 Módulos lista (`/modulos`)

**Archivo:** `src/features/modulos/ModulosListPage.tsx`

- Grid de cards de módulos (1 → 2 → 3 cols).
- Cada card: glow esquinero con color rotativo, ícono libro, "Módulo N", título, descripción, **progress bar** (de `progreso` que viene del back si hay token), contadores 📖 pasos · ⚔ ejercicios, CTA dinámico (Empezar / Continuar / ✓ Completado).

### 9.6 Módulo detalle (`/modulos/:id`)

**Archivo:** `src/features/modulos/ModuloDetailPage.tsx`

- Header hero con título, descripción, progress bar gruesa (color cambia a cyan-verde al 100%).
- **Layout 2 columnas (lg) → stack (móvil):**
  - **Pasos** (col principal): cada paso con checkbox custom (cuadrado → verde con check al completar), título (strike-through si completado), botón "Ver contenido" expandible que despliega el contenido **renderizado como markdown** + link de video si existe.
  - **Ejercicios** (col lateral): mini-cards con título, dificultad, tiempo, CTA "Asignar" / "Resolver" según estado en `/ejercicios/activos`.
- **Optimistic update** en toggle de paso: cambia UI primero, revierte si el back falla.

Endpoints: `/modulos/:id`, `/modulos/:id/ejercicios`, `/ejercicios/activos`. Toggle: `POST` / `DELETE /pasos/:id/completar`.

#### Contenido rico de pasos · Markdown + ejemplos runnables

Desde el sprint de "lección rica", el campo `contenidoTextual` que devuelve el back se **interpreta como markdown** vía `src/components/markdown/MarkdownRenderer.tsx`.

**Sintaxis soportada:**

| Elemento | Sintaxis markdown |
|---|---|
| Encabezados | `# H1`, `## H2`, `### H3` |
| Negrita / cursiva | `**bold**`, `*italic*` |
| Código inline | `` `print()` `` |
| Listas | `- item` o `* item` (ul) · `1. item` (ol) |
| Links | `[texto](https://...)` |
| Nota / Tip / Atención | `> [!info]`, `> [!tip]`, `> [!warning]` seguido de líneas con `>` |
| Bloque de código | `` ```python ` ` ` `` |
| **Bloque de código runnable** | El mismo, automáticamente se muestra como playground inline (CodeEditor + ▶ Probar con Pyodide) si el lenguaje es Python. |
| **Mini-reto** | `` ```python {expected="55"} `` — al ejecutar, valida si el stdout coincide y muestra badge `✓ Reto completado` o `✕ Output no coincide`. Soporta `\n` dentro del string (escape). |
| Forzar no-runnable | `` ```python {runnable=false} `` — solo highlight, sin botón |
| **Spoiler colapsable** | `::: spoiler "Título del spoiler"` … `:::` — renderiza un botón violeta que al click despliega el contenido. Útil para hints progresivas y soluciones. Acepta cualquier markdown adentro. |

**Componentes detrás:**
- `MarkdownRenderer.tsx` — parser block-level + inline, sin dependencias externas (~250 líneas).
- `InteractiveExample.tsx` — playground inline reutilizando `CodeEditor` del Resolver y `runPython` del runner Pyodide. Mismo binario, sin re-load.
- `CodeBlockStatic.tsx` — fallback para lenguajes que no sean Python o cuando `runnable=false`.

**Ejemplo de contenido en el seed (`Back-SW2/prisma/seed.js`):**

```markdown
Una **variable** es un nombre que apunta a un valor en memoria.

```python
edad = 17
nombre = "Aria"
print(nombre, edad)
```

> [!tip]
> Los nombres deben empezar con letra o `_`.

## Reto: declara y muestra

```python {expected="Python tiene 4 tipos basicos"}
# Tu codigo aqui
```
```

Para ver los cambios después de editar el seed, correr en el back:
```bash
cd Back-SW2
npm run seed
```

### 9.7 Inventario (`/inventario`)

**Archivo:** `src/features/inventario/InventarioPage.tsx`

- Header con conteo total.
- **4 RarezaStats:** Legendaria / Épica / Rara / Común, cada uno con conteo y % sobre el total. Color por rareza.
- **Filtros:** rareza (chips) + ordenar por (Recientes / Rareza / Nivel).
- **Grid** 2 → 3 → 4 → 5 cols con `CartaJugador` a 180px, **con tilt 3D y holo habilitados** — al pasar el mouse la carta rota en perspectiva con shimmer holográfico.
- Footer de carta: "Nv N · En mazo" si aplica.

### 9.8 Ranking (`/ranking`)

**Archivo:** `src/features/ranking/RankingPage.tsx`

- Banner **"Tu posición"** solo si el usuario está fuera del podio.
- **Podio top 3** con orden visual de podio en desktop (2°-1°-3° con alturas distintas) y orden natural (1°-2°-3°) en móvil. Cada uno con su medalla, color (oro/plata/bronce), avatar grande, puntos en gradient.
- **Tabla** con posiciones 4° en adelante (hasta `DEFAULT_LIMIT = 50`). Fila del usuario actual resaltada con gradient violeta-cyan.

---

## 10. Convenciones

### Nombrado de archivos

- **Pages:** `XxxPage.tsx` (capitalized, sufijo `Page`). Ej: `DashboardPage.tsx`.
- **Componentes:** PascalCase. Ej: `CartaJugador.tsx`.
- **Helpers / cliente:** `api.ts`, `auth.ts` (lowercase, descriptivo). Un archivo por dominio.
- **Tipos compartidos:** `src/types/api.ts` (NO duplicar tipos en features).

### Imports

Siempre con alias `@/`:

```ts
import { AppShell } from '@/components/cardly/AppShell';
import { api } from '@/lib/api';
import type { User } from '@/types/api';
```

Nunca `../../../lib/api`. Si el linter no respeta el alias, revisar `tsconfig.app.json` y `vite.config.ts`.

### Tipos `type` vs `interface`

- **`interface`** para shapes de datos (response del back, props de componentes).
- **`type`** para uniones, intersecciones, alias.

```ts
export interface User { id: number; username: string; /* ... */ }
export type Rareza = 'COMUN' | 'RARA' | 'EPICA' | 'LEGENDARIA';
```

### Manejo de estado

- **Estado local:** `useState`. Default para todo.
- **Estado global:** Zustand SOLO para auth. No abusar.
- **Fetch:** `useEffect` con `cancelled` flag para evitar leaks.

```tsx
useEffect(() => {
  let cancelled = false;
  async function load() {
    try {
      const data = await fetchSomething();
      if (!cancelled) setState(data);
    } catch (err) {
      if (!cancelled) toast.error(extractApiError(err));
    } finally {
      if (!cancelled) setLoading(false);
    }
  }
  load();
  return () => { cancelled = true; };
}, [deps]);
```

### Pantallas: estados obligatorios

Cada pantalla debe tener:

1. **Loading** (`Skeleton` de `src/features/dashboard/components/Skeleton.tsx`)
2. **Empty state** (mensaje + acción cuando aplique)
3. **Error** (toast vía `extractApiError`)
4. **Datos** (la vista normal)

### Botones primarios

Usar gradient violeta-cyan + clase `.shimmer`:

```tsx
<button
  className="shimmer inline-flex items-center gap-2 px-5 py-3 rounded-[10px] text-white font-semibold text-sm"
  style={{
    background: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)',
    boxShadow: '0 4px 24px -8px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
  }}
>
  Texto
</button>
```

### Toasts

- Éxito: `toast.success('Mensaje')`
- Error: `toast.error(extractApiError(err))`
- El estilo ya está configurado globalmente en `main.tsx` (`<Toaster>`).

---

## 11. Cómo agregar una nueva pantalla

1. **Crea la carpeta del feature:**
   ```
   src/features/mifeature/
   ├── api.ts
   ├── MiFeaturePage.tsx
   └── components/         (opcional)
   ```

2. **Define la API** en `api.ts`:
   ```ts
   import { api } from '@/lib/api';
   import type { MiTipo } from '@/types/api';

   export async function getMiCosa(): Promise<MiTipo> {
     const { data } = await api.get<MiTipo>('/mi-endpoint');
     return data;
   }
   ```

3. **Define los tipos** en `src/types/api.ts` (NO en el feature):
   ```ts
   export interface MiTipo { /* shape del response */ }
   ```

4. **Crea la página:**
   ```tsx
   import { AppShell } from '@/components/cardly/AppShell';
   import { getMiCosa } from './api';
   // ...

   export function MiFeaturePage() {
     return (
       <AppShell>
         {/* contenido */}
       </AppShell>
     );
   }
   ```

5. **Registra la ruta** en `src/router.tsx`:
   ```tsx
   import { MiFeaturePage } from '@/features/mifeature/MiFeaturePage';

   // dentro de ProtectedRoute.children:
   { path: '/mi-feature', element: <MiFeaturePage /> },
   ```

6. **Agrégala al NAV** (si es top-level) en `src/components/cardly/AppShell.tsx`, array `NAV_ITEMS`.

7. **Valida:** `npm run build` debe pasar limpio.

---

## 12. Cómo agregar un endpoint

1. Agrega el tipo del response a `src/types/api.ts`.
2. Agrega la función al `api.ts` del feature correspondiente (o crea uno nuevo).
3. Úsala desde el componente con try/catch + `extractApiError`.

Si el endpoint necesita auth, no hay que hacer nada extra: el interceptor agrega el `Bearer` token automáticamente.

---

## 13. Cheatsheet de endpoints consumidos

| Endpoint | Quién lo usa | Notas |
|---|---|---|
| `POST /auth/register` | `LoginPage` | Devuelve `{ user, token }` |
| `POST /auth/login` | `LoginPage` | Devuelve `{ user, token }` |
| `GET /auth/me` | `auth/api.ts:me()` (no se llama hoy) | Reservado para refresh |
| `GET /dashboard` | `DashboardPage` | `{ usuario, stats, ranking }` |
| `GET /dashboard/ranking?limit=N` | `DashboardPage` (5), `RankingPage` (50) | |
| `GET /dashboard/mis-cartas` | `DashboardPage`, `InventarioPage` | |
| `GET /ejercicios` (filtros) | `ListadoPage` | `?moduloId=&dificultad=&lenguaje=` |
| `GET /ejercicios/:id` | `ResolverPage` | Incluye `recompensas` y `modulo` |
| `GET /ejercicios/activos` | `Dashboard`, `Listado`, `Módulo detalle` | Solo PENDIENTES |
| `POST /ejercicios/activos` | `Listado`, `Módulo detalle` | Body: `{ ejercicioId }` |
| `POST /ejercicios/:id/submit` | `ResolverPage` | Body: `{ tipo: 'codigo', respuesta, tiempoResolucionSeg }` |
| `GET /modulos` | `Listado`, `ModulosListPage` | Incluye `progreso` si hay token |
| `GET /modulos/:id` | `ModuloDetailPage` | Incluye `pasos[].completado` si hay token |
| `GET /modulos/:id/ejercicios` | `ModuloDetailPage` | |
| `POST /pasos/:id/completar` | `ModuloDetailPage` | Marca completado |
| `DELETE /pasos/:id/completar` | `ModuloDetailPage` | Desmarca |

---

## 14. Qué falta (roadmap)

### Funcionalidad

| Feature | Necesita | Sprint |
|---|---|---|
| **Distinguir ejercicios RESUELTOS en la Arena** | Cambio en back: `/ejercicios/activos` debería aceptar `?estado=PENDIENTE\|RESUELTO\|TODOS`, o crear `/ejercicios/resueltos`. | 2 |
| **Mostrar rareza de la recompensa en cards del Listado** | Cambio en back: `GET /ejercicios` debería incluir un resumen de recompensas (al menos la máxima rareza posible). Hoy solo viene en `/ejercicios/:id`. | 2 |
| **Modo de submit `tipo: 'output'`** | El back ya lo soporta. Falta agregar toggle en `ResolverPage`: "Enviar como código / salidas". Cuando esté en "salidas", auto-rellenar inputs con lo que devolvió Pyodide al hacer "Probar". | 2 |
| **Validación por output en el back (alinear con "Probar")** | Hoy el back valida por código (compara contra `solucionesCodigo` con normalización). El runner local valida por output. Esto causa que el alumno pase "Probar" pero falle "Enviar". Idealmente el back debería intentar primero validación por output (más permisiva) y caer a código solo si no hay output esperado configurado. | 2 |
| **Soporte multi-lenguaje en el runner local** | Hoy "Probar" es Python-only (Pyodide). Para JS se puede usar `Function()` con sandboxing. Para otros lenguajes (Java/C++) se necesitaría WebAssembly específico o endpoint del back. | 2-3 |
| **Timeout / cancelación del runner local** | Loops infinitos cuelgan la pestaña. Solución: `SharedArrayBuffer` + `interruptBuffer` de Pyodide + headers CORS `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp`. | 2 |
| **Mid-flip 3D real de la carta en ResultModal** | Hoy el revelado es `scaleIn`. Implementar el flip con `CartaDorso` → `CartaJugador` requiere Framer Motion + estados intermedios. | Polish |
| **Sistema de combate / multijugador** | Fuera de alcance Sprint 1. Diseño + back nuevo. | Backlog |
| **Aulas / Profesores / Asignaciones** | Tablas y endpoints del back sin implementar. HU original. | Backlog |
| **Foros por módulo** | `id_foro` del SQL original se descartó del schema. | Backlog |
| **Notificaciones in-app** | No hay sistema. | Backlog |
| **Tienda de sobres** | Mockup mostraba "sobre épico · 100 monedas". Sin endpoints. | Backlog |
| **Sistema de achievements / logros** | Mockup mostraba "Próximo logro". Sin endpoints. | Backlog |
| **Mejor racha histórica** / **Movimiento ▲▼ en ranking** | El back no guarda snapshots. | Backlog |

### Calidad / Ingeniería

| Mejora | Detalle | Prioridad |
|---|---|---|
| **TanStack Query** | Migrar fetches a `useQuery` da cache, refetch automático, dedupe. Reduce código en cada pantalla. | Media |
| **Tests** | Hoy no hay. Vitest + Testing Library para componentes críticos (CodeEditor, ResultModal, AppShell). | Media |
| **Storybook** | Para iterar visuales de `CartaJugador`, badges, etc. sin levantar back. | Baja |
| **Refresh `/auth/me` periódico** | Hoy stats se actualizan al volver al Dashboard o al hacer submit. Si cambian en otro lado, Topbar queda desincronizado. | Media |
| **Error boundary global** | Hoy un crash en una pantalla rompe toda la app. Agregar `<ErrorBoundary>` en `main.tsx`. | Media |
| **Pyodide para "probar local"** | Ejecutar Python en navegador antes de enviar. Mejora UX del Resolver enormemente. | Alta para UX |
| **PWA / instalable** | Manifest + service worker. Útil si los alumnos lo usan en celulares. | Baja |
| **Lazy load de rutas** | Hoy todo en un bundle de ~448 KB. `lazy()` + `<Suspense>` corta inicial. | Media |
| **Eslint + Prettier configurados estrictos** | Reglas adicionales tipo `import/order`. | Baja |

### Seguridad

| Item | Detalle | Quién lo arregla |
|---|---|---|
| **Token en `localStorage`** | Vulnerable a XSS. Para producción considerar `httpOnly cookie` con CSRF token (requiere cambios en back). | Back + Front |
| **CORS abierto en el back** | Hoy el back acepta cualquier origen. En prod, restringir a dominios conocidos. | Back |
| **`JWT_SECRET` placeholder** | El back lo dice en su CONTEXT.md. Rotar antes de deploy. | Back |
| **Rotar password de Supabase** | Estuvo expuesta en commits. Urgente. | Back |
| **HTTPS en deploy** | Obligatorio para JWT real. | DevOps |

---

## 15. Deuda técnica y decisiones a revisar

### Decisiones explícitas que pueden cambiar

- **Sin TanStack Query.** Ver §14 — útil cuando crezca, pero hoy no era necesario.
- **Sin Storybook.** Ver §14.
- **AppShell hardcodea los 5 items del nav.** Si agregás un sexto, edítalo en `src/components/cardly/AppShell.tsx` `NAV_ITEMS`.
- **`Icon.tsx` vs `Icon2.tsx`.** Se separaron por orden histórico (Login usó `Icon.tsx`, el resto creció en `Icon2.tsx`). Conviene unificar en un solo módulo cuando alguien tenga 15 minutos.

### Cosas que parecen raras pero son intencionales

- **`InventarioPage` usa `CartaJugador` con `tilt && holo` en todas las cartas.** Es caro en GPU pero es el feature visual estrella. Si causa lag en máquinas débiles, considerar deshabilitar en `screen.width < 1024`.
- **`ResolverPage` mide tiempo desde `useRef`, no desde estado.** Es a propósito: no quiero re-renderizar el page entero cada segundo. El `Cronometro` tiene su propio `useState` interno que solo re-renderiza el componentito.
- **El validador del back acepta múltiples soluciones por ejercicio** (`solucionesCodigo: string[]`), normalizando espacios. Por eso copiar y pegar del seed funciona aunque la formatación cambie un poco.

### Trampas conocidas

- **`tsconfig.app.json` ya NO usa `baseUrl`.** TS 6 lo deprecó. Sólo `paths` con rutas relativas (`./src/*`). Si VS Code falla en autocompletar imports, reiniciar el TS server.
- **El back devuelve enums en MAYÚSCULAS** (`PENDIENTE`, `FACIL`, `LEGENDARIA`). Los tipos de `src/types/api.ts` reflejan eso. Si recibís un enum en lowercase, es bug del back.
- **`tiempoResolucionSeg` en el submit debe ser ≥ 1.** El schema del back lo requiere. Usamos `Math.max(1, ...)`.
- **El response de `/auth/me` viene envuelto: `{ user: User }`.** Pero `/auth/login` y `/auth/register` vienen como `{ user, token }`. Inconsistencia del back, la manejamos en `auth/api.ts`.
- **`Skeleton` solo acepta `className`** (no `style`). Para tamaños arbitrarios usar `className="w-[180px] h-[252px]"`.
- **Pyodide se carga vía CDN** (`https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js`), no como dependencia npm. El script se inyecta dinámicamente al primer click en "Probar". Si el CDN está caído o el usuario está offline, el botón da error pero el resto del flujo (Enviar) sigue funcionando. Si se necesita usar offline, considerar bundlear pyodide localmente (mucho peso: ~6 MB).
- **Una sola instancia de Pyodide para toda la app.** El Resolver y los playgrounds en los pasos comparten la misma. La primera carga (Resolver O paso) toma ~3-5 s; las siguientes son instantáneas (caché en memoria mientras la pestaña esté abierta).
- **Markdown del seed con escapes:** En `seed.js` las strings JS usan `\n` para newlines reales. Para meter `\n` literal dentro de `{expected="..."}` se usa `\\n` (doble escape). Ver el reto "es_par" en el seed para un ejemplo.
- **Probar vs Enviar pueden diferir.** Ver detalle en §9.4. El runner local compara output; el back compara código fuente normalizado contra `solucionesCodigo`. Comportamiento esperado mientras no se actualice la validación del back. Educar al alumno: "Probar" es para depurar; "Enviar" es la evaluación oficial.

---

## Anexo: comandos útiles para developers

```powershell
# Front
npm run dev                     # dev server (http://localhost:5173)
npm run build                   # TS check + bundle
npm run preview                 # sirve el bundle

# Back (Back-SW2)
npm run dev                     # express con --watch
npm run seed                    # carga datos demo (módulos, ejercicios, cartas)
npm run prisma:studio           # GUI de la BD en http://localhost:5555
npx prisma db push              # sincronizar schema con la BD
```

### Verificar manualmente el back

```bash
# Health check
curl http://localhost:3000/health

# Registrar
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"password123"}'

# Login (guarda el token devuelto)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Listar ejercicios (sin auth)
curl http://localhost:3000/ejercicios

# Dashboard (con auth)
curl http://localhost:3000/dashboard \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Contacto

Si tenés dudas sobre alguna decisión, revisá el commit history — los mensajes están escritos para explicar el "por qué" no el "qué". Si no encontrás la respuesta, preguntá antes de cambiar.

**No** modifiquen `tsconfig.app.json`, `vite.config.ts`, `index.css` (sección `@theme`) o `src/lib/api.ts` sin alinearse con el resto del equipo: son archivos transversales que afectan todo.
