// ===== EXCLUIR AVALIACAO =====
// Ctrl+F "EXCLUIR AVALIACAO" para achar este bloco.
import { apiFetch } from '../api';

export function excluirAvaliacao(id: number) {
  return apiFetch<void>(`/avaliacoes/${id}`, { method: 'DELETE' });
}
