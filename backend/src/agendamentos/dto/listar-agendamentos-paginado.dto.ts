import { IntersectionType } from '@nestjs/mapped-types';
import { PaginacaoDto } from '../../comum/dto/paginacao.dto';
import { FiltrosAgendamentoDto } from './filtros-agendamento.dto';

// Listagem paginada do painel: paginação, busca e os filtros de agendamento.
export class ListarAgendamentosPaginadoDto extends IntersectionType(
  PaginacaoDto,
  FiltrosAgendamentoDto,
) {}
