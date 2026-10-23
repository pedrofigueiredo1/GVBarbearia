import { Type } from 'class-transformer';
import { IsInt, Matches, Min } from 'class-validator';

// Parâmetros da consulta de horários livres: serviço (define a duração),
// profissional e o dia. Chegam na URL, por isso `@Type(() => Number)` converte
// o texto em número antes da validação.
export class ConsultarHorariosDisponiveisDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  servicoId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  profissionalId: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Informe a data no formato AAAA-MM-DD.',
  })
  data: string;
}
