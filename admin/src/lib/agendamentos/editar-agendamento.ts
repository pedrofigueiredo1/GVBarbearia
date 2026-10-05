// ===== EDITAR AGENDAMENTO =====
// Ctrl+F "EDITAR AGENDAMENTO" para achar este bloco.
import { apiFetch } from '../api';
import type { Agendamento, UpdateAgendamentoInput } from '@/types/agendamento';

export function editarAgendamento(id: number, data: UpdateAgendamentoInput) {
  return apiFetch<Agendamento>(`/agendamentos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
