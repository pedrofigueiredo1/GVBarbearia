// ===== RELATORIO DE AGENDAMENTOS =====
// Ctrl+F "RELATORIO DE AGENDAMENTOS" para achar este bloco.
// US "Relatório de Agendamentos" (item 2.32 da documentação): totais por
// status no período filtrado + a lista detalhada (usada na exportação CSV).
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { INCLUDE_RELACOES } from '../../agendamentos/operacoes/compartilhado';
import { FiltrosRelatorioDto } from '../dto/filtros-relatorio.dto';
import { montarWhereAgendamentos } from './compartilhado';

@Injectable()
export class RelatorioAgendamentos {
  constructor(private readonly prisma: PrismaService) {}

  async executar(filtros: FiltrosRelatorioDto) {
    const where = montarWhereAgendamentos(filtros);

    const [agrupados, agendamentos] = await Promise.all([
      this.prisma.agendamento.groupBy({ by: ['status'], where, _count: { _all: true } }),
      this.prisma.agendamento.findMany({
        where,
        include: INCLUDE_RELACOES,
        orderBy: { dataHora: 'asc' },
      }),
    ]);

    const totais = Object.fromEntries(
      Object.values(StatusAgendamento).map((status) => [status, 0]),
    ) as Record<StatusAgendamento, number>;
    for (const grupo of agrupados) {
      totais[grupo.status] = grupo._count._all;
    }

    return { totais, total: agendamentos.length, agendamentos };
  }
}
