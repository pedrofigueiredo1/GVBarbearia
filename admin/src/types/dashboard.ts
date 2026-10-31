import type { StatusAgendamento } from './agendamento';

export interface Totais {
  atendimentos: number;
  faturamento: number;
}

export interface PeriodoComComparacao extends Totais {
  anterior: Totais;
}

export interface Passagem {
  hoje: PeriodoComComparacao;
  ontem: PeriodoComComparacao;
  ultimos7Dias: PeriodoComComparacao;
  ultimos30Dias: PeriodoComComparacao;
  mesAtual: PeriodoComComparacao;
}

export interface AgendamentoResumo {
  id: number;
  dataHora: string;
  status: StatusAgendamento;
  cliente: { id: number; nome: string };
  servico: { id: number; nome: string; duracaoMinutos: number };
  profissional: { id: number; nome: string };
}

export interface ItemDeRanking extends Totais {
  nome: string;
}

export interface Indicadores {
  agendamentos: { total: number; cancelados: number; taxaCancelamento: number };
  clientes: { novos: number; frequentes: number };
  topServicos: ItemDeRanking[];
  porProfissional: ItemDeRanking[];
  avaliacoes: {
    mediaGeral: number | null;
    totalGeral: number;
    mediaPeriodo: number | null;
    totalPeriodo: number;
  };
}

export interface Dashboard {
  passagem: Passagem;
  agendaHoje: AgendamentoResumo[];
  pendentes: AgendamentoResumo[];
  pendentesTotal: number;
  indicadores: Indicadores;
}
