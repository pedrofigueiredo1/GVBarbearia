// ===== LISTAR SERVICOS COM RANKING =====
// Ctrl+F "LISTAR SERVICOS COM RANKING" para achar este bloco.
// Ranking de serviços mais agendados que o app do cliente mostra na aba de
// serviços. É calculado a cada consulta, direto dos agendamentos, então não
// há nada para atualizar à mão: quando um agendamento entra ou é cancelado,
// o ranking já muda na próxima vez que o app carregar a lista.
//
// Regras do ranking:
//  - conta os agendamentos dos últimos JANELA_DO_RANKING_DIAS dias (pela data
//    do atendimento), incluindo os já marcados para o futuro;
//  - agendamentos CANCELADOS não contam: não representam procura efetiva;
//  - o serviço com mais agendamentos fica em destaque; em caso de empate, vale
//    o cadastrado primeiro (menor id), para o resultado ser sempre o mesmo;
//  - sem nenhum agendamento no período, nenhum serviço fica em destaque.
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export const JANELA_DO_RANKING_DIAS = 7;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

@Injectable()
export class ListarServicosComRanking {
  constructor(private readonly prisma: PrismaService) {}

  async executar() {
    const desde = new Date(Date.now() - JANELA_DO_RANKING_DIAS * MS_POR_DIA);

    const [servicos, contagens] = await Promise.all([
      this.prisma.servico.findMany({ orderBy: { nome: 'asc' } }),
      this.prisma.agendamento.groupBy({
        by: ['servicoId'],
        where: {
          dataHora: { gte: desde },
          status: { not: StatusAgendamento.CANCELADO },
        },
        _count: { _all: true },
      }),
    ]);

    const totalPorServico = new Map(
      contagens.map((c) => [c.servicoId, c._count._all]),
    );

    let destaque: { id: number; total: number } | null = null;
    for (const servico of servicos) {
      const total = totalPorServico.get(servico.id) ?? 0;
      if (
        total > 0 &&
        (!destaque ||
          total > destaque.total ||
          (total === destaque.total && servico.id < destaque.id))
      ) {
        destaque = { id: servico.id, total };
      }
    }

    return servicos.map((servico) => ({
      ...servico,
      totalAgendamentos: totalPorServico.get(servico.id) ?? 0,
      emDestaque: servico.id === destaque?.id,
      janelaDoRankingDias: JANELA_DO_RANKING_DIAS,
    }));
  }
}
