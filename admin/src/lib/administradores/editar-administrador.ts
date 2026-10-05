// ===== EDITAR ADMINISTRADOR =====
// Ctrl+F "EDITAR ADMINISTRADOR" para achar este bloco.
import { apiFetch } from '../api';
import type { Administrador, AdministradorInput } from '@/types/administrador';

export function editarAdministrador(id: number, data: AdministradorInput) {
  return apiFetch<Administrador>(`/administradores/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
