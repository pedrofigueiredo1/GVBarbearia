import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, Min } from 'class-validator';

// Reflete os "Critérios" da US Cadastro de Serviço:
// nome, descrição, valor e duração são obrigatórios.
export class CreateServicoDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do serviço é obrigatório.' })
  @MaxLength(100)
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição do serviço é obrigatória.' })
  @MaxLength(500)
  descricao: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O valor deve ser um número com até 2 casas decimais.' })
  @IsPositive({ message: 'O valor do serviço deve ser maior que zero.' })
  valor: number;

  @IsInt({ message: 'A duração deve ser informada em minutos (número inteiro).' })
  @Min(1, { message: 'A duração deve ser de pelo menos 1 minuto.' })
  duracaoMinutos: number;
}
