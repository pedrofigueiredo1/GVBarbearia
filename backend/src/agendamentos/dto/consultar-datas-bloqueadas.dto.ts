import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

// Parâmetro da consulta de datas bloqueadas: o profissional escolhido.
export class ConsultarDatasBloqueadasDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  profissionalId: number;
}
