// ===== LISTAR AGENDAMENTOS =====
// Ctrl+F "LISTAR AGENDAMENTOS" para achar este bloco.
// Sem filtros traz todos; com período e/ou profissional (usado pelo
// calendário) traz só o recorte pedido.
import { apiFetch } from '../api';
import { montarQuery } from '../relatorios/montar-query';
import type { Agendamento } from '@/types/agendamento';

export interface FiltrosListagem {
  dataInicio?: string;
  dataFim?: string;
  profissionalId?: number;
  status?: string;
}

export function listarAgendamentos(filtros: FiltrosListagem = {}) {
  return apiFetch<Agendamento[]>(`/agendamentos${montarQuery(filtros)}`);
}
