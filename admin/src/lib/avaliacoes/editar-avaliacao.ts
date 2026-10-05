// ===== EDITAR AVALIACAO =====
// Ctrl+F "EDITAR AVALIACAO" para achar este bloco.
import { apiFetch } from '../api';
import type { Avaliacao, AvaliacaoInput } from '@/types/avaliacao';

export function editarAvaliacao(id: number, data: AvaliacaoInput) {
  return apiFetch<Avaliacao>(`/avaliacoes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
