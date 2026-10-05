// ===== ADICIONAR AGENDAMENTO =====
// Ctrl+F "ADICIONAR AGENDAMENTO" para achar este bloco.
import { apiFetch } from '../api';
import type { Agendamento, CreateAgendamentoInput } from '@/types/agendamento';

export function criarAgendamento(data: CreateAgendamentoInput) {
  return apiFetch<Agendamento>('/agendamentos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
