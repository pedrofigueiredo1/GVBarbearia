// ===== CANCELAR AGENDAMENTO =====
// Ctrl+F "CANCELAR AGENDAMENTO" para achar este bloco.
// "Excluir" no painel cancela o agendamento (muda status) em vez de apagar
// o registro — ver comentário em cancelar-agendamento.ts no backend.
import { apiFetch } from '../api';
import type { Agendamento } from '@/types/agendamento';

export function cancelarAgendamento(id: number) {
  return apiFetch<Agendamento>(`/agendamentos/${id}`, { method: 'DELETE' });
}
