// ===== EXCLUIR CLIENTE =====
// Ctrl+F "EXCLUIR CLIENTE" para achar este bloco.
import { apiFetch } from '../api';

export function excluirCliente(id: number) {
  return apiFetch<void>(`/clientes/${id}`, { method: 'DELETE' });
}
