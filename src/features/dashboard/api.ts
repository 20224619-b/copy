import { api } from '@/lib/api';
import type {
  DashboardSummary,
  EjerciciosActivosResponse,
  MisCartasResponse,
  RankingResponse,
} from '@/types/api';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/dashboard');
  return data;
}

export async function getRanking(limit = 10): Promise<RankingResponse> {
  const { data } = await api.get<RankingResponse>('/dashboard/ranking', {
    params: { limit },
  });
  return data;
}

export async function getMisCartas(): Promise<MisCartasResponse> {
  const { data } = await api.get<MisCartasResponse>('/dashboard/mis-cartas');
  return data;
}

export async function getEjerciciosActivos(): Promise<EjerciciosActivosResponse> {
  const { data } = await api.get<EjerciciosActivosResponse>('/ejercicios/activos');
  return data;
}
