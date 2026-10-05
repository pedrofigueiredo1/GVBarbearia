// Filtros de período e de vínculo usados pelos relatórios que leem Agendamento.
import { Prisma } from '@prisma/client';
import { FiltrosRelatorioDto } from '../dto/filtros-relatorio.dto';

export function montarWhereAgendamentos(
  filtros: FiltrosRelatorioDto,
): Prisma.AgendamentoWhereInput {
  const periodo: Prisma.DateTimeFilter = {};
  if (filtros.dataInicio) periodo.gte = new Date(filtros.dataInicio);
  if (filtros.dataFim) periodo.lte = new Date(filtros.dataFim);

  return {
    ...(Object.keys(periodo).length > 0 && { dataHora: periodo }),
    ...(filtros.clienteId !== undefined && { clienteId: filtros.clienteId }),
    ...(filtros.servicoId !== undefined && { servicoId: filtros.servicoId }),
    ...(filtros.profissionalId !== undefined && { profissionalId: filtros.profissionalId }),
  };
}
