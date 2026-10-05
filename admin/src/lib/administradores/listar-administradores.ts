// ===== LISTAR ADMINISTRADORES =====
// Ctrl+F "LISTAR ADMINISTRADORES" para achar este bloco.
import { apiFetch } from '../api';
import type { Administrador } from '@/types/administrador';

export function listarAdministradores() {
  return apiFetch<Administrador[]>('/administradores');
}
