import { apiFetch } from './api';
import type { Servico, ServicoInput } from '@/types/servico';

export function listarServicos() {
  return apiFetch<Servico[]>('/servicos');
}

export function criarServico(data: ServicoInput) {
  return apiFetch<Servico>('/servicos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function editarServico(id: number, data: ServicoInput) {
  return apiFetch<Servico>(`/servicos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function excluirServico(id: number) {
  return apiFetch<void>(`/servicos/${id}`, { method: 'DELETE' });
}
