export interface Avaliacao {
  id: number;
  agendamentoId: number;
  nota: number;
  comentario: string;
  criadoEm: string;
  atualizadoEm: string;
  agendamento: {
    id: number;
    dataHora: string;
    cliente: { id: number; nome: string };
    servico: { id: number; nome: string };
    profissional: { id: number; nome: string };
  };
}

// Sem cadastro pelo painel: nota e comentário são os únicos campos
// editáveis (ver comentário em avaliacoes.controller.ts no backend).
export interface AvaliacaoInput {
  nota?: number;
  comentario?: string;
}
