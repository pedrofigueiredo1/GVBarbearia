// ===== EXCLUIR ADMINISTRADOR =====
// Ctrl+F "EXCLUIR ADMINISTRADOR" para achar este bloco.
import { apiFetch } from '../api';

export function excluirAdministrador(id: number) {
  return apiFetch<void>(`/administradores/${id}`, { method: 'DELETE' });
}
