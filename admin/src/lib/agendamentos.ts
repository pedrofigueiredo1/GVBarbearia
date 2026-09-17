import { apiFetch } from './api';
import type {
  Agendamento,
  CreateAgendamentoInput,
  UpdateAgendamentoInput,
} from '@/types/agendamento';

export function listarAgendamentos() {
  return apiFetch<Agendamento[]>('/agendamentos');
}

export function criarAgendamento(data: CreateAgendamentoInput) {
  return apiFetch<Agendamento>('/agendamentos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function editarAgendamento(id: number, data: UpdateAgendamentoInput) {
  return apiFetch<Agendamento>(`/agendamentos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// "Excluir" no painel cancela o agendamento (muda status) em vez de apagar
// o registro — ver comentário em agendamentos.service.ts no backend.
export function cancelarAgendamento(id: number) {
  return apiFetch<Agendamento>(`/agendamentos/${id}`, { method: 'DELETE' });
}
