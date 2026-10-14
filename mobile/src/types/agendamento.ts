export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO';

export const STATUS_LABEL: Record<StatusAgendamento, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

export interface Agendamento {
  id: number;
  dataHora: string;
  status: StatusAgendamento;
  servico: { id: number; nome: string; valor: string; duracaoMinutos: number };
  profissional: { id: number; nome: string; especialidade: string };
}

export interface NovoAgendamentoInput {
  servicoId: number;
  profissionalId: number;
  dataHora: string;
}
