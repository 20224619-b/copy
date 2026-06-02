import { api } from '@/lib/api';
import type {
  AsignarEjercicioResponse,
  Dificultad,
  EjercicioDetail,
  EjerciciosActivosResponse,
  EjerciciosListResponse,
  SubmitRequest,
  SubmitResponse,
} from '@/types/api';

export interface EjerciciosFilters {
  moduloId?: number;
  dificultad?: Dificultad;
  lenguaje?: string;
}

export async function getEjercicios(filters: EjerciciosFilters = {}): Promise<EjerciciosListResponse> {
  const { data } = await api.get<EjerciciosListResponse>('/ejercicios', { params: filters });
  return data;
}

export async function getEjerciciosActivos(): Promise<EjerciciosActivosResponse> {
  const { data } = await api.get<EjerciciosActivosResponse>('/ejercicios/activos');
  return data;
}

export async function asignarEjercicio(ejercicioId: number): Promise<AsignarEjercicioResponse> {
  const { data } = await api.post<AsignarEjercicioResponse>('/ejercicios/activos', {
    ejercicioId,
  });
  return data;
}

export async function getEjercicioDetail(id: number): Promise<EjercicioDetail> {
  const { data } = await api.get<EjercicioDetail>(`/ejercicios/${id}`);
  return data;
}

export async function submitEjercicio(
  id: number,
  body: SubmitRequest,
): Promise<SubmitResponse> {
  const { data } = await api.post<SubmitResponse>(`/ejercicios/${id}/submit`, body);
  return data;
}
