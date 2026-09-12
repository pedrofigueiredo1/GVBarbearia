import { apiFetch } from './api';
import type { Profissional, ProfissionalInput } from '@/types/profissional';

export function listarProfissionais() {
  return apiFetch<Profissional[]>('/profissionais');
}

export function criarProfissional(data: ProfissionalInput) {
  return apiFetch<Profissional>('/profissionais', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function editarProfissional(id: number, data: ProfissionalInput) {
  return apiFetch<Profissional>(`/profissionais/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function excluirProfissional(id: number) {
  return apiFetch<void>(`/profissionais/${id}`, { method: 'DELETE' });
}
