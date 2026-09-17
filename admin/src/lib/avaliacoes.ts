import { apiFetch } from './api';
import type { Avaliacao, AvaliacaoInput } from '@/types/avaliacao';

export function listarAvaliacoes() {
  return apiFetch<Avaliacao[]>('/avaliacoes');
}

export function editarAvaliacao(id: number, data: AvaliacaoInput) {
  return apiFetch<Avaliacao>(`/avaliacoes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function excluirAvaliacao(id: number) {
  return apiFetch<void>(`/avaliacoes/${id}`, { method: 'DELETE' });
}
