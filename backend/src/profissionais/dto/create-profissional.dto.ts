import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Reflete os "Critérios" da US Cadastro de Profissional:
// nome, especialidade e descrição são obrigatórios.
export class CreateProfissionalDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do profissional é obrigatório.' })
  @MaxLength(100)
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'A especialidade do profissional é obrigatória.' })
  @MaxLength(100)
  especialidade: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição do profissional é obrigatória.' })
  @MaxLength(500)
  descricao: string;
}
