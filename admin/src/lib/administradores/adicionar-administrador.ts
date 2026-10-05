// ===== ADICIONAR ADMINISTRADOR =====
// Ctrl+F "ADICIONAR ADMINISTRADOR" para achar este bloco.
import { apiFetch } from '../api';
import type { Administrador, AdministradorInput } from '@/types/administrador';

export function criarAdministrador(data: Required<AdministradorInput>) {
  return apiFetch<Administrador>('/administradores', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
