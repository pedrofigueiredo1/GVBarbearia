// Filtros de período e de vínculo usados pelos relatórios que leem Agendamento.
import { Prisma } from '@prisma/client';
import { FiltrosRelatorioDto } from '../dto/filtros-relatorio.dto';

// US Relatório de Clientes (item 2.35): cliente frequente = 5 ou mais
// agendamentos concluídos.
export const CLIENTE_FREQUENTE_MINIMO_CONCLUIDOS = 5;

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
