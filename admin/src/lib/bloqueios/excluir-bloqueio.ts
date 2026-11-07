// ===== EXCLUIR BLOQUEIO DE AGENDA =====
// Ctrl+F "EXCLUIR BLOQUEIO DE AGENDA" para achar este bloco.
import { apiFetch } from '../api';

export function excluirBloqueio(id: number) {
  return apiFetch<void>(`/bloqueios-agenda/${id}`, { method: 'DELETE' });
}
