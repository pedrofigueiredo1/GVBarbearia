// ===== LISTAR AGENDAMENTOS =====
// Ctrl+F "LISTAR AGENDAMENTOS" para achar este bloco.
// US "Consulta de Agendamento" (item 2.25 da documentação). Sem filtros devolve
// todos; com período e/ou profissional (usado pelo calendário do painel)
// devolve só os do recorte pedido.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltrosAgendamentoDto } from '../dto/filtros-agendamento.dto';
import { INCLUDE_RELACOES, montarWhereAgendamentos } from './compartilhado';

@Injectable()
export class ListarAgendamentos {
  constructor(private readonly prisma: PrismaService) {}

  executar(filtros: FiltrosAgendamentoDto = {}) {
    return this.prisma.agendamento.findMany({
      where: montarWhereAgendamentos(filtros),
      include: INCLUDE_RELACOES,
      orderBy: { dataHora: 'asc' },
    });
  }
}
