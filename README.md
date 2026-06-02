# Cardly · Frontend (Front-SW2)

Frontend del videojuego web educativo **Cardly** (Software 2). Plataforma de aprendizaje de programación con sistema de cartas coleccionables, ejercicios verificables y gamificación.

> Conecta con el backend `Back-SW2` (Express + Prisma + Postgres) por HTTP en `http://localhost:3000`.

---

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js v24 |
| Bundler | Vite 8 |
| UI | React 19 + TypeScript |
| Estilos | Tailwind CSS v4 (con `@theme`) |
| Routing | React Router v7 |
| HTTP | Axios (con interceptor JWT) |
| Estado global | Zustand (con persistencia `localStorage`) |
| Notificaciones | react-hot-toast |
| Tipografía | Orbitron (display) · Inter (UI) · JetBrains Mono (código) |

---

## Cómo correrlo localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env (copiar .env.example)
#    VITE_API_URL=http://localhost:3000

# 3. Arrancar el dev server
npm run dev      # http://localhost:5173

# Otros:
npm run build    # build de producción a /dist
npm run preview  # servir el build localmente
npm run lint     # ESLint
```

**Requisito:** el backend (`Back-SW2`) debe estar corriendo en el puerto `3000` (o el que apuntes con `VITE_API_URL`).

---

## Estructura del proyecto

```
Front-SW2/
├── mockups/                    # Prototipo original (HTML+JSX puro). Solo referencia visual.
├── public/
├── src/
│   ├── components/
│   │   ├── cardly/             # Componentes de marca: Logo, CartaJugador, Background, Icons
│   │   └── ProtectedRoute.tsx  # HOC de ruta autenticada
│   ├── features/
│   │   └── auth/
│   │       ├── api.ts          # login / register / me
│   │       └── LoginPage.tsx   # Pantalla de Login (responsive, con hero parallax en desktop)
│   ├── lib/
│   │   └── api.ts              # axios instance + JWT interceptor + extractApiError
│   ├── stores/
│   │   └── auth.ts             # Zustand store (token + user, persistido en localStorage)
│   ├── types/
│   │   └── api.ts              # Tipos espejo del back (User, Rol, Rareza, etc.)
│   ├── index.css               # Tailwind v4 + design tokens en @theme
│   ├── main.tsx                # Bootstrap React (RouterProvider + Toaster)
│   └── router.tsx              # Rutas
├── .env.example
├── index.html
├── tsconfig.app.json           # Path alias @/* → ./src/*
└── vite.config.ts              # plugins: @vitejs/plugin-react, @tailwindcss/vite
```

> **Tailwind v4** no usa `tailwind.config.js`: toda la configuración (colores, fuentes, keyframes) vive en `src/index.css` dentro del bloque `@theme`.

---

## Endpoints consumidos (Sprint 1)

| Pantalla | Endpoint del back |
|---|---|
| Login | `POST /auth/login` |
| Registro | `POST /auth/register` |
| Sesión actual | `GET /auth/me` (con `Authorization: Bearer <token>`) |

Endpoints pendientes de integrar:
- `GET /dashboard`, `/dashboard/ranking`, `/dashboard/mis-cartas` — Dashboard
- `GET /ejercicios`, `/ejercicios/:id`, `/ejercicios/activos` — Arena
- `POST /ejercicios/:id/submit` — Resolver
- `GET /modulos`, `/modulos/:id`, `/modulos/:id/ejercicios` — Módulos
- `POST/DELETE /pasos/:id/completar` — Progreso

---

## Diseño · Design tokens

Los tokens viven en `src/index.css` dentro de `@theme`. Tailwind genera utilidades automáticamente:

| Token | Clase Tailwind |
|---|---|
| `--color-bg-base` | `bg-bg-base`, `text-bg-base` |
| `--color-accent-primary` | `bg-accent-primary`, `border-accent-primary`, … |
| `--color-rar-legendaria` | `text-rar-legendaria`, `border-rar-legendaria` |
| `--font-display` | `font-display` |
| `--font-mono` | `font-mono` |
| `--animate-shimmer-slide` | `animate-shimmer-slide` |

Los **mockups originales** están en `mockups/` — son HTML + JSX cargado con Babel standalone. Sirven como referencia visual y para iterar diseño sin tocar el código de producción.

---

## Próximos pasos

- [ ] Portar **Dashboard** (decidir variante A clásica vs B hero-arena del mockup)
- [ ] Portar **Arena** (listado de ejercicios con filtros segmented)
- [ ] Portar **Resolver** (editor Monaco + cronómetro + casos de prueba)
- [ ] Portar **Card Reveal** modal (con Framer Motion para mid-flip y shimmer)
- [ ] Portar **Sidebar + Topbar** (AppShell)
- [ ] Pantallas que el back soporta pero el mockup no tiene: Módulos/Pasos, Ranking, Mis Cartas
- [ ] Estados vacíos / loading / error consistentes

---

## Notas

- El token JWT se persiste en `localStorage` (key `cardly-auth`).
- Cualquier 401 dispara logout automático (limpia el store de Zustand).
- **No commitear `.env`** — está en `.gitignore`.
"# copy" 
