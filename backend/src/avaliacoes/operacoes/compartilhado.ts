// A US Consulta de Avaliação exige exibir "autor, nota e comentário" — o
// autor vem do cliente do agendamento vinculado, por isso toda leitura de
// avaliação inclui essa relação.
export const INCLUDE_AGENDAMENTO = {
  agendamento: {
    select: {
      id: true,
      dataHora: true,
      cliente: { select: { id: true, nome: true } },
      servico: { select: { id: true, nome: true } },
      profissional: { select: { id: true, nome: true } },
    },
  },
};
