// ===== CADASTRAR AGENDAMENTO =====
// Ctrl+F "CADASTRAR AGENDAMENTO" para achar este bloco.
// US "Cadastro de Agendamento" do cliente (item 2.49). O cliente é o dono do
// token; o backend cria o agendamento como PENDENTE.
import { apiFetch } from '../api';
import type { Agendamento, NovoAgendamentoInput } from '@/types/agendamento';

export function adicionarAgendamento(data: NovoAgendamentoInput) {
  return apiFetch<Agendamento>('/meus-agendamentos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
