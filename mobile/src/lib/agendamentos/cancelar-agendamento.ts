// ===== CANCELAR AGENDAMENTO =====
// Ctrl+F "CANCELAR AGENDAMENTO" para achar este bloco.
// US "Cancelamento de Agendamento pelo Cliente" (item 2.53). O backend exige
// no mínimo 2 horas de antecedência e só deixa o dono do agendamento cancelar.
import { apiFetch } from '../api';
import type { Agendamento } from '@/types/agendamento';

export function cancelarAgendamento(id: number) {
  return apiFetch<Agendamento>(`/meus-agendamentos/${id}`, { method: 'DELETE' });
}
