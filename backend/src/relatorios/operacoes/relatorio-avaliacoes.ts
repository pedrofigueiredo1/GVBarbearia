// ===== RELATORIO DE AVALIACOES =====
// Ctrl+F "RELATORIO DE AVALIACOES" para achar este bloco.
// US "Relatório de Avaliações" (item 2.36 da documentação): média geral,
// distribuição de notas de 1 a 5 e comentários mais recentes. O período
// filtra pela data em que a avaliação foi registrada; profissional e serviço
// vêm do agendamento avaliado. Como o sistema não tem moderação (avaliação
// excluída deixa de existir no banco), o relatório considera todas as
// avaliações atuais.
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltrosRelatorioDto } from '../dto/filtros-relatorio.dto';

const QUANTIDADE_COMENTARIOS_RECENTES = 10;

@Injectable()
export class RelatorioAvaliacoes {
  constructor(private readonly prisma: PrismaService) {}

  async executar(filtros: FiltrosRelatorioDto) {
    const periodo: Prisma.DateTimeFilter = {};
    if (filtros.dataInicio) periodo.gte = new Date(filtros.dataInicio);
    if (filtros.dataFim) periodo.lte = new Date(filtros.dataFim);

    const where: Prisma.AvaliacaoWhereInput = {
      ...(Object.keys(periodo).length > 0 && { criadoEm: periodo }),
      agendamento: {
        ...(filtros.profissionalId !== undefined && { profissionalId: filtros.profissionalId }),
        ...(filtros.servicoId !== undefined && { servicoId: filtros.servicoId }),
      },
    };

    const [resumo, agrupadas, recentes] = await Promise.all([
      this.prisma.avaliacao.aggregate({ where, _avg: { nota: true }, _count: { _all: true } }),
      this.prisma.avaliacao.groupBy({ by: ['nota'], where, _count: { _all: true } }),
      this.prisma.avaliacao.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        take: QUANTIDADE_COMENTARIOS_RECENTES,
        select: {
          id: true,
          nota: true,
          comentario: true,
          criadoEm: true,
          agendamento: {
            select: {
              cliente: { select: { nome: true } },
              servico: { select: { nome: true } },
              profissional: { select: { nome: true } },
            },
          },
        },
      }),
    ]);

    const distribuicao: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const grupo of agrupadas) {
      distribuicao[grupo.nota] = grupo._count._all;
    }

    return {
      total: resumo._count._all,
      mediaGeral: resumo._avg.nota === null ? null : Number(resumo._avg.nota.toFixed(2)),
      distribuicao,
      comentariosRecentes: recentes.map((avaliacao) => ({
        id: avaliacao.id,
        nota: avaliacao.nota,
        comentario: avaliacao.comentario,
        criadoEm: avaliacao.criadoEm,
        cliente: avaliacao.agendamento.cliente.nome,
        servico: avaliacao.agendamento.servico.nome,
        profissional: avaliacao.agendamento.profissional.nome,
      })),
    };
  }
}
