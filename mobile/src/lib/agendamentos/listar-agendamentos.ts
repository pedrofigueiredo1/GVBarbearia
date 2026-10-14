// ===== LISTAR AGENDAMENTOS =====
// Ctrl+F "LISTAR AGENDAMENTOS" para achar este bloco.
// US "Consulta de Agendamento" do cliente (item 2.52): só os agendamentos do
// próprio cliente logado.
import { apiFetch } from '../api';
import type { Agendamento } from '@/types/agendamento';

export function listarAgendamentos() {
  return apiFetch<Agendamento[]>('/meus-agendamentos');
}
