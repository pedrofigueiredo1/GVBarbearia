// ===== EDITAR SERVICO =====
// Ctrl+F "EDITAR SERVICO" para achar este bloco.
import { apiFetch } from '../api';
import type { Servico, ServicoInput } from '@/types/servico';

export function editarServico(id: number, data: ServicoInput) {
  return apiFetch<Servico>(`/servicos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
