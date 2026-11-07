// Período em que a agenda não aceita novos agendamentos. Sem barbeiro
// (`profissionalId` nulo), vale para todos: feriados. As datas são AAAA-MM-DD e
// o fim é inclusivo.
export interface BloqueioAgenda {
  id: number;
  profissionalId: number | null;
  profissional: { id: number; nome: string } | null;
  dataInicio: string;
  dataFim: string;
  motivo: string;
  criadoEm: string;
}

// Ao cadastrar, a API também diz quantos agendamentos ativos já existiam no
// período (eles não são cancelados sozinhos).
export interface BloqueioAgendaCadastrado extends BloqueioAgenda {
  agendamentosAfetados: number;
}

export interface BloqueioAgendaInput {
  profissionalId: number | null;
  dataInicio: string;
  dataFim: string;
  motivo: string;
}
