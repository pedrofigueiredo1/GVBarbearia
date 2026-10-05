// ===== EXCLUIR PROFISSIONAL =====
// Ctrl+F "EXCLUIR PROFISSIONAL" para achar este bloco.
import { apiFetch } from '../api';

export function excluirProfissional(id: number) {
  return apiFetch<void>(`/profissionais/${id}`, { method: 'DELETE' });
}
