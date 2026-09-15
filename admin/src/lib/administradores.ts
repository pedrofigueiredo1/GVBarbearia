import { apiFetch } from './api';
import type { Administrador, AdministradorInput } from '@/types/administrador';

export function listarAdministradores() {
  return apiFetch<Administrador[]>('/administradores');
}

export function criarAdministrador(data: Required<AdministradorInput>) {
  return apiFetch<Administrador>('/administradores', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function editarAdministrador(id: number, data: AdministradorInput) {
  return apiFetch<Administrador>(`/administradores/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function excluirAdministrador(id: number) {
  return apiFetch<void>(`/administradores/${id}`, { method: 'DELETE' });
}
