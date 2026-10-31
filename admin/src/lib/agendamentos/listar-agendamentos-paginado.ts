// ===== LISTAR AGENDAMENTOS PAGINADO =====
// Ctrl+F "LISTAR AGENDAMENTOS PAGINADO" para achar este bloco.
// Uma página de agendamentos por vez, com busca, filtros e ordenação no servidor.
import { apiFetch } from '../api';
import { montarQuery } from '../relatorios/montar-query';
import type { ParametrosPagina } from '@/hooks/useTabelaServidor';
import type { Agendamento } from '@/types/agendamento';
import type { Pagina } from '@/types/tabela';

export interface FiltrosAgendamentos {
  status?: string;
  profissionalId?: number | string;
  servicoId?: number | string;
  dataInicio?: string;
  dataFim?: string;
}

export function listarAgendamentosPaginado(parametros: ParametrosPagina & FiltrosAgendamentos) {
  // O servidor ordena só por data; a coluna é só um clique de inverter a direção.
  const resto: Record<string, unknown> = { ...parametros };
  delete resto.ordenarPor;
  return apiFetch<Pagina<Agendamento>>(`/agendamentos/paginado${montarQuery(resto)}`);
}
