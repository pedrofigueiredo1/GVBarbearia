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

export interface AtendimentoProfissional {
  profissionalId: number;
  nome: string;
  especialidade: string;
  atendimentos: number;
  servicosMaisRealizados: { nome: string; quantidade: number }[];
  avaliacaoMedia: number | null;
  totalAvaliacoes: number;
}

export interface RelatorioAtendimentoProfissional {
  totalAtendimentos: number;
  profissionais: AtendimentoProfissional[];
}

export interface ClienteRelatorio {
  clienteId: number;
  nome: string;
  email: string;
  telefone: string;
  criadoEm: string;
  totalAgendamentos: number;
  agendamentosConcluidos: number;
  ultimoAgendamento: string | null;
  frequente: boolean;
}

export interface RelatorioClientes {
  totalClientes: number;
  novosNoPeriodo: number;
  totalFrequentes: number;
  clientes: ClienteRelatorio[];
}

export interface ComentarioRecente {
  id: number;
  nota: number;
  comentario: string;
  criadoEm: string;
  cliente: string;
  servico: string;
  profissional: string;
}

export interface RelatorioAvaliacoes {
  total: number;
  mediaGeral: number | null;
  distribuicao: Record<number, number>;
  comentariosRecentes: ComentarioRecente[];
}

export interface ServicoMaisAgendado {
  servicoId: number;
  nome: string;
  quantidade: number;
  valorTotalEstimado: string;
}
