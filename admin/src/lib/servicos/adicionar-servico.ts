// ===== ADICIONAR SERVICO =====
// Ctrl+F "ADICIONAR SERVICO" para achar este bloco.
import { apiFetch } from '../api';
import type { Servico, ServicoInput } from '@/types/servico';

export function criarServico(data: ServicoInput) {
  return apiFetch<Servico>('/servicos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
