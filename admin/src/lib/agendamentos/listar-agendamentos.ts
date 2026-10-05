// ===== LISTAR AGENDAMENTOS =====
// Ctrl+F "LISTAR AGENDAMENTOS" para achar este bloco.
import { apiFetch } from '../api';
import type { Agendamento } from '@/types/agendamento';

export function listarAgendamentos() {
  return apiFetch<Agendamento[]>('/agendamentos');
}
