import { api } from '@/lib/api';
import type {
  ModuloDetail,
  ModuloEjerciciosResponse,
  ModulosListResponse,
} from '@/types/api';

export async function getModulos(): Promise<ModulosListResponse> {
  const { data } = await api.get<ModulosListResponse>('/modulos');
  return data;
}

export async function getModuloDetail(id: number): Promise<ModuloDetail> {
  const { data } = await api.get<ModuloDetail>(`/modulos/${id}`);
  return data;
}

export async function getModuloEjercicios(id: number): Promise<ModuloEjerciciosResponse> {
  const { data } = await api.get<ModuloEjerciciosResponse>(`/modulos/${id}/ejercicios`);
  return data;
}

export async function completarPaso(pasoId: number): Promise<void> {
  await api.post(`/pasos/${pasoId}/completar`);
}

export async function descompletarPaso(pasoId: number): Promise<void> {
  await api.delete(`/pasos/${pasoId}/completar`);
}
