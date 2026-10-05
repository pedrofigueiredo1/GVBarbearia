// ===== EDITAR PROFISSIONAL =====
// Ctrl+F "EDITAR PROFISSIONAL" para achar este bloco.
import { apiFetch } from '../api';
import type { Profissional, ProfissionalInput } from '@/types/profissional';

export function editarProfissional(id: number, data: ProfissionalInput) {
  return apiFetch<Profissional>(`/profissionais/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
