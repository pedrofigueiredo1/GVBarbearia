// ===== EXCLUIR SERVICO =====
// Ctrl+F "EXCLUIR SERVICO" para achar este bloco.
import { apiFetch } from '../api';

export function excluirServico(id: number) {
  return apiFetch<void>(`/servicos/${id}`, { method: 'DELETE' });
}
