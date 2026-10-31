import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { StatusAgendamento } from '@prisma/client';

// Filtros opcionais das listagens de agendamento do painel. Sem nenhum, a
// listagem devolve todos. Os ids chegam como texto na URL, por isso o @Type.
export class FiltrosAgendamentoDto {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data inicial deve estar no formato ISO 8601.' },
  )
  dataInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'A data final deve estar no formato ISO 8601.' })
  dataFim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  profissionalId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  servicoId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clienteId?: number;

  @IsOptional()
  @IsEnum(StatusAgendamento, { message: 'Status inválido.' })
  status?: StatusAgendamento;
}
