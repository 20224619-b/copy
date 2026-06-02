// Tipos espejo del backend (Back-SW2).
// Mantener sincronizados con prisma/schema.prisma del back.

export type Rol = 'ALUMNO' | 'PROFESOR' | 'ADMIN';
export type Rareza = 'COMUN' | 'RARA' | 'EPICA' | 'LEGENDARIA';
export type EstadoEjercicio = 'PENDIENTE' | 'RESUELTO';
export type Dificultad = 'FACIL' | 'MEDIO' | 'DIFICIL';
export type TipoRecompensa = 'PUNTOS' | 'MONEDAS' | 'CARTA';

// User devuelto por el back (toPublicUser: user sin passwordHash).
export interface User {
  id: number;
  username: string;
  email: string;
  rol: Rol;
  puntos: number;
  monedas: number;
  rachaEjercicios: number;
  tiempoJugadoSeg: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// GET /dashboard
export interface DashboardSummary {
  usuario: { id: number; username: string; email: string };
  stats: {
    puntos: number;
    monedas: number;
    rachaEjercicios: number;
    tiempoJugadoSeg: number;
    totalCartas: number;
    ejerciciosResueltos: number;
  };
  ranking: { posicion: number; mejorPuntaje: number };
}

// GET /dashboard/ranking
export interface RankingItem {
  posicion: number;
  id: number;
  username: string;
  puntos: number;
  rachaEjercicios: number;
}

export interface RankingResponse {
  items: RankingItem[];
  total: number;
}

// GET /dashboard/mis-cartas
export interface CartaNivelData {
  id: number;
  nivel: number;
  dano: number;
  salud: number;
  mana: number;
  danoHabilidad: number;
}

export interface UsuarioCartaItem {
  id: number;
  nivelActual: number;
  enMazo: boolean;
  obtenidaEn: string;
  carta: {
    id: number;
    nombre: string;
    descripcion: string;
    rareza: Rareza;
    imagen: string;
    habilidad: string;
    niveles: CartaNivelData[];
  };
}

export interface MisCartasResponse {
  items: UsuarioCartaItem[];
  total: number;
}

// GET /ejercicios/activos
export interface EjercicioActivoItem {
  id: number;
  estado: EstadoEjercicio;
  fechaAsignacion: string;
  ejercicio: {
    id: number;
    titulo: string;
    dificultad: Dificultad;
    lenguaje: string;
  };
}

export interface EjerciciosActivosResponse {
  items: EjercicioActivoItem[];
  total: number;
}

// GET /ejercicios (sin solucionesCodigo)
export interface EjercicioListItem {
  id: number;
  titulo: string;
  descripcion: string;
  dificultad: Dificultad;
  lenguaje: string;
  tiempoEstimadoSeg: number;
  moduloId: number | null;
  casosPrueba: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface EjerciciosListResponse {
  items: EjercicioListItem[];
  total: number;
}

// POST /ejercicios/activos (asignación)
export interface AsignarEjercicioResponse {
  id: number;
  estado: EstadoEjercicio;
  fechaAsignacion: string;
  ejercicio: Omit<EjercicioListItem, 'casosPrueba'> & { casosPrueba?: unknown };
}

export interface CasoPrueba {
  input: string;
  outputEsperado: string;
}

export interface RecompensaSpec {
  id: number;
  tipo: TipoRecompensa;
  probabilidad: string; // Decimal serializado como string por Prisma
  cantidad: number;
}

// GET /ejercicios/:id
export interface EjercicioDetail {
  id: number;
  titulo: string;
  descripcion: string;
  dificultad: Dificultad;
  lenguaje: string;
  tiempoEstimadoSeg: number;
  moduloId: number | null;
  casosPrueba: CasoPrueba[];
  modulo?: { id: number; titulo: string } | null;
  recompensas?: RecompensaSpec[];
  createdAt: string;
  updatedAt: string;
}

// POST /ejercicios/:id/submit
export type TipoSubmit = 'codigo' | 'output';

export interface SubmitRequest {
  tipo: TipoSubmit;
  respuesta: string | string[];
  tiempoResolucionSeg: number;
}

export type RecompensaOtorgada =
  | { tipo: 'PUNTOS'; cantidad: number }
  | { tipo: 'MONEDAS'; cantidad: number }
  | { tipo: 'CARTA'; carta: { id: number; nombre: string; rareza: Rareza; imagen: string } };

export interface SubmitResponse {
  correcto: boolean;
  motivo?: string;
  tiempoResolucionSeg: number;
  recompensas: RecompensaOtorgada[];
  puntosActuales: number;
  monedasActuales: number;
  rachaEjercicios: number;
  solucionEjemplo?: string;
}

// GET /modulos
export interface ModuloListItem {
  id: number;
  titulo: string;
  descripcion: string;
  orden: number;
  totalPasos: number;
  totalEjercicios: number;
  progreso: { completados: number; total: number; porcentaje: number } | null;
}

export interface ModulosListResponse {
  items: ModuloListItem[];
  total: number;
}

export interface PasoItem {
  id: number;
  titulo: string;
  contenidoTextual: string;
  video: string | null;
  orden: number;
  completado: boolean;
}

export interface ModuloDetail {
  id: number;
  titulo: string;
  descripcion: string;
  orden: number;
  pasos: PasoItem[];
}

export interface ModuloEjercicioItem {
  id: number;
  titulo: string;
  descripcion: string;
  dificultad: Dificultad;
  lenguaje: string;
  tiempoEstimadoSeg: number;
}

export interface ModuloEjerciciosResponse {
  modulo: { id: number; titulo: string };
  items: ModuloEjercicioItem[];
  total: number;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
