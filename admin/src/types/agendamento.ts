export type StatusAgendamento = 'PENDENTE' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO';

export const STATUS_LABEL: Record<StatusAgendamento, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
};

export interface Agendamento {
  id: number;
  clienteId: number;
  servicoId: number;
  profissionalId: number;
  dataHora: string;
  status: StatusAgendamento;
  criadoEm: string;
  atualizadoEm: string;
  cliente: { id: number; nome: string; email: string; telefone: string };
  servico: { id: number; nome: string; valor: string; duracaoMinutos: number };
  profissional: { id: number; nome: string; especialidade: string };
}

// Cadastro pelo admin nunca envia `status` — nasce sempre CONFIRMADO,
// decidido no backend (ver create() em agendamentos.service.ts).
export interface CreateAgendamentoInput {
  clienteId: number;
  servicoId: number;
  profissionalId: number;
  dataHora: string;
}

export interface UpdateAgendamentoInput {
  clienteId?: number;
  servicoId?: number;
  profissionalId?: number;
  dataHora?: string;
  status?: StatusAgendamento;
}

// Um horário livre: `hora` ('09:30') é para mostrar. As horas são as de
// Brasília, as mesmas da barbearia.
export interface HorarioDisponivel {
  hora: string;
  dataHora: string;
}

export interface HorariosDisponiveis {
  data: string;
  horarios: HorarioDisponivel[];
  // Dia fechado pelo administrador (feriado, ausência do barbeiro).
  bloqueado: boolean;
}
