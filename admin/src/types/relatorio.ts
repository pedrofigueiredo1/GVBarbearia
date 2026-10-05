import type { Agendamento, StatusAgendamento } from './agendamento';

export interface FiltrosRelatorio {
  dataInicio?: string;
  dataFim?: string;
  clienteId?: number;
  servicoId?: number;
  profissionalId?: number;
}

export interface RelatorioAgendamentos {
  totais: Record<StatusAgendamento, number>;
  total: number;
  agendamentos: Agendamento[];
}

export interface ServicoMaisAgendado {
  servicoId: number;
  nome: string;
  quantidade: number;
  valorTotalEstimado: string;
}
