// ===== RELATORIO DE SERVICOS MAIS AGENDADOS =====
// Ctrl+F "RELATORIO DE SERVICOS MAIS AGENDADOS" para achar este bloco.
// US "Relatório de Serviços mais Agendados" (item 2.33 da documentação).
// Agendamentos cancelados ficam de fora: não representam procura efetiva
// nem receita. Serviço sem agendamento no período não aparece no ranking.
import { Injectable } from '@nestjs/common';
import { StatusAgendamento } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltrosRelatorioDto } from '../dto/filtros-relatorio.dto';
import { montarWhereAgendamentos } from './compartilhado';

@Injectable()
export class RelatorioServicosMaisAgendados {
  constructor(private readonly prisma: PrismaService) {}

  async executar(filtros: FiltrosRelatorioDto) {
    const where = {
      ...montarWhereAgendamentos(filtros),
      status: { not: StatusAgendamento.CANCELADO },
    };

    const agrupados = await this.prisma.agendamento.groupBy({
      by: ['servicoId'],
      where,
      _count: { _all: true },
      orderBy: { _count: { servicoId: 'desc' } },
    });

    const servicos = await this.prisma.servico.findMany({
      where: { id: { in: agrupados.map((grupo) => grupo.servicoId) } },
    });
    const servicoPorId = new Map(servicos.map((servico) => [servico.id, servico]));

    return agrupados.map((grupo) => {
      const servico = servicoPorId.get(grupo.servicoId)!;
      const quantidade = grupo._count._all;
      return {
        servicoId: servico.id,
        nome: servico.nome,
        quantidade,
        valorTotalEstimado: (Number(servico.valor) * quantidade).toFixed(2),
      };
    });
  }
}
