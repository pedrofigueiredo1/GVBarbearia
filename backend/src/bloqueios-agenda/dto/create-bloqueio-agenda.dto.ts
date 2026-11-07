import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Aparar } from '../../comum/decorators/transformacoes';

const FORMATO_DATA = {
  message: 'Informe a data no formato AAAA-MM-DD.',
};

// Sem `profissionalId` (ou nulo), o bloqueio vale para todos os barbeiros: é o
// caso de feriados. Com ele, vale só para aquele barbeiro (folga, férias,
// atestado). `dataFim` é inclusiva; para um dia só, é igual a `dataInicio`.
export class CreateBloqueioAgendaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  profissionalId?: number | null;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, FORMATO_DATA)
  dataInicio: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, FORMATO_DATA)
  dataFim: string;

  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'Informe o motivo do bloqueio.' })
  @MaxLength(120)
  motivo: string;
}
