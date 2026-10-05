import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

// Todos os filtros são opcionais: sem nenhum, o relatório considera todos os
// agendamentos. Os ids chegam como string na query, por isso o @Type.
export class FiltrosRelatorioDto {
  @IsOptional()
  @IsDateString({}, { message: 'A data inicial deve estar no formato ISO 8601.' })
  dataInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'A data final deve estar no formato ISO 8601.' })
  dataFim?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clienteId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  servicoId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  profissionalId?: number;
}
