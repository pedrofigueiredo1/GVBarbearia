import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Aparar } from '../../comum/decorators/transformacoes';

// Reflete os "Critérios" da US Cadastro de Serviço:
// nome, descrição, valor e duração são obrigatórios.
export class CreateServicoDto {
  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'O nome do serviço é obrigatório.' })
  @MaxLength(100)
  nome: string;

  @Aparar()
  @IsString()
  @IsNotEmpty({ message: 'A descrição do serviço é obrigatória.' })
  @MaxLength(500)
  descricao: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'O valor deve ser um número com até 2 casas decimais.' },
  )
  @IsPositive({ message: 'O valor do serviço deve ser maior que zero.' })
  @Max(99999999.99, { message: 'O valor do serviço é alto demais.' })
  valor: number;

  @IsInt({
    message: 'A duração deve ser informada em minutos (número inteiro).',
  })
  @Min(1, { message: 'A duração deve ser de pelo menos 1 minuto.' })
  @Max(480, {
    message: 'A duração deve ser de no máximo 480 minutos (8 horas).',
  })
  duracaoMinutos: number;
}
