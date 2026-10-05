// ===== EXCLUIR PRODUTO =====
// Ctrl+F "EXCLUIR PRODUTO" para achar este bloco.
import { apiFetch } from '../api';

export function excluirProduto(id: number) {
  return apiFetch<void>(`/produtos/${id}`, { method: 'DELETE' });
}
